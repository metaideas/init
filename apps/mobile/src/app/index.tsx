import { Button } from "@init/native-ui/components/button"
import {
  LargeTitleHeader,
  type LargeTitleSearchBarRef,
} from "@init/native-ui/components/large-title-header"
import { Text } from "@init/native-ui/components/text"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useRef, useState } from "react"
import { View } from "react-native"
import { useCSSVariable } from "uniwind"
import { m } from "#shared/internationalization/messages.js"
import {
  getLocale,
  type Locale,
  locales,
  setLocale as setParaglideLocale,
} from "#shared/internationalization/runtime.js"

const LOCALE_STORAGE_KEY = "init-locale"

function checkIsLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value)
}

export default function Screen() {
  const background = useCSSVariable("--color-background")?.toString()
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [locale, setLocale] = useState<Locale>(() => getLocale())
  const [searchQuery, setSearchQuery] = useState("")
  const searchBarRef = useRef<LargeTitleSearchBarRef>(null)
  const isSearching = isSearchFocused || searchQuery.length > 0

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

  return (
    <>
      <LargeTitleHeader
        backgroundColor={background}
        searchBar={{
          onBlur: () => {
            setIsSearchFocused(false)
          },
          onCancelButtonPress: () => {
            setIsSearchFocused(false)
            setSearchQuery("")
          },
          onChangeText: (text) => {
            setSearchQuery(text)
          },
          onFocus: () => {
            setIsSearchFocused(true)
          },
          ref: searchBarRef,
        }}
        title={m.mobile_home_title({}, { locale })}
      />
      {isSearching ? null : (
        <View className="flex-1 items-center justify-center gap-8 bg-background">
          <View className="items-center justify-center gap-3 px-6">
            <Text className="text-center text-base leading-6 font-semibold text-primary">
              {m.mobile_home_title({}, { locale })}
            </Text>
            <Text className="text-center text-base leading-6 text-muted-foreground">
              {m.mobile_home_description({}, { locale })}
            </Text>
            <View
              accessibilityLabel={m.shared_locale_switch({}, { locale })}
              className="flex-row gap-2"
            >
              <Button
                accessibilityState={{ selected: locale === "en" }}
                onPress={() => {
                  void selectLocale("en")
                }}
                variant={locale === "en" ? "default" : "outline"}
              >
                <Text>{m.shared_locale_english({}, { locale })}</Text>
              </Button>
              <Button
                accessibilityState={{ selected: locale === "es" }}
                onPress={() => {
                  void selectLocale("es")
                }}
                variant={locale === "es" ? "default" : "outline"}
              >
                <Text>{m.shared_locale_spanish({}, { locale })}</Text>
              </Button>
            </View>
          </View>
        </View>
      )}
    </>
  )
}
