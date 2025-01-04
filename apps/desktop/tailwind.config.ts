import type { Config } from "tailwindcss"

import baseConfig from "@tooling/tailwind/desktop"

export default {
  content: [...baseConfig.content, "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [baseConfig],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
