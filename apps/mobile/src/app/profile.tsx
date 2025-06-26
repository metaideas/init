import { cn } from "@init/utils/ui"
import { useStore } from "@tanstack/react-form"
import { Stack } from "expo-router"
import { Alert, Platform, View } from "react-native"
import {
  KeyboardAwareScrollView,
  KeyboardController,
} from "react-native-keyboard-controller"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Button } from "~/shared/components/ui/button"
import { useAppForm } from "~/shared/components/ui/form"
import { Text } from "~/shared/components/ui/text"

export default function Screen() {
  const insets = useSafeAreaInsets()

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
    },
    onSubmit: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, 5000))

      Alert.alert(JSON.stringify(value))
    },
  })
  const canSubmit = useStore(form.store, (state) => state.canSubmit)

  return (
    <>
      <Stack.Screen
        options={{
          title: "Profile",
          headerTransparent: Platform.OS === "ios",
          headerBlurEffect: "systemMaterial",
          headerRight: Platform.select({
            ios: () => (
              <Button
                className="ios:px-0"
                disabled={!canSubmit}
                variant="plain"
              >
                <Text className={cn(canSubmit && "text-primary")}>Save</Text>
              </Button>
            ),
          }),
        }}
      />
      <KeyboardAwareScrollView
        bottomOffset={8}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        <form.AppForm>
          <View className="flex-1 gap-4 px-4">
            <form.Section ios={{ title: "Profile" }}>
              <form.AppField name="name">
                {(field) => (
                  <field.Item>
                    <field.TextInput
                      label={Platform.select({
                        ios: undefined,
                        default: "First",
                      })}
                      leftView={Platform.select({
                        ios: <field.LeftLabel>First</field.LeftLabel>,
                      })}
                      onSubmitEditing={() =>
                        KeyboardController.setFocusTo("next")
                      }
                      placeholder="Required"
                    />
                  </field.Item>
                )}
              </form.AppField>
              <form.Separator />
              <form.AppField name="email">
                {(field) => (
                  <field.Item>
                    <field.TextInput
                      label={Platform.select({
                        ios: undefined,
                        default: "Email",
                      })}
                      leftView={Platform.select({
                        ios: <field.LeftLabel>Email</field.LeftLabel>,
                      })}
                      onSubmitEditing={() =>
                        KeyboardController.setFocusTo("next")
                      }
                      placeholder="Required"
                    />
                  </field.Item>
                )}
              </form.AppField>
              <form.Separator />
              <form.AppField name="email">
                {(field) => (
                  <field.Item>
                    <field.TextInput
                      label={Platform.select({
                        ios: undefined,
                        default: "Email",
                      })}
                      leftView={Platform.select({
                        ios: <field.LeftLabel>Email</field.LeftLabel>,
                      })}
                      onSubmitEditing={() =>
                        KeyboardController.setFocusTo("next")
                      }
                      placeholder="Required"
                    />
                  </field.Item>
                )}
              </form.AppField>
            </form.Section>
            <form.SubmitButton>
              <Text>Save</Text>
            </form.SubmitButton>
          </View>
        </form.AppForm>
      </KeyboardAwareScrollView>
    </>
  )
}
