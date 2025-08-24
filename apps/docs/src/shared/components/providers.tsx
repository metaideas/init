import { RootProvider } from "fumadocs-ui/provider"
import type { ReactNode } from "react"

export default function Providers({ children }: { children: ReactNode }) {
  return <RootProvider>{children}</RootProvider>
}
