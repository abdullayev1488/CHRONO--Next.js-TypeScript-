import type { JsonLdObject } from "@/lib/seo";

/** Structured data <script>; `<` simvolu XSS-dən qorunmaq üçün unicode ilə əvəzlənir. */
export const JsonLd = ({ data }: { data: JsonLdObject | JsonLdObject[] }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    }}
  />
);
