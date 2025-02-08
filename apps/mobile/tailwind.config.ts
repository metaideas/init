// @ts-expect-error - Nativewind preset is not typed
import nativewind from "nativewind/preset"
import { hairlineWidth } from "nativewind/theme"
import type { Config } from "tailwindcss"

import ui from "@this/native-ui/tailwind.config"

export default {
  content: ui.content,
  presets: [ui, nativewind],
  theme: {
    extend: {
      borderWidth: {
        // Again, Nativewind is not typed.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        hairline: hairlineWidth(),
      },
    },
  },
} satisfies Config
