import * as SeparatorPrimitive from "@rn-primitives/separator"
/* eslint-disable import/namespace -- oxlint cannot resolve the `export *` re-exports in the @rn-primitives dist bundles */
import { cn } from "cn"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
