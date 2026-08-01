import { resolve } from "node:path"
import { unified } from "@astrojs/markdown-remark"
import starlight from "@astrojs/starlight"
import { paraglideVitePlugin as paraglide } from "@inlang/paraglide-js"
import tailwindcss from "@tailwindcss/vite"
import { ensureEnv } from "@tooling/env/vite"
import { defineConfig } from "astro/config"

import { DOCS_DESCRIPTION, DOCS_URL, GITHUB_URL, SITE_NAME } from "./src/shared/constants.ts"
import rewriteDocsLinks from "./src/shared/markdown-links.ts"

await ensureEnv(process.env.NODE_ENV ?? "development", import.meta.dirname)
const { default: env } = await import("./src/shared/env.ts")
const { marketingUrl } = await import("./src/shared/utils.ts")
const site = env.PUBLIC_SITE_URL ?? DOCS_URL

export default defineConfig({
  integrations: [
    starlight({
      components: {
        Head: "./src/shared/components/head.astro",
        LastUpdated: "./src/shared/components/last-updated.astro",
        SiteTitle: "./src/shared/components/site-title.astro",
      },
      customCss: ["./src/shared/styles/globals.css"],
      defaultLocale: "root",
      description: DOCS_DESCRIPTION,
      disable404Route: true,
      editLink: {
        baseUrl: `${GITHUB_URL}/edit/main/apps/docs/`,
      },
      favicon: "/favicon.svg",
      head: [
        {
          attrs: {
            content: "#fafafa",
            media: "(prefers-color-scheme: light)",
            name: "theme-color",
          },
          tag: "meta",
        },
        {
          attrs: { content: "#080a0d", media: "(prefers-color-scheme: dark)", name: "theme-color" },
          tag: "meta",
        },
        {
          attrs: { content: new URL("/social-preview.svg", site).href, property: "og:image" },
          tag: "meta",
        },
        {
          attrs: { content: "1200", property: "og:image:width" },
          tag: "meta",
        },
        {
          attrs: { content: "630", property: "og:image:height" },
          tag: "meta",
        },
        {
          attrs: { content: "init documentation", property: "og:image:alt" },
          tag: "meta",
        },
        {
          attrs: { content: new URL("/social-preview.svg", site).href, name: "twitter:image" },
          tag: "meta",
        },
      ],
      lastUpdated: true,
      locales: {
        es: {
          label: "Español",
          lang: "es",
        },
        root: {
          label: "English",
          lang: "en",
        },
      },
      sidebar: [
        {
          items: [
            { label: "Overview", slug: "", translations: { es: "Descripción general" } },
            { label: "Getting Started", slug: "getting-started" },
            { label: "Development", slug: "development" },
          ],
          label: "Start Here",
        },
        {
          items: [
            { label: "Project Generators", slug: "generators" },
            { label: "Package Guidance", slug: "packages" },
            { label: "Internationalization", slug: "internationalization" },
            { label: "Template Commands", slug: "template-commands" },
          ],
          label: "Build",
        },
        {
          items: [
            { label: "Project Structure", slug: "architecture/project-structure" },
            { label: "Backend Topology", slug: "architecture/backend-topology" },
            { label: "File Service", slug: "architecture/file-service" },
            { label: "Desktop Behavior", slug: "architecture/desktop" },
          ],
          label: "Architecture",
        },
        {
          items: [
            { label: "Project home", link: marketingUrl },
            { label: "GitHub", link: GITHUB_URL },
          ],
          label: "Elsewhere",
        },
      ],
      social: [
        {
          href: GITHUB_URL,
          icon: "github",
          label: "GitHub",
        },
      ],
      title: SITE_NAME,
    }),
  ],
  markdown: {
    processor: unified({ remarkPlugins: [rewriteDocsLinks] }),
  },
  output: "static",
  server: {
    port: Number(process.env.PORT ?? 3004),
  },
  site,
  vite: {
    plugins: [
      tailwindcss(),
      paraglide({
        outdir: "./src/shared/internationalization",
        project: "../../tooling/internationalization/project.inlang",
        strategy: ["url", "globalVariable", "baseLocale"],
      }),
    ],
    resolve: {
      alias: [
        {
          find: /^@astrojs\/starlight\/components$/,
          replacement: resolve(
            import.meta.dirname,
            "node_modules/@astrojs/starlight/components.ts"
          ),
        },
      ],
    },
  },
})
