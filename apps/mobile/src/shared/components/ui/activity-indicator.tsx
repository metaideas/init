import { ActivityIndicator as RNActivityIndicator } from "react-native"
import { useCSSVariable } from "uniwind"

function ActivityIndicator(props: React.ComponentPropsWithoutRef<typeof RNActivityIndicator>) {
  const primaryColor = useCSSVariable("--color-primary")
  const primary = typeof primaryColor === "string" ? primaryColor : undefined

  return <RNActivityIndicator color={primary} {...props} />
}

export { ActivityIndicator }
