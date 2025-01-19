import expo from "@tooling/tailwind/expo"
// @ts-expect-error - Nativewind preset is not typed
import nativewind from "nativewind/preset"
import type { Config } from "tailwindcss"

export default {
  content: expo.content,
  presets: [expo, nativewind],
} satisfies Config
