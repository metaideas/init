import { ActionSheetProvider } from "@expo/react-native-action-sheet"
import { PortalHost } from "@rn-primitives/portal"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import type { ReactNode } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { persister, queryClient } from "~/shared/query-client"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      onSuccess={async () => {
        // Resume paused mutations when back online
        await queryClient.resumePausedMutations()
        queryClient.invalidateQueries()
      }}
      persistOptions={{ persister }}
    >
      <ActionSheetProvider>
        <SafeAreaProvider>
          {children}

          <PortalHost />
        </SafeAreaProvider>
      </ActionSheetProvider>
    </PersistQueryClientProvider>
  )
}
