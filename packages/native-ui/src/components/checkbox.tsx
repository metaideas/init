import { cn } from "@init/utils/ui"
import * as CheckboxPrimitive from "@rn-primitives/checkbox"
import { Platform } from "react-native"
import { CheckIcon, Icon } from "./icon"

const DEFAULT_HIT_SLOP = 24

function Checkbox({
  className,
  checkedClassName,
  indicatorClassName,
  iconClassName,
  ...props
}: CheckboxPrimitive.RootProps &
  React.RefAttributes<CheckboxPrimitive.RootRef> & {
    checkedClassName?: string
    indicatorClassName?: string
    iconClassName?: string
  }) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "size-4 shrink-0 rounded-[4px] border border-input shadow-sm shadow-black/5 dark:bg-input/30",
        Platform.select({
          native: "overflow-hidden",
          web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive peer cursor-default outline-none transition-shadow focus-visible:ring-[3px] disabled:cursor-not-allowed",
        }),
        props.checked && cn("border-primary", checkedClassName),
        props.disabled && "opacity-50",
        className
      )}
      hitSlop={DEFAULT_HIT_SLOP}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("h-full w-full items-center justify-center bg-primary", indicatorClassName)}
      >
        <Icon
          as={CheckIcon}
          size={12}
          strokeWidth={Platform.OS === "web" ? 2.5 : 3.5}
          className={cn("text-primary-foreground", iconClassName)}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
