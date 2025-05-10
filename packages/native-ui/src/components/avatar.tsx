import * as AvatarPrimitive from "@rn-primitives/avatar"
import type { ComponentProps } from "react"

import { cn } from "@init/utils/ui"

function Avatar(props: ComponentProps<typeof AvatarPrimitive.Root>) {
  const { alt, className, ...rest } = props
  return (
    <AvatarPrimitive.Root
      alt={alt}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...rest}
    />
  )
}

function AvatarImage(props: ComponentProps<typeof AvatarPrimitive.Image>) {
  const { className, ...rest } = props
  return (
    <AvatarPrimitive.Image
      className={cn("aspect-square h-full w-full", className)}
      {...rest}
    />
  )
}

function AvatarFallback(
  props: ComponentProps<typeof AvatarPrimitive.Fallback>
) {
  const { className, ...rest } = props
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...rest}
    />
  )
}

export { Avatar, AvatarFallback, AvatarImage }
