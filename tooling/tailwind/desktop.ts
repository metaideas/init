import type { Config } from "tailwindcss"

import base from "./base"

export default {
  content: [...base.content, "./src/**/*.{ts,tsx,mdx}"],
  presets: [base],
  theme: {},
} satisfies Config
