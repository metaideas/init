import ui from "@init/native-ui/tailwind.config"
import type { Config } from "tailwindcss"

export default {
  content: ui.content,
  presets: [ui],
} satisfies Config
