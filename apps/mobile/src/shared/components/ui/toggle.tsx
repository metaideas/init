import { Switch, type SwitchProps } from "react-native"
import { useUnistyles } from "react-native-unistyles"

function Toggle(props: SwitchProps) {
  const { theme } = useUnistyles()

  return (
    <Switch
      thumbColor={theme.colors.white}
      trackColor={{
        true: theme.colors.primary,
        false: theme.colors.grey,
      }}
      {...props}
    />
  )
}

export { Toggle }
