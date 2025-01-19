import wxt from "@tooling/tailwind/wxt"
import type { Config } from "tailwindcss"

export default {
  content: [...wxt.content, "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [wxt],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
