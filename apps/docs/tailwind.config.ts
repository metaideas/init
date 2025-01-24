import nextjs from "@tooling/tailwind/nextjs"
import { createPreset } from "fumadocs-ui/tailwind-plugin"
import type { Config } from "tailwindcss"

export default {
  content: [
    ...nextjs.content,
    "./mdx-components.{ts,tsx}",
    "../../node_modules/fumadocs-ui/dist/**/*.js",
  ],
  presets: [nextjs, createPreset({ preset: "neutral" })],
} satisfies Config
