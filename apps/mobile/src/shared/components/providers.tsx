import type { ReactNode } from "react"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { SafeAreaProvider } from "react-native-safe-area-context"

import ThemeProvider from "~/shared/components/theme-provider"
import { TRPCProvider } from "~/shared/trpc"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <TRPCProvider>
      <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
        <ThemeProvider>
          <SafeAreaProvider>{children}</SafeAreaProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </TRPCProvider>
  )
}
