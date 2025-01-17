import type { Config } from "tailwindcss"

import base from "@tooling/tailwind/desktop"

export default {
  content: [...base.content, "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [base],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
