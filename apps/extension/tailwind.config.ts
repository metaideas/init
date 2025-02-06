import base from "@tooling/tailwind/config"
import type { Config } from "tailwindcss"

export default {
  content: [
    ...base.content,
    "./src/entrypoints/**/*.{js,ts,jsx,tsx,mdx,html}",
    "./src/routes/**/*.{js,ts,jsx,tsx,mdx,html}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  presets: [base],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
