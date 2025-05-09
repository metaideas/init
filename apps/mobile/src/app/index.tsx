import { Icon } from "@roninoss/icons"
import { Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Button } from "@init/native-ui/_components/button"
import { Text } from "@init/native-ui/_components/text"
import { useAppForm } from "@init/native-ui/components/form"
import { useColorScheme } from "@init/native-ui/hooks/_use-color-scheme"
import { captureException } from "@init/observability/error/expo"

export default function Page() {
  const { colors } = useColorScheme()

  const form = useAppForm({
    defaultValues: { name: "John Doe" },
    onSubmit: async ({ value }) => {
      await new Promise(resolve => setTimeout(resolve, 5000))
      console.log(value)
    },
  })

  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-y-4">
      <Text className="font-bold text-4xl">Init Mobile</Text>

      <Button variant="tonal" size="icon">
        <Icon
          name="heart"
          color={Platform.OS === "ios" ? colors.primary : colors.foreground}
          size={21}
        />
      </Button>

      <Button
        onPress={() => {
          captureException(`Tested Sentry out ${Date.now()}`)
        }}
      >
        <Text>Sentry Test</Text>
      </Button>

      <form.AppForm>
        <form.AppField name="name">
          {field => (
            <field.Item className="w-full">
              <field.Label>Name</field.Label>
              <field.Control>
                <field.Input autoComplete="name" />
              </field.Control>
              <field.Message />
            </field.Item>
          )}
        </form.AppField>
        <form.SubmitButton
          className="w-full"
          loadingText="Submitting..."
          onPress={() => form.handleSubmit()}
        >
          <Text>Submit</Text>
        </form.SubmitButton>
      </form.AppForm>
    </SafeAreaView>
  )
}
