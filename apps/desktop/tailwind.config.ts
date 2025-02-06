import base from "@tooling/tailwind/config"
import type { Config } from "tailwindcss"

export default {
  content: [
    ...base.content,
    "./src/routes/**/*.{js,ts,jsx,tsx,mdx}",
    "./index.html",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  presets: [base],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
