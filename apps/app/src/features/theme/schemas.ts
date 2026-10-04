import { THEMES } from "@v1/ui/constants"
import * as z from "@v1/utils/schema/mini"

export const ThemeSchema = z.enum(THEMES)
