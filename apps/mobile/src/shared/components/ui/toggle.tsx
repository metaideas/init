import { Switch, type SwitchProps } from "react-native"
import { useUnistyles } from "react-native-unistyles"

function Toggle(props: SwitchProps) {
  const { theme } = useUnistyles()

  return (
    <Switch
      thumbColor={theme.colors.white}
      trackColor={{
        false: theme.colors.grey,
        true: theme.colors.primary,
      }}
      {...props}
    />
  )
}

export { Toggle }
