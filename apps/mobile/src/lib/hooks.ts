import { useColorScheme as useNativewindColorScheme } from "nativewind"

export function useColorScheme() {
  const colorScheme = useNativewindColorScheme()

  return {
    isDarkColorScheme: colorScheme.colorScheme === "dark",
    isLightColorScheme: colorScheme.colorScheme === "light",
    ...colorScheme,
  }
}
