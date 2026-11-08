import { describe, expect, it } from "vitest";
import { createEmptyDocument } from "@/features/resume-builder/defaults";
import {
  A4_HEIGHT,
  PAGE_MARGIN,
  pageBreaks,
  pageCount,
} from "@/features/resume-builder/pagination";
import {
  exportBlockedReason,
  filenameFromDisposition,
  pdfFileName,
} from "@/features/resume-builder/pdf";
import { clientKey, isSameOrigin } from "@/lib/http";
import { firstOutOfOrder } from "../helpers/pdf-text";

function docNamed(fullName: string, title = "My resume") {
  const doc = createEmptyDocument();
  doc.profile.fullName = fullName;
  doc.title = title;
  return doc;
}

describe("pdfFileName", () => {
  it("makes a safe lowercase file name from the person's name", () => {
    expect(pdfFileName(docNamed("Maya Johnson"))).toBe("maya-johnson-resume.pdf");
    expect(pdfFileName(docNamed("  José  Núñez-Ríos "))).toBe("jose-nunez-rios-resume.pdf");
  });

  it("falls back to the title, then to a plain name", () => {
    expect(pdfFileName(docNamed("", "Data roles"))).toBe("data-roles-resume.pdf");
    expect(pdfFileName(docNamed("نوشاد", "رزومہ"))).toBe("resume.pdf");
    expect(pdfFileName(docNamed("../../etc/passwd"))).toBe("etc-passwd-resume.pdf");
  });
});

describe("filenameFromDisposition", () => {
  it("reads the file name and rejects anything unsafe", () => {
    expect(filenameFromDisposition('attachment; filename="maya-resume.pdf"')).toBe(
      "maya-resume.pdf",
    );
    expect(filenameFromDisposition(null)).toBe("resume.pdf");
    expect(filenameFromDisposition('attachment; filename="../evil.exe"')).toBe("resume.pdf");
    expect(filenameFromDisposition('attachment; filename="a/b.pdf"')).toBe("ab.pdf");
  });
});

describe("exportBlockedReason", () => {
  it("asks for a name first", () => {
    expect(exportBlockedReason(docNamed(""))).toMatch(/full name/);
    expect(exportBlockedReason(docNamed("  "))).toMatch(/full name/);
    expect(exportBlockedReason(docNamed("Maya"))).toBeNull();
  });
});

describe("pagination", () => {
  it("keeps content that fits on one page together", () => {
    expect(pageBreaks(900)).toEqual([]);
    expect(pageCount(A4_HEIGHT - PAGE_MARGIN)).toBe(1);
  });

  it("starts a second page just past the first page's usable height", () => {
    expect(pageBreaks(A4_HEIGHT - PAGE_MARGIN + 1)).toEqual([A4_HEIGHT - PAGE_MARGIN]);
    expect(pageCount(A4_HEIGHT - PAGE_MARGIN + 1)).toBe(2);
  });

  it("counts later pages using the smaller usable height", () => {
    const first = A4_HEIGHT - PAGE_MARGIN;
    const later = A4_HEIGHT - 2 * PAGE_MARGIN;
    expect(pageBreaks(first + later + 1)).toEqual([first, first + later]);
  });
});

describe("request helpers", () => {
  it("accepts the site's own origin and requests without one, rejects others", () => {
    expect(isSameOrigin("http://localhost:3000", "http://localhost:3000")).toBe(true);
    expect(isSameOrigin(null, "http://localhost:3000")).toBe(true);
    expect(isSameOrigin("https://evil.example", "http://localhost:3000")).toBe(false);
    expect(isSameOrigin("not a url", "http://localhost:3000")).toBe(false);
  });

  it("limits signed-in people by id and guests by IP", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" });
    expect(clientKey(headers, "u1")).toBe("user:u1");
    expect(clientKey(headers, null)).toBe("ip:203.0.113.5");
    expect(clientKey(new Headers(), null)).toBe("ip:unknown");
  });
});

describe("firstOutOfOrder (used by the PDF text check)", () => {
  it("finds the first phrase that is missing or early", () => {
    expect(firstOutOfOrder("a b c d", ["a", "b", "d"])).toBeNull();
    expect(firstOutOfOrder("a b c d", ["a", "d", "b"])).toBe("b");
    expect(firstOutOfOrder("a b", ["a", "z"])).toBe("z");
  });
});
