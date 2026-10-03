import type { PropsWithChildren } from "react"
import { ActionSheetProvider } from "@expo/react-native-action-sheet"
import { PortalHost } from "@rn-primitives/portal"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { persister, queryClient } from "#shared/query-client.ts"
import ThemeProvider from "#shared/theme/theme-provider.tsx"

export default function Providers({ children }: PropsWithChildren) {
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
            <ThemeProvider>
              {children}
              <PortalHost />
            </ThemeProvider>
          </SafeAreaProvider>
        </ActionSheetProvider>
      </KeyboardProvider>
    </PersistQueryClientProvider>
  )
}
