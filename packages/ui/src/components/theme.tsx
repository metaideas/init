import { createContext, use } from "react"
import type { Theme } from "#constants.ts"
import { Button } from "#components/button.tsx"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#components/dropdown-menu.tsx"
import { Icon } from "#components/icon.tsx"
import { useThemeState } from "#hooks/use-theme-state.ts"

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
  const value = useThemeState({ defaultTheme, setTheme, storageKey, theme })

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
        <Icon.Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Icon.Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
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
