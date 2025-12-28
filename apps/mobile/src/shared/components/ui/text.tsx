import * as Slot from "@rn-primitives/slot"
import { createContext, useContext } from "react"
import { Text as RNText, type TextProps, type TextStyle } from "react-native"
import { StyleSheet, type UnistylesVariants } from "react-native-unistyles"

const styles = StyleSheet.create((theme) => ({
  text: {
    variants: {
      color: {
        primary: {
          color: theme.colors.foreground,
        },
        quarternary: {
          color: theme.utils.alpha(theme.colors.grey3, 0.5),
        },
        secondary: {
          color: theme.utils.alpha(theme.colors.foreground, 0.9),
        },
        tertiary: {
          color: theme.colors.grey3,
        },
      },
      variant: {
        body: {
          fontSize: theme.typography.fontSize.base,
          lineHeight: theme.typography.lineHeight.base,
        },
        callout: {
          fontSize: theme.typography.fontSize.base,
          lineHeight: theme.typography.lineHeight.base,
        },
        caption1: {
          fontSize: theme.typography.fontSize.xs,
          lineHeight: theme.typography.lineHeight.xs,
        },
        caption2: {
          fontSize: theme.typography.fontSize.xs,
          lineHeight: theme.typography.lineHeight.xs,
        },
        footnote: {
          fontSize: theme.typography.fontSize.xs,
          lineHeight: theme.typography.lineHeight.xs,
        },
        heading: {
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.semibold,
          lineHeight: theme.typography.lineHeight.base,
        },
        largeTitle: {
          fontSize: theme.typography.fontSize["4xl"],
          fontWeight: theme.typography.fontWeight.bold,
          lineHeight: theme.typography.lineHeight["4xl"],
        },
        subhead: {
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          lineHeight: theme.typography.lineHeight.sm,
        },
        title1: {
          fontSize: theme.typography.fontSize["2xl"],
          fontWeight: theme.typography.fontWeight.base,
          lineHeight: theme.typography.lineHeight["2xl"],
        },
        title2: {
          fontSize: theme.typography.fontSize.xl + 2,
          fontWeight: theme.typography.fontWeight.base,
          lineHeight: theme.typography.lineHeight.xl + 2,
        },
        title3: {
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.base,
          lineHeight: theme.typography.lineHeight.xl + 2,
        },
      },
    },
  },
}))

const TextStyleContext = createContext<TextStyle | undefined>(undefined)

function Text({
  variant = "body",
  color = "primary",
  children,
  style,
  ...props
}: UnistylesVariants<typeof styles> & TextProps) {
  const textStyle = useContext(TextStyleContext)

  styles.useVariants({
    color,
    variant,
  })

  return (
    <Slot.Text style={[styles.text, textStyle, style]} {...props}>
      <RNText>{children}</RNText>
    </Slot.Text>
  )
}

export { Text, TextStyleContext }
