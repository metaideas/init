import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
  type Theme,
} from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { type ReactNode, useLayoutEffect, useRef, useState } from "react"
import { NAV_THEME } from "~/lib/constants"
import { useColorScheme } from "~/lib/hooks"

const LIGHT_THEME: Theme = { ...DefaultTheme, colors: NAV_THEME.light }
const DARK_THEME: Theme = { ...DarkTheme, colors: NAV_THEME.dark }

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
