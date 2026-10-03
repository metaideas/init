import { Button } from "@init/native-ui/components/button"
import {
  LargeTitleHeader,
  type LargeTitleSearchBarRef,
} from "@init/native-ui/components/large-title-header"
import { Text } from "@init/native-ui/components/text"
import { useRef } from "react"
import { View } from "react-native"
import { useCSSVariable } from "uniwind"
import { usePersistedLocale, useSearchBarState } from "#shared/hooks.ts"
import { m } from "#shared/internationalization/messages.js"

export default function Screen() {
  const backgroundValue = useCSSVariable("--color-background")
  const background = typeof backgroundValue === "string" ? backgroundValue : undefined
  const { locale, selectLocale } = usePersistedLocale()
  const { isSearching, searchBarHandlers } = useSearchBarState()
  const searchBarRef = useRef<LargeTitleSearchBarRef>(null)

  return (
    <>
      <LargeTitleHeader
        backgroundColor={background}
        searchBar={{ ...searchBarHandlers, ref: searchBarRef }}
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
