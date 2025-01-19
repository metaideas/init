import type { Config } from "tailwindcss"

import base from "#config/base.ts"

export default {
  content: [...base.content, "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  presets: [base],
  theme: {},
} satisfies Config
