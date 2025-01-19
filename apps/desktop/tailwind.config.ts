import tauri from "@tooling/tailwind/tauri"
import type { Config } from "tailwindcss"

export default {
  content: [...tauri.content, "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [tauri],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
