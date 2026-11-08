import { beforeEach, describe, expect, it } from "vitest";
import { createEmptyDocument, createSampleDocument } from "@/features/resume-builder/defaults";
import { createResumeService } from "@/server/resumes/service";
import { createMemoryResumeRepository } from "../helpers/memory-resume-repository";

describe("resume service", () => {
  let repo: ReturnType<typeof createMemoryResumeRepository>;
  let service: ReturnType<typeof createResumeService>;

  beforeEach(() => {
    repo = createMemoryResumeRepository();
    service = createResumeService(repo);
  });

  it("creates a blank resume and lists it", async () => {
    const created = await service.create("alice");
    expect(created.ok).toBe(true);
    const list = await service.list("alice");
    expect(list).toHaveLength(1);
    expect(list[0]?.title).toBe("My resume");
  });

  it("imports a validated draft", async () => {
    const draft = createSampleDocument();
    const created = await service.create("alice", draft);
    if (!created.ok) throw new Error("create failed");
    const fetched = await service.get("alice", created.id);
    expect(fetched).toMatchObject({ ok: true });
    if (fetched.ok) expect(fetched.document.profile.fullName).toBe("Maya Johnson");
  });

  it("rejects invalid documents and strips unknown fields", async () => {
    expect(await service.create("alice", { nope: true })).toEqual({ ok: false, error: "invalid" });
    const doc = { ...createEmptyDocument(), injected: "<script>" };
    const created = await service.create("alice", doc);
    if (!created.ok) throw new Error("create failed");
    expect(JSON.stringify(repo.rows.get(created.id)?.content)).not.toContain("injected");
  });

  it("saves changes, updates the list title and template", async () => {
    const created = await service.create("alice");
    if (!created.ok) throw new Error("create failed");
    const doc = { ...createEmptyDocument(), title: "Data roles", templateId: "modern" };
    expect(await service.save("alice", created.id, doc)).toEqual({ ok: true });
    expect((await service.list("alice"))[0]).toMatchObject({
      title: "Data roles",
      templateId: "modern",
    });
  });

  it("uses a fallback title when the title is blank", async () => {
    await service.create("alice", { ...createEmptyDocument(), title: "   " });
    expect((await service.list("alice"))[0]?.title).toBe("Untitled resume");
  });

  it("does not overwrite a stored resume with invalid data", async () => {
    const created = await service.create("alice", createSampleDocument());
    if (!created.ok) throw new Error("create failed");
    expect(await service.save("alice", created.id, { title: 5 })).toEqual({
      ok: false,
      error: "invalid",
    });
    const fetched = await service.get("alice", created.id);
    expect(fetched.ok).toBe(true);
  });

  it("keeps each person's resumes private", async () => {
    const created = await service.create("alice", createSampleDocument());
    if (!created.ok) throw new Error("create failed");
    expect(await service.get("bob", created.id)).toEqual({ ok: false, error: "not_found" });
    expect(await service.save("bob", created.id, createEmptyDocument())).toEqual({
      ok: false,
      error: "not_found",
    });
    expect(await service.remove("bob", created.id)).toEqual({ ok: false, error: "not_found" });
    expect(await service.list("bob")).toHaveLength(0);
    expect((await service.get("alice", created.id)).ok).toBe(true);
  });

  it("deletes a resume", async () => {
    const created = await service.create("alice");
    if (!created.ok) throw new Error("create failed");
    expect(await service.remove("alice", created.id)).toEqual({ ok: true });
    expect(await service.list("alice")).toHaveLength(0);
  });

  it("reports corrupted stored content instead of crashing", async () => {
    const created = await service.create("alice");
    if (!created.ok) throw new Error("create failed");
    const row = repo.rows.get(created.id)!;
    repo.rows.set(created.id, { ...row, content: { broken: true } });
    expect(await service.get("alice", created.id)).toEqual({ ok: false, error: "invalid" });
  });
});
