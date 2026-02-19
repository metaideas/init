import { THEMES } from "@init/ui/constants"
import * as z from "@init/utils/schema"

export const ThemeSchema = z.enum(THEMES)
