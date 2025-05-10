import type { ComponentPropsWithoutRef } from "react"
import { Switch } from "react-native"

import { useColorScheme } from "../hooks/_use-color-scheme"
import { COLORS } from "../theme/colors"

function Toggle(props: ComponentPropsWithoutRef<typeof Switch>) {
  const { colors } = useColorScheme()
  return (
    <Switch
      trackColor={{
        true: colors.primary,
        false: colors.grey,
      }}
      thumbColor={COLORS.white}
      {...props}
    />
  )
}

export { Toggle }
