import nextjs from "@tooling/tailwind/nextjs"
import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

export default {
  // We need to append the path to the UI package to the content array so that
  // those classes are included correctly.
  content: [
    ...nextjs.content,
    "./content/**/*.{md,mdx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  presets: [nextjs],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
      },
    },
  },
} satisfies Config
