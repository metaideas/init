import type { Ref } from "react"
import { cn } from "@init/utils/ui"
import * as AvatarPrimitive from "@rn-primitives/avatar"

function Avatar({
  className,
  style,
  ...props
}: AvatarPrimitive.RootProps & { className?: string; ref: Ref<AvatarPrimitive.RootRef> }) {
  return (
    <AvatarPrimitive.Root
      className={cn("relative size-10 shrink-0 overflow-hidden rounded-full", className)}
      style={style}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  style,
  ...props
}: AvatarPrimitive.ImageProps & { className?: string; ref?: Ref<AvatarPrimitive.ImageRef> }) {
  return (
    <AvatarPrimitive.Image
      className={cn("aspect-square size-full", className)}
      style={style}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  style,
  ...props
}: AvatarPrimitive.FallbackProps & { className?: string; ref?: Ref<AvatarPrimitive.FallbackRef> }) {
  return (
    <AvatarPrimitive.Fallback
      className={cn("size-full items-center justify-center rounded-full bg-muted", className)}
      style={style}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
