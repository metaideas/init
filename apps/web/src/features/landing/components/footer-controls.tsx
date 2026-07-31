import { Button } from "@init/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@init/ui/components/dropdown-menu"
import { Icon } from "@init/ui/components/icon"
import { ThemeProvider, useTheme } from "@init/ui/components/theme"
import { THEME_STORAGE_KEY } from "@init/ui/constants"
import { GITHUB_URL, SITE_NAME } from "#shared/constants.ts"
import { m } from "#shared/internationalization/messages.js"
import { setLocale } from "#shared/internationalization/runtime.js"

export default function FooterControls() {
  return (
    <ThemeProvider storageKey={THEME_STORAGE_KEY}>
      <div className="flex items-center gap-0.5">
        <LocaleToggle />
        <Button
          render={
            <a
              href={GITHUB_URL}
              aria-label={m.web_landing_controls_github_aria({ name: SITE_NAME })}
              title="GitHub"
            />
          }
          className={controlClassName}
          size="icon-lg"
          variant="ghost"
        >
          <Icon.GitHub className="size-[1.15rem] fill-current" />
        </Button>
        <FooterThemeToggle />
      </div>
    </ThemeProvider>
  )
}

function LocaleToggle() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className={controlClassName}
            size="icon-lg"
            type="button"
            variant="ghost"
            aria-label={m.shared_locale_switch()}
            title={m.shared_locale_switch()}
          />
        }
      >
        <Icon.Languages className="size-[1.15rem]" />
        <span className="sr-only">{m.shared_locale_switch()}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top">
        <DropdownMenuItem
          onClick={() => {
            void setLocale("en")
          }}
        >
          🇺🇸 {m.shared_locale_english()}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            void setLocale("es")
          }}
        >
          🇪🇸 {m.shared_locale_spanish()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function FooterThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className={controlClassName}
            size="icon-lg"
            type="button"
            variant="ghost"
            aria-label={m.web_landing_controls_theme_toggle()}
            title={m.web_landing_controls_theme_toggle()}
          />
        }
      >
        <Icon.Sun className="size-[1.15rem] dark:hidden" />
        <Icon.Moon className="hidden size-[1.15rem] dark:block" />
        <span className="sr-only">{m.web_landing_controls_theme_toggle()}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top">
        <DropdownMenuItem
          onClick={() => {
            setTheme("light")
          }}
        >
          {m.web_landing_controls_theme_light()}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme("dark")
          }}
        >
          {m.web_landing_controls_theme_dark()}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme("system")
          }}
        >
          {m.web_landing_controls_theme_system()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const controlClassName =
  "size-11 touch-manipulation text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 focus-visible:ring-sky-500/30 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
