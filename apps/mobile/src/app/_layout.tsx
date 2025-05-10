import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"

import "react-native-reanimated"

import { useInitialAndroidBarSync } from "@init/native-ui/hooks/use-color-scheme"
import { initializeErrorMonitoring, wrap } from "@init/observability/error/expo"
import "@init/native-ui/globals.css"

import Providers from "~/shared/components/providers"

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
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </Providers>
  )
}

export default wrap(RootLayout)
