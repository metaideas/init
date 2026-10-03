import { Button, Column, Host, Row, Text as UniversalText } from "@expo/ui"
import { Text, View } from "react-native"
import { LargeTitleHeader } from "#shared/components/large-title-header.ts"
import { usePersistedLocale } from "#shared/hooks.ts"
import { m } from "#shared/internationalization/messages.js"

export default function Screen() {
  const { locale, selectLocale } = usePersistedLocale()

  return (
    <>
      <LargeTitleHeader title={m.mobile_home_title({}, { locale })} />
      <View className="flex-1 justify-center gap-6 bg-background px-6">
        <WelcomeCard
          description={m.mobile_home_description({}, { locale })}
          title={m.mobile_home_title({}, { locale })}
        />
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Column alignment="center" spacing={12}>
            <UniversalText>{m.shared_locale_switch({}, { locale })}</UniversalText>
            <Row spacing={8}>
              <Button
                label={m.shared_locale_english({}, { locale })}
                onPress={() => {
                  void selectLocale("en")
                }}
                variant={locale === "en" ? "filled" : "outlined"}
              />
              <Button
                label={m.shared_locale_spanish({}, { locale })}
                onPress={() => {
                  void selectLocale("es")
                }}
                variant={locale === "es" ? "filled" : "outlined"}
              />
            </Row>
          </Column>
        </Host>
      </View>
    </>
  )
}

function WelcomeCard({ description, title }: { description: string; title: string }) {
  return (
    <View className="gap-2 rounded-xl border border-border bg-card p-6">
      <Text className="text-lg font-semibold text-card-foreground">{title}</Text>
      <Text className="text-base leading-6 text-muted-foreground">{description}</Text>
    </View>
  )
}
