import { useFonts } from "expo-font"
import type { FontSource } from "expo-font"
import { SplashScreen } from "expo-router"
import { useEffect } from "react"
import type { ReactNode } from "react"

export default function FontLoader({ children }: { children: ReactNode }) {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf") as FontSource,
  })

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return children
}
