import * as Sentry from "@sentry/react-native"
import { Link } from "expo-router"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Button } from "@init/native-ui/components/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@init/native-ui/components/collapsible"
import { useAppForm } from "@init/native-ui/components/form"
import { Text } from "@init/native-ui/components/text"

export default function Page() {
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

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button>
            <Text>Click me</Text>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <View className="my-4 flex items-center justify-center">
            <Text>Hello world!</Text>
          </View>
        </CollapsibleContent>
      </Collapsible>

      <Button
        onPress={() => {
          Sentry.captureException(new Error(Date.now().toString()))
        }}
      >
        <Text>Sentry Test</Text>
      </Button>

      <Link href="/+not-found" asChild>
        <Button variant="link">
          <Text>Go to not found</Text>
        </Button>
      </Link>

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
