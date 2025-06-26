import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import type { ReactNode } from "react"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { SafeAreaProvider } from "react-native-safe-area-context"

import ThemeProvider from "~/shared/components/theme-provider"
import { persister, queryClient } from "~/shared/query-client"
import { TRPCProvider } from "~/shared/trpc"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
      onSuccess={async () => {
        // Resume paused mutations when back online
        await queryClient.resumePausedMutations()
        queryClient.invalidateQueries()
      }}
    >
      <TRPCProvider>
        <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
          <ThemeProvider>
            <SafeAreaProvider>{children}</SafeAreaProvider>
          </ThemeProvider>
        </KeyboardProvider>
      </TRPCProvider>
    </PersistQueryClientProvider>
  )
}
