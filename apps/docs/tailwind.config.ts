import { createPreset } from "fumadocs-ui/tailwind-plugin"
import type { Config } from "tailwindcss"

export default {
  content: [
    "./src/assets/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./mdx-components.{ts,tsx}",
    "./node_modules/fumadocs-ui/dist/**/*.js",
  ],
  presets: [createPreset({ preset: "neutral" })],
} satisfies Config
