import { createContext, useContext } from "react"
import type { TextStyle } from "react-native"
import { Text as RNText, type TextProps } from "react-native"
import { StyleSheet, type UnistylesVariants } from "react-native-unistyles"

const styles = StyleSheet.create((theme) => ({
  text: {
    variants: {
      variant: {
        largeTitle: {
          fontSize: theme.typography.fontSize["4xl"],
          lineHeight: theme.typography.lineHeight["4xl"],
          fontWeight: theme.typography.fontWeight.bold,
        },
        title1: {
          fontSize: theme.typography.fontSize["2xl"],
          lineHeight: theme.typography.lineHeight["2xl"],
          fontWeight: theme.typography.fontWeight.base,
        },
        title2: {
          fontSize: theme.typography.fontSize.xl + 2,
          lineHeight: theme.typography.lineHeight.xl + 2,
          fontWeight: theme.typography.fontWeight.base,
        },
        title3: {
          fontSize: theme.typography.fontSize.xl,
          lineHeight: theme.typography.lineHeight.xl + 2,
          fontWeight: theme.typography.fontWeight.base,
        },
        heading: {
          fontSize: theme.typography.fontSize.base,
          lineHeight: theme.typography.lineHeight.base,
          fontWeight: theme.typography.fontWeight.semibold,
        },
        body: {
          fontSize: theme.typography.fontSize.base,
          lineHeight: theme.typography.lineHeight.base,
        },
        callout: {
          fontSize: theme.typography.fontSize.base,
          lineHeight: theme.typography.lineHeight.base,
        },
        subhead: {
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.lineHeight.sm,
          fontWeight: theme.typography.fontWeight.medium,
        },
        footnote: {
          fontSize: theme.typography.fontSize.xs,
          lineHeight: theme.typography.lineHeight.xs,
        },
        caption1: {
          fontSize: theme.typography.fontSize.xs,
          lineHeight: theme.typography.lineHeight.xs,
        },
        caption2: {
          fontSize: theme.typography.fontSize.xs,
          lineHeight: theme.typography.lineHeight.xs,
        },
      },
      color: {
        primary: {
          color: theme.colors.foreground,
        },
        secondary: {
          color: theme.utils.hexToRgba(theme.colors.foreground, 0.9),
        },
        tertiary: {
          color: theme.colors.grey3,
        },
        quarternary: {
          color: theme.utils.hexToRgba(theme.colors.grey3, 0.5),
        },
      },
    },
  },
}))

const TextStyleContext = createContext<TextStyle | undefined>(undefined)

function Text({
  variant = "body",
  color = "primary",
  style,
  ...props
}: UnistylesVariants<typeof styles> & TextProps) {
  const textStyle = useContext(TextStyleContext)

  styles.useVariants({
    variant,
    color,
  })

  return <RNText style={[styles.text, textStyle, style]} {...props} />
}

export { Text, TextStyleContext, styles as textStyles }
