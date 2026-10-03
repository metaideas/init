import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import {
  getLocale,
  type Locale,
  locales,
  setLocale as setParaglideLocale,
} from "#shared/internationalization/runtime.js"
import { log } from "#shared/logger.ts"

const LOCALE_STORAGE_KEY = "init-locale"

export function useHideSplashScreen(loaded: boolean) {
  useEffect(() => {
    if (!loaded) {
      return
    }

    async function hideSplash() {
      try {
        await SplashScreen.hideAsync()
      } catch (error) {
        log.warn({ error, message: "Error hiding splash screen" })
      }
    }

    void hideSplash()
  }, [loaded])
}

export function useLogRenderError(error: unknown) {
  useEffect(() => {
    log.error({ error, message: "Route rendering failed" })
  }, [error])
}

export function usePersistedLocale() {
  const [locale, setLocale] = useState<Locale>(() => getLocale())

  useEffect(() => {
    async function hydrateLocale() {
      const storedLocale = await AsyncStorage.getItem(LOCALE_STORAGE_KEY)
      if (!storedLocale || !checkIsLocale(storedLocale)) return

      void setParaglideLocale(storedLocale, { reload: false })
      setLocale(storedLocale)
    }

    void hydrateLocale()
  }, [])

  async function selectLocale(nextLocale: Locale) {
    await AsyncStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
    void setParaglideLocale(nextLocale, { reload: false })
    setLocale(nextLocale)
  }

  return { locale, selectLocale }
}

export function useSearchBarState() {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  return {
    isSearching: isSearchFocused || searchQuery.length > 0,
    searchBarHandlers: {
      onBlur: () => {
        setIsSearchFocused(false)
      },
      onCancelButtonPress: () => {
        setIsSearchFocused(false)
        setSearchQuery("")
      },
      onChangeText: (text: string) => {
        setSearchQuery(text)
      },
      onFocus: () => {
        setIsSearchFocused(true)
      },
    },
  }
}

function checkIsLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value)
}
