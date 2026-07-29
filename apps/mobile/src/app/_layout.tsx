import { ActionSheetProvider } from "@expo/react-native-action-sheet"
import { Button } from "@init/native-ui/components/button"
import { Text } from "@init/native-ui/components/text"
import { monitoringWrap } from "@init/observability/monitoring/expo"
import { PortalHost } from "@rn-primitives/portal"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { type ErrorBoundaryProps, Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { View } from "react-native"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useHideSplashScreen } from "#shared/hooks.ts"
import { logger } from "#shared/logger.ts"
import { persister, queryClient } from "#shared/query-client.ts"

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
    <PersistQueryClientProvider
      client={queryClient}
      onSuccess={async () => {
        await queryClient.resumePausedMutations()
        void queryClient.invalidateQueries()
      }}
      persistOptions={{ persister }}
    >
      <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
        <ActionSheetProvider>
          <SafeAreaProvider>
            <Stack />
            <PortalHost />
          </SafeAreaProvider>
        </ActionSheetProvider>
      </KeyboardProvider>
    </PersistQueryClientProvider>
  )
}

export default monitoringWrap(RootLayout)
