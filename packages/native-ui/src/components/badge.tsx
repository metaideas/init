import type { ViewProps } from "react-native"
import { cn } from "@init/utils/ui"
import * as Slot from "@rn-primitives/slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Platform, View } from "react-native"
import { TextClassContext } from "./text"

const badgeVariants = cva(
  cn(
    "group shrink-0 flex-row items-center justify-center gap-1 overflow-hidden rounded-full border border-border px-2 py-0.5",
    Platform.select({
      web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive w-fit whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3",
    })
  ),
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: cn(
          "border-transparent bg-primary",
          Platform.select({ web: "[a&]:hover:bg-primary/90" })
        ),
        destructive: cn(
          "border-transparent bg-destructive",
          Platform.select({ web: "[a&]:hover:bg-destructive/90" })
        ),
        outline: Platform.select({ web: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground" }),
        secondary: cn(
          "border-transparent bg-secondary",
          Platform.select({ web: "[a&]:hover:bg-secondary/90" })
        ),
      },
    },
  }
)

const badgeTextVariants = cva("text-xs font-medium", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-white",
      outline: "text-foreground",
      secondary: "text-secondary-foreground",
    },
  },
})

type BadgeProps = ViewProps &
  React.RefAttributes<View> & {
    asChild?: boolean
  } & VariantProps<typeof badgeVariants>

function Badge({ className, variant, asChild, ...props }: BadgeProps) {
  const Component = asChild ? Slot.View : View
  return (
    <TextClassContext.Provider value={badgeTextVariants({ variant })}>
      <Component className={cn(badgeVariants({ variant }), className)} {...props} />
    </TextClassContext.Provider>
  )
}

export { Badge, badgeTextVariants, badgeVariants }
export type { BadgeProps }
