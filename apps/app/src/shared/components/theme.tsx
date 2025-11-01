import { Button } from "@init/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@init/ui/components/dropdown-menu"
import { Icon } from "@init/ui/components/icon"
import { THEME_COOKIE_NAME } from "@init/utils/constants"
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import { useCookieStore } from "~/shared/hooks"

const ACTUAL_THEMES = ["light", "dark"] as const
const THEMES = [...ACTUAL_THEMES, "system"] as const

type ActualTheme = (typeof ACTUAL_THEMES)[number]
type Theme = (typeof THEMES)[number]

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: ActualTheme
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [theme, setTheme] = useCookieStore<Theme>(THEME_COOKIE_NAME, "system")
  const [resolvedTheme, setResolvedTheme] = useState<ActualTheme>("light")

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const getResolvedTheme = (currentTheme: Theme): ActualTheme => {
      if (currentTheme === "system") {
        return mediaQuery.matches ? "dark" : "light"
      }
      return currentTheme as ActualTheme
    }

    const updateTheme = (currentTheme: Theme) => {
      const resolved = getResolvedTheme(currentTheme)
      setResolvedTheme(resolved)

      const root = document.documentElement
      root.classList.remove(...ACTUAL_THEMES)
      root.classList.add(resolved)
      root.style.colorScheme = resolved
    }

    updateTheme(theme)

    const handleChange = () => {
      if (theme === "system") {
        updateTheme(theme)
      }
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline">
          <Icon.Sun className="dark:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0" />
          <Icon.Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEMES.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption}
            onClick={() => setTheme(themeOption)}
          >
            {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
