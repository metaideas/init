import type { ReactNode } from "react"
import { cn } from "cn"

export default function ShowcaseDemo({
  children,
  className,
  label,
}: Readonly<{ children: ReactNode; className?: string; label: string }>) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className={cn("flex flex-wrap items-center gap-3", className)}>{children}</div>
    </div>
  )
}
