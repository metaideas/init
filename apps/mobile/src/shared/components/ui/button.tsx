import * as Slot from "@rn-primitives/slot"
import type { ComponentProps } from "react"
import { Pressable } from "react-native"
import { StyleSheet, type UnistylesVariants } from "react-native-unistyles"
import { TextStyleContext } from "./text"

const styles = StyleSheet.create((theme) => ({
  button: ({ pressed }: { pressed: boolean }) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing[2],
    transform: [{ scale: pressed ? 0.98 : 1 }],
    transitionDuration: "150ms",

    variants: {
      variant: {
        primary: {
          backgroundColor: theme.colors.primary,
          opacity: pressed ? 0.8 : 1,
        },
        secondary: {
          borderColor: theme.colors.primary,
          borderWidth: 1,
          backgroundColor: pressed
            ? theme.utils.hexToRgba(theme.colors.primary, 0.05)
            : "transparent",
        },
        tonal: {
          backgroundColor: pressed
            ? theme.utils.hexToRgba(theme.colors.primary, 0.15)
            : theme.utils.hexToRgba(theme.colors.primary, 0.1),
        },
        plain: {
          opacity: pressed ? 0.7 : 1,
        },
      },
      size: {
        none: {},
        sm: {
          paddingVertical: theme.spacing[1],
          paddingHorizontal: theme.spacing[2.5],
          borderRadius: theme.borderRadius.full,
        },
        md: {
          paddingVertical: theme.spacing[2],
          paddingHorizontal: theme.spacing[3],
          borderRadius: theme.borderRadius.lg,
        },
        icon: {
          borderRadius: theme.borderRadius.lg,
          height: theme.spacing[10],
          width: theme.spacing[10],
        },
      },
    },
  }),
  text: {
    variants: {
      variant: {
        primary: {
          color: theme.colors.white,
        },
        secondary: {
          color: theme.colors.primary,
        },
        tonal: {
          color: theme.colors.primary,
        },
        plain: {
          color: theme.colors.foreground,
        },
      },
      size: {
        none: {},
        icon: {},
        sm: {
          fontSize: theme.typography.fontSize.sm,
        },
        md: {
          fontSize: theme.typography.fontSize.base,
        },
        lg: {
          fontSize: theme.typography.fontSize.base,
        },
      },
    },
  },
}))

function Button({
  style,
  variant = "primary",
  size = "md",
  ref,
  ...props
}: UnistylesVariants<typeof styles> & ComponentProps<typeof Pressable>) {
  styles.useVariants({ variant, size })

  return (
    <TextStyleContext.Provider value={styles.text}>
      <Slot.Pressable ref={ref}>
        <Pressable
          style={({ pressed, hovered }) => [
            styles.button({ pressed }),
            typeof style === "function" ? style({ pressed, hovered }) : style,
          ]}
          {...props}
        />
      </Slot.Pressable>
    </TextStyleContext.Provider>
  )
}

export { Button, styles as buttonStyles }
