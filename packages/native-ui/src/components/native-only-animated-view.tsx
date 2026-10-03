import { Platform, Pressable } from "react-native"
import Animated from "react-native-reanimated"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

/**
 * This component is used to wrap animated views that should only be animated on native.
 *
 * @example
 *   ;<NativeOnlyAnimatedView entering={FadeIn} exiting={FadeOut}>
 *     <Text>I am only animated on native</Text>
 *   </NativeOnlyAnimatedView>
 *
 * @param props - The props for the animated view.
 *
 * @returns The animated view if the platform is native, otherwise the children.
 */
function NativeOnlyAnimatedView(
  props:
    | (Omit<React.ComponentProps<typeof Animated.View>, "children">
        & React.RefAttributes<typeof Animated.View> & {
          as?: "View"
          children?: React.ReactNode
        })
    | (Omit<React.ComponentProps<typeof AnimatedPressable>, "children">
        & React.RefAttributes<typeof AnimatedPressable> & {
          as: "Pressable"
          children?: React.ReactNode
        })
) {
  if (Platform.OS === "web") {
    return props.children
  }
  if (props.as === "Pressable") {
    return <AnimatedPressable {...props} />
  }
  return <Animated.View {...props} />
}

export { NativeOnlyAnimatedView }
