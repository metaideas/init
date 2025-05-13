import type { ComponentPropsWithoutRef } from "react"
import { ActivityIndicator as RNActivityIndicator } from "react-native"

import { useColorScheme } from "../hooks/use-color-scheme"

function ActivityIndicator(
  props: ComponentPropsWithoutRef<typeof RNActivityIndicator>
) {
  const { colors } = useColorScheme()

  return <RNActivityIndicator color={colors.primary} {...props} />
}

export { ActivityIndicator }
