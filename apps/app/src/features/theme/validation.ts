import { THEMES } from "@init/ui/constants"
import * as z from "@init/utils/schema/mini"

export const ThemeSchema = z.enum(THEMES)
