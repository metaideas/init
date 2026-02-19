import { cn } from "@init/utils/ui"
import * as SwitchPrimitives from "@rn-primitives/switch"
import { Platform } from "react-native"

function Switch({
  className,
  ...props
}: SwitchPrimitives.RootProps & React.RefAttributes<SwitchPrimitives.RootRef>) {
  return (
    <SwitchPrimitives.Root
      className={cn(
        "flex h-[1.15rem] w-8 shrink-0 flex-row items-center rounded-full border border-transparent shadow-sm shadow-black/5",
        Platform.select({
          web: "focus-visible:border-ring focus-visible:ring-ring/50 peer inline-flex outline-none transition-all focus-visible:ring-[3px] disabled:cursor-not-allowed",
        }),
        props.checked ? "bg-primary" : "bg-input dark:bg-input/80",
        props.disabled && "opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "size-4 rounded-full bg-background transition-transform",
          Platform.select({
            web: "pointer-events-none block ring-0",
          }),
          props.checked
            ? "translate-x-3.5 dark:bg-primary-foreground"
            : "translate-x-0 dark:bg-foreground"
        )}
      />
    </SwitchPrimitives.Root>
  )
}

export { Switch }
