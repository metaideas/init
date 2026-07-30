export const site = {
  command: "bun create metaideas/init my-app",
  description: "Modern monorepo template for shipping TypeScript apps everywhere.",
  githubUrl: "https://github.com/metaideas/init",
  name: "Init",
  siteUrl: "https://init.now",
  tagline: "Start once. Ship everywhere.",
} as const

export const technologies = [
  { detail: "runtime", name: "Bun" },
  { detail: "monorepo", name: "Turborepo" },
  { detail: "marketing", name: "Astro" },
  { detail: "full-stack", name: "TanStack Start" },
  { detail: "api", name: "Hono" },
  { detail: "native", name: "Expo" },
  { detail: "data", name: "Drizzle" },
  { detail: "auth", name: "Better Auth" },
  { detail: "styles", name: "Tailwind" },
  { detail: "desktop", name: "Tauri" },
] as const
