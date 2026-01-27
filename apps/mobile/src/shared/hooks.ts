import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { logger } from "#shared/logger.ts"

export function useHideSplashScreen(loaded: boolean) {
  useEffect(() => {
    if (!loaded) {
      return
    }

    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync()
      } catch (error) {
        logger.warn("Error hiding splash screen:", { error })
      }
    }

    void hideSplash()
  }, [loaded])
}
