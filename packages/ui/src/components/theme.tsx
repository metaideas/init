import { THEMES, type Theme } from "@init/utils/constants"
import { createContext, use, useEffect, useState } from "react"
import { Button } from "#components/button.tsx"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#components/dropdown-menu.tsx"
import { Icon } from "#components/icon.tsx"

type ThemeContextState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextState | undefined>(undefined)

type ThemeProviderProps =
  | {
      children: React.ReactNode
      storageKey: string
      theme?: never
      setTheme?: never
      defaultTheme?: Theme
    }
  | {
      children: React.ReactNode
      theme: Theme
      setTheme: (theme: Theme) => void
      defaultTheme?: Theme
      storageKey?: never
    }

export function ThemeProvider({
  children,
  theme,
  setTheme,
  defaultTheme = "system",
  storageKey,
}: ThemeProviderProps) {
  const [userTheme, setUserTheme] = useState<Theme>(() => {
    if (theme !== undefined) {
      return theme
    }

    if (storageKey && typeof globalThis !== "undefined") {
      const stored = localStorage.getItem(storageKey)
      if (stored && THEMES.includes(stored as Theme)) {
        return stored as Theme
      }
    }

    return defaultTheme
  })

  useEffect(() => {
    const root = document.documentElement
    const mediaQuery = globalThis.matchMedia?.("(prefers-color-scheme: dark)")

    function updateTheme() {
      root.classList.remove("light", "dark", "system")

      if (userTheme === "system") {
        const systemTheme = mediaQuery.matches ? "dark" : "light"
        root.classList.add(systemTheme)
      } else {
        root.classList.add(userTheme)
      }
    }

    mediaQuery.addEventListener("change", updateTheme)
    updateTheme()

    return () => {
      mediaQuery.removeEventListener("change", updateTheme)
    }
  }, [userTheme])

  const value = {
    setTheme(newTheme: Theme) {
      setUserTheme(newTheme)

      if (setTheme) {
        setTheme(newTheme)
        return
      }

      if (storageKey) {
        localStorage.setItem(storageKey, newTheme)
      }
    },
    theme: userTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = use(ThemeContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="icon" type="button" variant="outline" />}>
        <Icon.Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Icon.Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setTheme("light")
          }}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme("dark")
          }}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme("system")
          }}
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
