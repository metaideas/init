import { Button } from "@init/native-ui/components/button"
import { Text } from "@init/native-ui/components/text"
import { monitoringWrap } from "@init/observability/monitoring/expo"
import { type ErrorBoundaryProps, Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { View } from "react-native"
import Providers from "#shared/components/providers.tsx"
import { useHideSplashScreen } from "#shared/hooks.ts"
import { logger } from "#shared/logger.ts"

import "#shared/styles/globals.css"

void SplashScreen.preventAutoHideAsync()

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    logger.error("Route rendering failed", { error })
  }, [error])

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-background px-6">
      <View className="items-center gap-2">
        <Text className="text-center" variant="h3">
          Something went wrong
        </Text>
        <Text className="text-center" variant="muted">
          The screen could not be loaded. Try rendering it again.
        </Text>
      </View>
      <Button
        accessibilityRole="button"
        onPress={() => {
          void retry()
        }}
      >
        <Text>Try again</Text>
      </Button>
    </View>
  )
}

function RootLayout() {
  useHideSplashScreen(true)

  return (
    <Providers>
      <Stack />
    </Providers>
  )
}

export default monitoringWrap(RootLayout)
