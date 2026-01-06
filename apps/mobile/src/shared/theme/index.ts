import { StyleSheet } from "react-native-unistyles"
import { colors } from "#shared/theme/colors.ts"
import { borderRadius, breakpoints, spacing, typography } from "#shared/theme/tokens.ts"
import * as utils from "#shared/theme/utils.ts"

const baseTheme = {
  borderRadius,
  spacing,
  typography,
  utils,
}

const themes = {
  dark: { ...baseTheme, colors: colors.dark },
  light: { ...baseTheme, colors: colors.light },
} as const

/**
 * You can easily get the types to create components
 * with variants just like shadcn/ui
 */
type AppBreakpoints = typeof breakpoints
type AppThemes = typeof themes

declare module "react-native-unistyles" {
  // oxlint-disable-next-line no-empty-object-type
  interface UnistylesThemes extends AppThemes {}
  // oxlint-disable-next-line no-empty-object-type
  interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  breakpoints,
  settings: {
    adaptiveThemes: true,
  },
  themes,
})
