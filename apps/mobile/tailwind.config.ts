// @ts-expect-error - Nativewind preset is not typed
import nativewind from "nativewind/preset"
import { hairlineWidth } from "nativewind/theme"
import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

import base from "@tooling/tailwind/config"

export default {
  content: [
    ...base.content,
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  presets: [base, nativewind],
  theme: {
    extend: {
      borderWidth: {
        // Again, Nativewind is not typed.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        hairline: hairlineWidth(),
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
} satisfies Config
