import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"

export function useHideSplashScreen(loaded: boolean) {
  useEffect(() => {
    if (!loaded) {
      return
    }

    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync()
      } catch (error) {
        // TODO: Replace with logger
        console.warn(error, "Error hiding splash screen:")
      }
    }

    void hideSplash()
  }, [loaded])
}
