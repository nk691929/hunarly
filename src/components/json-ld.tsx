import { jsonLdString } from "@/lib/seo/schema";

/** Renders a JSON-LD structured data block. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />
  );
}
