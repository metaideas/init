import type { View } from "react-native"
import { cn } from "@init/utils/ui"
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
  const sv = useSharedValue(1)

  React.useEffect(() => {
    sv.value = withRepeat(withTiming(0.5, { duration }), -1, true)
  }, [sv, sv.value])

  const style = useAnimatedStyle(
    () => ({
      opacity: sv.value,
    }),
    [sv]
  )
  return (
    <Animated.View
      style={style}
      className={cn("rounded-md bg-secondary dark:bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
