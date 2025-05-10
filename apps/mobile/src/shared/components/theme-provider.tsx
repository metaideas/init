import { ThemeProvider as NavigationThemeProvider } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import type { ReactNode } from "react"

import { useColorScheme } from "@init/native-ui/hooks/use-color-scheme"
import { NAV_THEME } from "@init/native-ui/theme"

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const { colorScheme, isDarkColorScheme } = useColorScheme()

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? "light" : "dark"}`}
        style={isDarkColorScheme ? "light" : "dark"}
      />
      <NavigationThemeProvider value={NAV_THEME[colorScheme]}>
        {children}
      </NavigationThemeProvider>
    </>
  )
}
