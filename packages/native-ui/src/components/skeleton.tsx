import type * as React from "react"
import type { View } from "react-native"
import { cn } from "@init/utils/ui"
import Animated, { useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated"

const duration = 1000

function Skeleton({
  className,
  ...props
}: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  const style = useAnimatedStyle(() => ({
    opacity: withRepeat(withTiming(0.5, { duration }), -1, true),
  }))
  return (
    <Animated.View
      style={style}
      className={cn("rounded-md bg-secondary dark:bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
