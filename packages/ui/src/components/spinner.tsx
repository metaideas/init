import { Icon } from "#components/icon.tsx"
import { cn } from "#utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Icon.Loader
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
