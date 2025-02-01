import { useColorScheme as useNativewindColorScheme } from "nativewind"

import { COLORS } from "~/lib/constants"

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof COLORS.light & keyof typeof COLORS.dark
) {
  const { colorScheme } = useNativewindColorScheme()
  const theme = colorScheme ?? "light"
  const colorFromProps = props[theme]

  if (colorFromProps) {
    return colorFromProps
  }

  return COLORS[theme][colorName]
}

export function useColorScheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } =
    useNativewindColorScheme()

  return {
    colorScheme: colorScheme ?? "dark",
    isDarkColorScheme: colorScheme === "dark",
    isLightColorScheme: colorScheme === "light",
    setColorScheme,
    toggleColorScheme,
  }
}
