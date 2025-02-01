import { useFonts } from "expo-font"
import { SplashScreen } from "expo-router"
import { type ReactNode, useEffect } from "react"

export default function FontLoader({ children }: { children: ReactNode }) {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return children
}
