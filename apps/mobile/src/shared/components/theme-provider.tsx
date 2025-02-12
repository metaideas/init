import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native"
import type { Theme } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { useLayoutEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

import { NAVIGATION_THEME } from "~/shared/constants"
import { useColorScheme } from "~/shared/hooks"

const LIGHT_THEME: Theme = { ...DefaultTheme, colors: NAVIGATION_THEME.light }
const DARK_THEME: Theme = { ...DarkTheme, colors: NAVIGATION_THEME.dark }

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const hasMounted = useRef(false)
  const { isDarkColorScheme } = useColorScheme()
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false)

  useLayoutEffect(() => {
    if (hasMounted.current) {
      return
    }

    setIsColorSchemeLoaded(true)
    hasMounted.current = true
  }, [])

  if (!isColorSchemeLoaded) {
    return null
  }

  return (
    <NavigationThemeProvider
      value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}
    >
      <StatusBar style={isDarkColorScheme ? "light" : "dark"} />

      {children}
    </NavigationThemeProvider>
  )
}
