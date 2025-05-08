import { useEffect } from "react"
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"

export default function useRotationAnimation(duration = 1000) {
  // Create the shared value and start the animation immediately
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false
    )
  }, [duration, rotation])

  return useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))
}
