import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { log } from "#shared/logger.ts"

export function useHideSplashScreen(loaded: boolean) {
  useEffect(() => {
    if (!loaded) {
      return
    }

    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync()
      } catch (error) {
        log.warn({ error, message: "Error hiding splash screen" })
      }
    }

    void hideSplash()
  }, [loaded])
}
