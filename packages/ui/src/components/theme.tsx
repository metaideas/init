import { THEME_STORAGE_KEY, type themes } from "@init/utils/constants"
import {
  // We're using next-themes even though is specialized in Next.js, it works in
  // other environments such as Vite apps
  ThemeProvider as NextThemeProvider,
  type ThemeProviderProps as NextThemeProviderProps,
  useTheme,
} from "next-themes"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { Icon } from "./icon"

export function ThemeProvider({ children, ...props }: NextThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableColorScheme
      enableSystem
      storageKey={THEME_STORAGE_KEY}
      themes={["light", "dark", "system"] satisfies typeof themes}
      {...props}
    >
      {children}
    </NextThemeProvider>
  )
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
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { useTheme } from "next-themes"
