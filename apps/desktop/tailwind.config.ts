import type { Config } from "tailwindcss"

import base from "@tooling/tailwind/config"

export default {
  content: [
    ...base.content,
    "./src/routes/**/*.{js,ts,jsx,tsx,mdx}",
    "./index.html",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  plugins: [],
  presets: [base],
  theme: {
    extend: {},
  },
} satisfies Config
