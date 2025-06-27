import { captureException } from "@init/observability/error/expo"
import { Icon } from "@roninoss/icons"
import { Link } from "expo-router"
import { Platform, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "~/shared/components/ui/button"
import { Text } from "~/shared/components/ui/text"
import { useColorScheme } from "~/shared/hooks"

export default function WelcomeConsentScreen() {
  const { colors } = useColorScheme()

  return (
    <SafeAreaView className="flex-1">
      <View className="mx-auto max-w-sm flex-1 justify-between gap-4 px-8 py-4 ">
        <View className="ios:pt-8 pt-12">
          <Text
            className="ios:text-left text-center font-bold ios:font-black"
            variant="largeTitle"
          >
            Welcome to your
          </Text>
          <Text
            className="ios:text-left text-center font-bold ios:font-black text-primary"
            variant="largeTitle"
          >
            Application
          </Text>
        </View>
        <View className="gap-8">
          {FEATURES.map((feature) => (
            <View className="flex-row gap-4" key={feature.title}>
              <View className="pt-px">
                <Icon
                  color={colors.primary}
                  ios={{ renderingMode: "hierarchical" }}
                  name={feature.icon}
                  size={38}
                />
              </View>
              <View className="flex-1">
                <Text className="font-bold">{feature.title}</Text>
                <Text variant="footnote">{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>
        <View className="gap-4">
          <View className="items-center">
            <Icon
              color={colors.primary}
              ios={{ renderingMode: "hierarchical" }}
              name="account-multiple"
              size={24}
            />
            <Text className="pt-1 text-center" variant="caption2">
              By pressing continue, you agree to our{" "}
              <Link href="/">
                <Text className="text-primary" variant="caption2">
                  Terms of Service
                </Text>
              </Link>{" "}
              and that you have read our{" "}
              <Link href="/">
                <Text className="text-primary" variant="caption2">
                  Privacy Policy
                </Text>
              </Link>
            </Text>
          </View>
          <Button
            onPress={() =>
              captureException(new Error("Tracking first error!!!"))
            }
            variant="tonal"
          >
            <Text>Report an error</Text>
          </Button>
          <Link asChild href="/profile" replace>
            <Button size={Platform.select({ ios: "lg", default: "md" })}>
              <Text>Continue</Text>
            </Button>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  )
}

const FEATURES = [
  {
    title: "Profile Management",
    description:
      "Easily update and manage your personal information, settings, and preferences",
    icon: "account-circle-outline",
  },
  {
    title: "Secure Messaging",
    description: "Chat securely with friends and family in real-time.",
    icon: "message-processing",
  },
  {
    title: "Activity Tracking",
    description:
      "Monitor your daily activities and track your progress over time.",
    icon: "chart-timeline-variant",
  },
] as const
