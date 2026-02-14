import { ActionSheetProvider } from "@expo/react-native-action-sheet"
import { monitoringWrap } from "@init/observability/monitoring/expo"
import { PortalHost } from "@rn-primitives/portal"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useHideSplashScreen } from "#shared/hooks.ts"
import { persister, queryClient } from "#shared/query-client.ts"

import "#shared/styles/globals.css"

void SplashScreen.preventAutoHideAsync()

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
      <ActionSheetProvider>
        <SafeAreaProvider>
          <Stack />
          <PortalHost />
        </SafeAreaProvider>
      </ActionSheetProvider>
    </PersistQueryClientProvider>
  )
}

export default monitoringWrap(RootLayout)
