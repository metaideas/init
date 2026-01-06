import type * as React from "react"
import { cn } from "@init/utils/ui"
import { Icon } from "#components/icon.tsx"

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
