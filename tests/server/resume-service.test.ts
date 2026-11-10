import { beforeEach, describe, expect, it } from "vitest";
import { createEmptyDocument, createSampleDocument } from "@/features/resume-builder/defaults";
import {
  FREE_ENTITLEMENTS,
  resolveEntitlements,
  type Entitlements,
} from "@/server/billing/entitlements";
import { createResumeService } from "@/server/resumes/service";
import { createMemoryResumeRepository } from "../helpers/memory-resume-repository";

const PRO: Entitlements = resolveEntitlements({
  subscriptions: [],
  purchases: [],
  now: new Date(),
  devProUnlock: true,
  isDevelopment: true,
});
const FREE = FREE_ENTITLEMENTS;

describe("resume service", () => {
  let repo: ReturnType<typeof createMemoryResumeRepository>;
  let service: ReturnType<typeof createResumeService>;

  beforeEach(() => {
    repo = createMemoryResumeRepository();
    service = createResumeService(repo);
  });

  it("creates a blank resume and lists it", async () => {
    const created = await service.create("alice", FREE);
    expect(created.ok).toBe(true);
    const list = await service.list("alice");
    expect(list).toHaveLength(1);
    expect(list[0]?.title).toBe("My resume");
  });

  it("imports a validated draft", async () => {
    const created = await service.create("alice", FREE, createSampleDocument());
    if (!created.ok) throw new Error("create failed");
    const fetched = await service.get("alice", created.id);
    if (!fetched.ok) throw new Error("get failed");
    expect(fetched.document.profile.fullName).toBe("Maya Johnson");
  });

  it("rejects invalid documents and strips unknown fields", async () => {
    expect(await service.create("alice", FREE, { nope: true })).toEqual({
      ok: false,
      error: "invalid",
    });
    const created = await service.create("alice", PRO, {
      ...createEmptyDocument(),
      injected: "<script>",
    });
    if (!created.ok) throw new Error("create failed");
    expect(JSON.stringify(repo.rows.get(created.id)?.content)).not.toContain("injected");
  });

  it("saves changes and updates the list title and template", async () => {
    const created = await service.create("alice", FREE);
    if (!created.ok) throw new Error("create failed");
    const doc = { ...createEmptyDocument(), title: "Data roles", templateId: "fresher-friendly" };
    expect(await service.save("alice", created.id, FREE, doc)).toEqual({ ok: true });
    expect((await service.list("alice"))[0]).toMatchObject({
      title: "Data roles",
      templateId: "fresher-friendly",
    });
  });

  it("uses a fallback title when the title is blank", async () => {
    await service.create("alice", FREE, { ...createEmptyDocument(), title: "   " });
    expect((await service.list("alice"))[0]?.title).toBe("Untitled resume");
  });

  it("does not overwrite a stored resume with invalid data", async () => {
    const created = await service.create("alice", FREE, createSampleDocument());
    if (!created.ok) throw new Error("create failed");
    expect(await service.save("alice", created.id, FREE, { title: 5 })).toEqual({
      ok: false,
      error: "invalid",
    });
    expect((await service.get("alice", created.id)).ok).toBe(true);
  });

  it("reports corrupted stored content instead of crashing", async () => {
    const created = await service.create("alice", FREE);
    if (!created.ok) throw new Error("create failed");
    repo.rows.set(created.id, { ...repo.rows.get(created.id)!, content: { broken: true } });
    expect(await service.get("alice", created.id)).toEqual({ ok: false, error: "invalid" });
  });

  it("deletes a resume", async () => {
    const created = await service.create("alice", FREE);
    if (!created.ok) throw new Error("create failed");
    expect(await service.remove("alice", created.id)).toEqual({ ok: true });
    expect(await service.list("alice")).toHaveLength(0);
  });
});

