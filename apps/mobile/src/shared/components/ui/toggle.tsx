import { Switch, type SwitchProps } from "react-native"
import { useCSSVariable } from "uniwind"

function Toggle(props: SwitchProps) {
  const whiteValue = useCSSVariable("--color-white")
  const greyValue = useCSSVariable("--color-grey")
  const primaryValue = useCSSVariable("--color-primary")
  const white = typeof whiteValue === "string" ? whiteValue : undefined
  const grey = typeof greyValue === "string" ? greyValue : undefined
  const primary = typeof primaryValue === "string" ? primaryValue : undefined

  return (
    <Switch
      thumbColor={white}
      trackColor={{
        false: grey,
        true: primary,
      }}
      {...props}
    />
  )
}

export { Toggle }
