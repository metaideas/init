import { cn } from "@init/utils/ui"
import { Icon } from "#components/icon.tsx"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Icon.Loader
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
