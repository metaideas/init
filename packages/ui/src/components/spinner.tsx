import { cn } from "@init/utils/ui"
import type * as React from "react"
import { Icon } from "./icon"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Icon.Loader
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      role="status"
      {...props}
    />
  )
}

export { Spinner }
