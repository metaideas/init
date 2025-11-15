import { StyleSheet } from "react-native-unistyles"
import { colors } from "#shared/theme/colors.ts"
import {
  borderRadius,
  breakpoints,
  spacing,
  typography,
} from "#shared/theme/tokens.ts"
import * as utils from "#shared/theme/utils.ts"

const baseTheme = {
  spacing,
  borderRadius,
  typography,
  utils,
}

const themes = {
  light: { ...baseTheme, colors: colors.light },
  dark: { ...baseTheme, colors: colors.dark },
} as const

/**
 * You can easily get the types to create components
 * with variants just like shadcn/ui
 */
type AppBreakpoints = typeof breakpoints
type AppThemes = typeof themes

declare module "react-native-unistyles" {
  interface UnistylesThemes extends AppThemes {}
  interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  settings: {
    adaptiveThemes: true,
  },
  breakpoints,
  themes,
})