describe("privacy", () => {
  it("keeps each person's resumes private", async () => {
    const repo = createMemoryResumeRepository();
    const service = createResumeService(repo);
    const created = await service.create("alice", FREE, createSampleDocument());
    if (!created.ok) throw new Error("create failed");
    expect(await service.get("bob", created.id)).toEqual({ ok: false, error: "not_found" });
    expect(await service.save("bob", created.id, FREE, createEmptyDocument())).toEqual({
      ok: false,
      error: "not_found",
    });
    expect(await service.remove("bob", created.id)).toEqual({ ok: false, error: "not_found" });
    expect(await service.list("bob")).toHaveLength(0);
    expect((await service.get("alice", created.id)).ok).toBe(true);
  });
});

describe("plan limits (enforced on the server)", () => {
  let repo: ReturnType<typeof createMemoryResumeRepository>;
  let service: ReturnType<typeof createResumeService>;

  beforeEach(() => {
    repo = createMemoryResumeRepository();
    service = createResumeService(repo);
  });

  it("allows one resume on the free plan, then asks to upgrade", async () => {
    expect((await service.create("alice", FREE)).ok).toBe(true);
    expect(await service.create("alice", FREE)).toEqual({ ok: false, error: "limit_reached" });
    expect(await service.create("alice", FREE, createSampleDocument())).toEqual({
      ok: false,
      error: "limit_reached",
    });
    expect(await service.list("alice")).toHaveLength(1);
  });

  it("counts each person separately", async () => {
    await service.create("alice", FREE);
    expect((await service.create("bob", FREE)).ok).toBe(true);
  });

  it("allows many resumes on Pro", async () => {
    for (let i = 0; i < 5; i++) expect((await service.create("alice", PRO)).ok).toBe(true);
    expect(await service.list("alice")).toHaveLength(5);
  });

  it("swaps a Pro template for the default when a free user imports a draft", async () => {
    const created = await service.create("alice", FREE, {
      ...createSampleDocument(),
      templateId: "executive",
    });
    if (!created.ok) throw new Error("create failed");
    expect(repo.rows.get(created.id)?.templateId).toBe("ats-classic");
  });

  it("keeps a Pro template when the person is on Pro", async () => {
    const created = await service.create("alice", PRO, {
      ...createEmptyDocument(),
      templateId: "executive",
    });
    if (!created.ok) throw new Error("create failed");
    expect(repo.rows.get(created.id)?.templateId).toBe("executive");
  });

  it("stops a free user from newly choosing a Pro template", async () => {
    const created = await service.create("alice", FREE);
    if (!created.ok) throw new Error("create failed");
    const attempt = await service.save("alice", created.id, FREE, {
      ...createEmptyDocument(),
      templateId: "modern",
    });
    expect(attempt).toEqual({ ok: false, error: "template_locked" });
    expect(repo.rows.get(created.id)?.templateId).toBe("ats-classic");
  });

  it("rejects made-up template ids on the free plan", async () => {
    const created = await service.create("alice", FREE);
    if (!created.ok) throw new Error("create failed");
    expect(
      await service.save("alice", created.id, FREE, {
        ...createEmptyDocument(),
        templateId: "hacked",
      }),
    ).toEqual({ ok: false, error: "template_locked" });
  });

  it("lets someone whose Pro ended keep editing a resume that already uses a Pro template", async () => {
    const created = await service.create("alice", PRO, {
      ...createEmptyDocument(),
      templateId: "modern",
    });
    if (!created.ok) throw new Error("create failed");
    const edit = {
      ...createEmptyDocument(),
      templateId: "modern",
      title: "Edited after Pro ended",
    };
    expect(await service.save("alice", created.id, FREE, edit)).toEqual({ ok: true });
    expect(repo.rows.get(created.id)?.title).toBe("Edited after Pro ended");
  });

  it("lets a free user move from a Pro template back to a free one", async () => {
    const created = await service.create("alice", PRO, {
      ...createEmptyDocument(),
      templateId: "modern",
    });
    if (!created.ok) throw new Error("create failed");
    expect(
      await service.save("alice", created.id, FREE, {
        ...createEmptyDocument(),
        templateId: "ats-classic",
      }),
    ).toEqual({ ok: true });
  });
});
