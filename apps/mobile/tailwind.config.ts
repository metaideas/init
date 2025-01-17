import base from "@tooling/tailwind/mobile"
// @ts-expect-error - Nativewind preset is not typed
import nativewind from "nativewind/preset"
import type { Config } from "tailwindcss"

export default {
  content: base.content,
  presets: [base, nativewind],
} satisfies Config
