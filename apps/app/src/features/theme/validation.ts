import { THEMES } from "@init/utils/constants"
import * as z from "@init/utils/schema"

export const ThemeSchema = z.enum(THEMES)
