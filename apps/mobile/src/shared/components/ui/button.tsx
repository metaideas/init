import type { ComponentProps } from "react"
import * as Slot from "@rn-primitives/slot"
import { Pressable } from "react-native"
import { StyleSheet, type UnistylesVariants } from "react-native-unistyles"
import { TextStyleContext } from "#shared/components/ui/text.tsx"

const styles = StyleSheet.create((theme, rt) => ({
  button: ({ pressed }: { pressed: boolean }) => ({
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing[2],
    justifyContent: "center",
    transform: [{ scale: pressed ? 0.98 : 1 }],
    transitionDuration: "150ms",

    variants: {
      size: {
        icon: {
          borderRadius: theme.borderRadius.lg,
          height: theme.spacing[10],
          width: theme.spacing[10],
        },
        lg: {
          borderRadius: theme.borderRadius.xl,
          gap: theme.spacing[2],
          paddingHorizontal: theme.spacing[5],
          paddingVertical: theme.spacing[2.5],
        },
        md: {
          borderRadius: theme.borderRadius.lg,
          paddingHorizontal: theme.spacing[3],
          paddingVertical: theme.spacing[2],
        },
        sm: {
          borderRadius: theme.borderRadius.full,
          paddingHorizontal: theme.spacing[2.5],
          paddingVertical: theme.spacing[1],
        },
        xl: {
          borderRadius: theme.borderRadius["2xl"],
          gap: theme.spacing[3],
          paddingHorizontal: theme.spacing[8],
          paddingVertical: theme.spacing[4],
        },
      },
      variant: {
        plain: {
          opacity: pressed ? 0.7 : 1,
        },
        primary: {
          backgroundColor: pressed
            ? theme.utils.alpha(theme.colors.primary, 0.8)
            : theme.colors.primary,
        },
        secondary: {
          backgroundColor: pressed
            ? theme.utils.alpha(theme.colors.primary, rt.themeName === "dark" ? 0.15 : 0.05)
            : "transparent",
          borderColor: theme.colors.primary,
          borderWidth: 1,
        },
        tonal: {
          backgroundColor: pressed
            ? theme.utils.alpha(theme.colors.primary, rt.themeName === "dark" ? 0.2 : 0.15)
            : theme.utils.alpha(theme.colors.primary, rt.themeName === "dark" ? 0.15 : 0.1),
        },
      },
    },
  }),
  text: {
    variants: {
      size: {
        icon: {},
        lg: {
          fontSize: theme.typography.fontSize.base,
        },
        md: {
          fontSize: theme.typography.fontSize.base,
        },
        sm: {
          fontSize: theme.typography.fontSize.sm,
        },
        xl: {
          fontSize: theme.typography.fontSize.lg,
        },
      },
      variant: {
        plain: {
          color: theme.colors.foreground,
        },
        primary: {
          color: theme.colors.white,
        },
        secondary: {
          color: theme.colors.primary,
        },
        tonal: {
          color: theme.colors.primary,
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
  children,
  ...props
}: UnistylesVariants<typeof styles> & ComponentProps<typeof Pressable>) {
  styles.useVariants({ size, variant })

  return (
    <TextStyleContext.Provider value={styles.text}>
      <Slot.Pressable
        ref={ref}
        style={(state) => [
          styles.button(state),
          typeof style === "function" ? style(state) : style,
        ]}
        {...props}
      >
        <Pressable>{children}</Pressable>
      </Slot.Pressable>
    </TextStyleContext.Provider>
  )
}

export { Button }
