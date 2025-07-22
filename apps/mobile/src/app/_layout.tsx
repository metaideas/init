import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"

import "react-native-reanimated"

import {
  initializeErrorMonitoring,
  monitoringWrap,
} from "@init/observability/error/expo"
import Providers from "~/shared/components/providers"
import {
  useHideSplashScreen,
  useInitialAndroidBarSync,
  useLoadFonts,
  useOnlineStatus,
} from "~/shared/hooks"

import "~/shared/assets/styles/globals.css"

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

initializeErrorMonitoring()

function RootLayout() {
  useInitialAndroidBarSync()

  // Track online status for React Query
  useOnlineStatus()

  const fontsLoaded = useLoadFonts()
  useHideSplashScreen(fontsLoaded)

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
