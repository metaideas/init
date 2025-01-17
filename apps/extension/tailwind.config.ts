import base from "@tooling/tailwind/extension"
import type { Config } from "tailwindcss"

export default {
  content: [...base.content, "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [base],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
