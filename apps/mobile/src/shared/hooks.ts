import NetInfo from "@react-native-community/netinfo"
import { onlineManager } from "@tanstack/react-query"
import { useFonts } from "expo-font"
import * as NavigationBar from "expo-navigation-bar"
import { SplashScreen } from "expo-router"
import { useColorScheme as useNativewindColorScheme } from "nativewind"
import { useEffect } from "react"
import { Platform } from "react-native"

import { COLORS } from "~/shared/theme/colors"

export function useColorScheme() {
  const { colorScheme, setColorScheme: setNativeWindColorScheme } =
    useNativewindColorScheme()

  async function setColorScheme(colorScheme: "light" | "dark") {
    setNativeWindColorScheme(colorScheme)
    if (Platform.OS !== "android") {
      return
    }

    try {
      await setNavigationBar(colorScheme)
    } catch (error) {
      console.error('useColorScheme.tsx", "setColorScheme', error)
    }
  }

  function toggleColorScheme() {
    return setColorScheme(colorScheme === "light" ? "dark" : "light")
  }

  return {
    colorScheme: colorScheme ?? "light",
    isDarkColorScheme: colorScheme === "dark",
    setColorScheme,
    toggleColorScheme,
    colors: COLORS[colorScheme ?? "light"],
  }
}

/**
 * Set the Android navigation bar color based on the color scheme.
 */
export function useInitialAndroidBarSync() {
  const { colorScheme } = useColorScheme()
  useEffect(() => {
    if (Platform.OS !== "android") {
      return
    }

    setNavigationBar(colorScheme).catch(error => {
      console.error('useColorScheme.tsx", "useInitialColorScheme', error)
    })
  }, [colorScheme])
}

function setNavigationBar(colorScheme: "light" | "dark") {
  return Promise.all([
    NavigationBar.setButtonStyleAsync(
      colorScheme === "dark" ? "light" : "dark"
    ),
    NavigationBar.setPositionAsync("absolute"),
    NavigationBar.setBackgroundColorAsync(
      colorScheme === "dark" ? "#00000030" : "#ffffff80"
    ),
  ])
}

export function useHideSplashScreen(loaded: boolean) {
  useEffect(() => {
    if (!loaded) {
      return
    }

    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync()
      } catch (error) {
        console.warn("Error hiding splash screen:", error)
      }
    }

    hideSplash()
  }, [loaded])
}

export function useOnlineStatus() {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const status = state.isConnected ?? false
      onlineManager.setOnline(status)
    })
    return () => unsubscribe()
  }, [])
}

export function useLoadFonts() {
  const [loaded] = useFonts({
    SpaceMono: require("../shared/assets/fonts/SpaceMono-Regular.ttf"),
  })

  return loaded
}
