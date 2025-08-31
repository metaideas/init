import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { UnistylesRuntime } from "react-native-unistyles"
import Providers from "~/shared/components/providers"
import { useHideSplashScreen } from "~/shared/hooks"

SplashScreen.preventAutoHideAsync()
UnistylesRuntime.setRootViewBackgroundColor("black")

export default function RootLayout() {
  // Set any conditions to be met before hiding the splash screen
  useHideSplashScreen(true)

  return (
    <Providers>
      <Stack />
    </Providers>
  )
}
