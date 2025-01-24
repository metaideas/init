import type { Thing, WithContext } from "schema-dts"

type JsonLdProps = {
  code: WithContext<Thing>
}

export function JsonLd({ code }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: This is a JSON-LD script, not user-generated content.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(code) }}
    />
  )
}

export * from "schema-dts"
