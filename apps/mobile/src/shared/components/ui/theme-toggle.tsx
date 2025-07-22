import { cn } from "@init/utils/ui"
import { Icon } from "@roninoss/icons"
import { Pressable, View } from "react-native"
import Animated, {
  LayoutAnimationConfig,
  ZoomInRotate,
} from "react-native-reanimated"
import { useColorScheme } from "~/shared/hooks"
import { COLORS } from "~/shared/theme/colors"

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme()

  return (
    <LayoutAnimationConfig skipEntering>
      <Animated.View
        className="items-center justify-center"
        entering={ZoomInRotate}
        key={`toggle-${colorScheme}`}
      >
        <Pressable
          className="opacity-80"
          onPress={() => {
            setColorScheme(colorScheme === "dark" ? "light" : "dark")
          }}
        >
          {colorScheme === "dark"
            ? ({ pressed }) => (
                <View className={cn("px-0.5", pressed && "opacity-50")}>
                  <Icon
                    color={COLORS.white}
                    name="moon.stars"
                    namingScheme="sfSymbol"
                  />
                </View>
              )
            : ({ pressed }) => (
                <View className={cn("px-0.5", pressed && "opacity-50")}>
                  <Icon
                    color={COLORS.black}
                    name="sun.min"
                    namingScheme="sfSymbol"
                  />
                </View>
              )}
        </Pressable>
      </Animated.View>
    </LayoutAnimationConfig>
  )
}
