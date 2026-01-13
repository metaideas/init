import type * as React from "react"
import { cn } from "@init/utils/ui"

function Label({ className, htmlFor, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      data-slot="label"
      htmlFor={htmlFor}
      {...props}
    />
  )
}

export { Label }
