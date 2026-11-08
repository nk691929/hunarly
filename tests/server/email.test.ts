import { afterEach, describe, expect, it, vi } from "vitest";
import { selectEmailProvider } from "@/server/providers/email";
import { createConsoleEmailProvider } from "@/server/providers/email/console";
import { buildMagicLinkEmail } from "@/server/providers/email/magic-link";
import { createResendEmailProvider } from "@/server/providers/email/resend";

afterEach(() => vi.restoreAllMocks());

describe("buildMagicLinkEmail", () => {
  it("puts the link in both the text and HTML versions", () => {
    const email = buildMagicLinkEmail(
      "a@b.co",
      "https://hunarly.test/api/auth/callback/email?token=abc",
    );
    expect(email.to).toBe("a@b.co");
    expect(email.subject).toBe("Sign in to Hunarly");
    expect(email.text).toContain("https://hunarly.test/api/auth/callback/email?token=abc");
    expect(email.html).toContain("token=abc");
  });

  it("escapes anything interpolated into the HTML", () => {
    const email = buildMagicLinkEmail(
      "a@b.co",
      'https://x.test/?a=1&b="><script>alert(1)</script>',
    );
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&amp;");
    expect(email.html).toContain("&quot;");
  });
});

describe("Resend provider", () => {
  const message = { to: "a@b.co", subject: "Hi", text: "text", html: "<p>html</p>" };

  it("posts the message with the API key", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    await createResendEmailProvider({
      apiKey: "re_secret",
      from: "Hunarly <x@y.co>",
      fetchImpl,
    }).send(message);
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_secret");
    expect(JSON.parse(init.body)).toMatchObject({
      from: "Hunarly <x@y.co>",
      to: ["a@b.co"],
      subject: "Hi",
    });
  });

  it("fails without leaking the API key", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 422 });
    const provider = createResendEmailProvider({ apiKey: "re_secret", from: "x@y.co", fetchImpl });
    const error = await provider.send(message).catch((e: Error) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain("422");
    expect((error as Error).message).not.toContain("re_secret");
  });
});

describe("selectEmailProvider", () => {
  it("picks the provider for the transport, or none", () => {
    expect(selectEmailProvider({ transport: null })).toBeNull();
    expect(selectEmailProvider({ transport: "resend" })).toBeNull(); // missing key or sender
    expect(
      selectEmailProvider({ transport: "resend", resendApiKey: "k", emailFrom: "a@b.co" }),
    ).not.toBeNull();
    expect(selectEmailProvider({ transport: "console" })).not.toBeNull();
  });

  it("console provider prints the email for local testing", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await createConsoleEmailProvider().send({
      to: "a@b.co",
      subject: "Hi",
      text: "the link",
      html: "",
    });
    expect(warn.mock.calls[0]?.[0]).toContain("the link");
  });
});
