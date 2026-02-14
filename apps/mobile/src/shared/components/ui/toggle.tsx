import { Switch, type SwitchProps } from "react-native"
import { useCSSVariable } from "uniwind"

function Toggle(props: SwitchProps) {
  const whiteValue = useCSSVariable("--color-white")
  const mutedValue = useCSSVariable("--color-muted")
  const primaryValue = useCSSVariable("--color-primary")
  const white = typeof whiteValue === "string" ? whiteValue : undefined
  const muted = typeof mutedValue === "string" ? mutedValue : undefined
  const primary = typeof primaryValue === "string" ? primaryValue : undefined

  return (
    <Switch
      thumbColor={white}
      trackColor={{
        false: muted,
        true: primary,
      }}
      {...props}
    />
  )
}

export { Toggle }
