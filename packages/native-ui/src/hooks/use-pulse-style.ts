import * as React from "react"
import { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated"

function usePulseStyle(duration: number) {
  const opacity = useSharedValue(1)

  // An animation returned directly from `useAnimatedStyle` starts at its target value, so the
  // pulse must run on a shared value that starts at full opacity.
  React.useEffect(() => {
    opacity.set(withRepeat(withTiming(0.5, { duration }), -1, true))
  }, [duration, opacity])

  return useAnimatedStyle(() => ({ opacity: opacity.get() }))
}

export { usePulseStyle }
