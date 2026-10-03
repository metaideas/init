import { cn } from "cn"

function AspectRatio({
  ratio,
  className,
  ...props
}: React.ComponentProps<"div"> & { ratio: number }) {
  const style: React.CSSProperties & Record<"--ratio", number> = { "--ratio": ratio }

  return (
    <div
      data-slot="aspect-ratio"
      style={style}
      className={cn("relative aspect-(--ratio)", className)}
      {...props}
    />
  )
}

export { AspectRatio }
