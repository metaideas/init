import type { View } from "react-native"
import { cn } from "cn"
import * as React from "react"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"

const duration = 1000

function Skeleton({
  className,
  ...props
}: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  const opacity = useSharedValue(1)

  // An animation returned directly from `useAnimatedStyle` starts at its target value, so the
  // pulse must run on a shared value that starts at full opacity.
  React.useEffect(() => {
    opacity.set(withRepeat(withTiming(0.5, { duration }), -1, true))
  }, [opacity])

  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }))

  return (
    <Animated.View
      style={style}
      className={cn("rounded-md bg-secondary dark:bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
