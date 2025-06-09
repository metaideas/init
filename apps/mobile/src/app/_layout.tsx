import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"

import "react-native-reanimated"

import {
  initializeErrorMonitoring,
  monitoringWrap,
} from "@init/observability/error/expo"
import Providers from "~/shared/components/providers"
import { useInitialAndroidBarSync } from "~/shared/hooks/use-color-scheme"

import "~/shared/assets/styles/globals.css"

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

initializeErrorMonitoring()

function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../shared/assets/fonts/SpaceMono-Regular.ttf"),
  })
  useInitialAndroidBarSync()

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  return (
    <Providers>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </Providers>
  )
}

export default monitoringWrap(RootLayout)
