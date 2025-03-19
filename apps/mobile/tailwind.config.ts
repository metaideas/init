import ui from "@init/native-ui/tailwind.config"
// @ts-expect-error -- Nativewind is not typed
import nativewind from "nativewind/preset"
import type { Config } from "tailwindcss"

export default {
  content: ui.content,
  presets: [nativewind, ui],
} satisfies Config
