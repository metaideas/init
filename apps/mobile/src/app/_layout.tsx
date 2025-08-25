import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useHideSplashScreen } from "~/shared/hooks"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  // Set any conditions to be met before hiding the splash screen
  useHideSplashScreen(true)

  return <Stack />
}
