import astro from "@tooling/tailwind/astro"
import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

export default {
  content: [...astro.content, "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [astro],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config
