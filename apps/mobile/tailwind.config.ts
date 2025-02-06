import base from "@tooling/tailwind/config"
// @ts-expect-error - Nativewind preset is not typed
import nativewind from "nativewind/preset"
import { hairlineWidth } from "nativewind/theme"
import type { Config } from "tailwindcss"

export default {
  darkMode: "class",
  content: [...base.content, "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  presets: [base, nativewind],
  theme: {
    extend: {
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
} satisfies Config
