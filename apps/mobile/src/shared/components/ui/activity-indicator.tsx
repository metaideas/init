import { ActivityIndicator as RNActivityIndicator } from "react-native"
import { useUnistyles } from "react-native-unistyles"

function ActivityIndicator(props: React.ComponentPropsWithoutRef<typeof RNActivityIndicator>) {
  const { theme } = useUnistyles()
  return <RNActivityIndicator color={theme.colors.primary} {...props} />
}

export { ActivityIndicator }
