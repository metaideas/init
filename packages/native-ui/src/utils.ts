import { isLiquidGlassAvailable } from "expo-glass-effect"

export function checkIsLiquidGlassSupported() {
  return isLiquidGlassAvailable()
}
