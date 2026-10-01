import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { log } from "#shared/logger.ts"

export function useHideSplashScreen(loaded: boolean) {
  useEffect(() => {
    if (!loaded) {
      return
    }

    async function hideSplash() {
      try {
        await SplashScreen.hideAsync()
      } catch (error) {
        log.warn({ error, message: "Error hiding splash screen" })
      }
    }

    void hideSplash()
  }, [loaded])
}
