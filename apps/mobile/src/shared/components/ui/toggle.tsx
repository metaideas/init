import type { ComponentPropsWithoutRef } from "react"
import { Switch } from "react-native"
import { useColorScheme } from "~/shared/hooks"
import { COLORS } from "~/shared/theme/colors"

function Toggle(props: ComponentPropsWithoutRef<typeof Switch>) {
  const { colors } = useColorScheme()
  return (
    <Switch
      thumbColor={COLORS.white}
      trackColor={{
        true: colors.primary,
        false: colors.grey,
      }}
      {...props}
    />
  )
}

export { Toggle }
