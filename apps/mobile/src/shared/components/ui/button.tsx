import * as Slot from "@rn-primitives/slot"
import type { ComponentProps } from "react"
import { Pressable } from "react-native"
import { StyleSheet, type UnistylesVariants } from "react-native-unistyles"
import { TextStyleContext } from "#shared/components/ui/text.tsx"

const styles = StyleSheet.create((theme, rt) => ({
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
          backgroundColor: pressed
            ? theme.utils.alpha(theme.colors.primary, 0.8)
            : theme.colors.primary,
        },
        secondary: {
          borderColor: theme.colors.primary,
          borderWidth: 1,
          backgroundColor: pressed
            ? theme.utils.alpha(
                theme.colors.primary,
                rt.themeName === "dark" ? 0.15 : 0.05
              )
            : "transparent",
        },
        tonal: {
          backgroundColor: pressed
            ? theme.utils.alpha(
                theme.colors.primary,
                rt.themeName === "dark" ? 0.2 : 0.15
              )
            : theme.utils.alpha(
                theme.colors.primary,
                rt.themeName === "dark" ? 0.15 : 0.1
              ),
        },
        plain: {
          opacity: pressed ? 0.7 : 1,
        },
      },
      size: {
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
        lg: {
          paddingVertical: theme.spacing[2.5],
          paddingHorizontal: theme.spacing[5],
          borderRadius: theme.borderRadius.xl,
          gap: theme.spacing[2],
        },
        xl: {
          paddingVertical: theme.spacing[4],
          paddingHorizontal: theme.spacing[8],
          borderRadius: theme.borderRadius["2xl"],
          gap: theme.spacing[3],
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
        xl: {
          fontSize: theme.typography.fontSize.lg,
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
  styles.useVariants({ variant, size })

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
