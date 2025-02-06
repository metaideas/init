import base from "@tooling/tailwind/config"
import { createPreset } from "fumadocs-ui/tailwind-plugin"
import type { Config } from "tailwindcss"

export default {
  content: [
    ...base.content,
    "./mdx-components.{ts,tsx}",
    "./node_modules/fumadocs-ui/dist/**/*.js",
  ],
  presets: [createPreset({ preset: "neutral" })],
} satisfies Config
