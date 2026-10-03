import type * as React from "react"
import type { View } from "react-native"
import { cn } from "cn"
import Animated from "react-native-reanimated"
import { usePulseStyle } from "#hooks/use-pulse-style.ts"

const duration = 1000

function Skeleton({
  className,
  ...props
}: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  const style = usePulseStyle(duration)

  return (
    <Animated.View
      style={style}
      className={cn("rounded-md bg-secondary dark:bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
