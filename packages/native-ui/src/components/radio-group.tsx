import { cn } from "@init/utils/ui"
import * as RadioGroupPrimitive from "@rn-primitives/radio-group"
import { Platform } from "react-native"

function RadioGroup({
  className,
  ...props
}: RadioGroupPrimitive.RootProps & React.RefAttributes<RadioGroupPrimitive.RootRef>) {
  return <RadioGroupPrimitive.Root className={cn("gap-3", className)} {...props} />
}

function RadioGroupItem({
  className,
  ...props
}: RadioGroupPrimitive.ItemProps & React.RefAttributes<RadioGroupPrimitive.ItemRef>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "aspect-square size-4 shrink-0 items-center justify-center rounded-full border border-input shadow-sm shadow-black/5 dark:bg-input/30",
        Platform.select({
          web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive outline-none transition-all focus-visible:ring-[3px] disabled:cursor-not-allowed",
        }),
        props.disabled && "opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-primary" />
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
