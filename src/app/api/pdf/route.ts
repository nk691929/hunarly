import { env } from "@/config/env";
import { siteConfig } from "@/config/site";
import { pdfFileName } from "@/features/resume-builder/pdf";
import { clientKey, isSameOrigin } from "@/lib/http";
import { auth } from "@/server/auth";
import { createSemaphore } from "@/server/concurrency";
import { resolveEntitlements } from "@/server/entitlements";
import { PdfRenderError } from "@/server/providers/pdf";
import { getPdfRenderer } from "@/server/providers/pdf/instance";
import { createMemoryRateLimiter } from "@/server/rate-limit";
import { parseDocument } from "@/server/resumes/service";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BODY_BYTES = 250_000;
const limiter = createMemoryRateLimiter({ limit: 8, windowMs: 60_000 });
const renders = createSemaphore(2);

function fail(status: number, error: string, extraHeaders?: Record<string, string>) {
  return Response.json({ error }, { status, headers: extraHeaders });
}

/**
 * POST a resume document, get a PDF back. Works for guests and signed-in users.
 * Never logs resume content: only error types are logged.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request.headers.get("origin"), siteConfig.url)) {
    return fail(403, "This request is not allowed.");
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return fail(413, "That resume is too large to export.");

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return fail(413, "That resume is too large to export.");
    body = JSON.parse(text);
  } catch {
    return fail(400, "That request could not be read.");
  }

  const parsed = parseDocument(body);
  if (!parsed.ok)
    return fail(400, "Some of the resume data is not valid, so it could not be exported.");

  const session = await auth();
  const userId = session?.user?.id ?? null;

  const limit = await limiter.check(clientKey(request.headers, userId));
  if (!limit.allowed) {
    return fail(
      429,
      `Too many downloads. Please try again in ${limit.retryAfterSeconds} seconds.`,
      {
        "Retry-After": String(limit.retryAfterSeconds),
      },
    );
  }

  const release = renders.tryAcquire();
  if (!release) return fail(503, "We are busy creating other PDFs. Please try again in a moment.");

  try {
    const entitlements = resolveEntitlements({
      userId,
      devProUnlock: env.DEV_PRO_UNLOCK === "1",
      isDevelopment: env.NODE_ENV === "development",
    });
    const pdf = await getPdfRenderer().render({
      document: parsed.document,
      watermark: entitlements.pdfWatermark,
    });
    return new Response(new Blob([pdf as BlobPart], { type: "application/pdf" }), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfFileName(parsed.document)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const code = error instanceof PdfRenderError ? error.code : "failed";
    const reason =
      error instanceof Error && error.cause instanceof Error
        ? error.cause.message.split("\n")[0]
        : "";
    console.error(`PDF export failed: ${code}${reason ? ` (${reason})` : ""}`);
    if (error instanceof PdfRenderError && error.code === "unavailable") {
      const hint = env.NODE_ENV === "development" ? ` (${error.message})` : "";
      return fail(503, `PDF export is not available right now.${hint}`);
    }
    if (code === "timeout") return fail(504, "The PDF took too long to create. Please try again.");
    return fail(500, "We could not create your PDF. Please try again.");
  } finally {
    release();
  }
}
