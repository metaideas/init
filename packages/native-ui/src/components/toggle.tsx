import { cn } from "@init/utils/ui"
import * as TogglePrimitive from "@rn-primitives/toggle"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { Platform } from "react-native"
import { Icon } from "./icon"
import { TextClassContext } from "./text"

const toggleVariants = cva(
  cn(
    "group flex flex-row items-center justify-center gap-2 rounded-md active:bg-muted",
    Platform.select({
      web: "hover:bg-muted hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex cursor-default whitespace-nowrap outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:pointer-events-none [&_svg]:pointer-events-none",
    })
  ),
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-10 min-w-10 px-2.5 sm:h-9 sm:min-w-9 sm:px-2",
        lg: "h-11 min-w-11 px-3 sm:h-10 sm:min-w-10 sm:px-2.5",
        sm: "h-9 min-w-9 px-2 sm:h-8 sm:min-w-8 sm:px-1.5",
      },
      variant: {
        default: "bg-transparent",
        outline: cn(
          "border border-input bg-transparent shadow-sm shadow-black/5 active:bg-accent",
          Platform.select({
            web: "hover:bg-accent hover:text-accent-foreground",
          })
        ),
      },
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: TogglePrimitive.RootProps &
  VariantProps<typeof toggleVariants> &
  React.RefAttributes<TogglePrimitive.RootRef>) {
  return (
    <TextClassContext.Provider
      value={cn(
        "text-sm font-medium text-foreground",
        props.pressed
          ? "text-accent-foreground"
          : Platform.select({ web: "group-hover:text-muted-foreground" }),
        className
      )}
    >
      <TogglePrimitive.Root
        className={cn(
          toggleVariants({ size, variant }),
          props.disabled && "opacity-50",
          props.pressed && "bg-accent",
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  )
}

function ToggleIcon({ className, ...props }: React.ComponentProps<typeof Icon>) {
  const textClass = React.useContext(TextClassContext)
  return <Icon className={cn("size-4 shrink-0", textClass, className)} {...props} />
}

export { Toggle, ToggleIcon, toggleVariants }
