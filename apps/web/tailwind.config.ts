import base from "@tooling/tailwind/config"
import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

export default {
  // We need to append the path to the UI package to the content array so that
  // those classes are included correctly.
  content: [
    ...base.content,
    "./src/app/**/*.{js,ts,md,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  presets: [base],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
} satisfies Config
