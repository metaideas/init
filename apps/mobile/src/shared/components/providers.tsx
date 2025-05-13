import type { ReactNode } from "react"
import { KeyboardProvider } from "react-native-keyboard-controller"

import ThemeProvider from "~/shared/components/theme-provider"
import { TRPCProvider } from "~/shared/trpc"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <TRPCProvider>
      <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
        <ThemeProvider>{children}</ThemeProvider>
      </KeyboardProvider>
    </TRPCProvider>
  )
}
