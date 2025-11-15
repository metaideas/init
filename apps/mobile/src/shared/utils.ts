import { isProduction } from "@init/utils/environment"
import { createUrlBuilder } from "@init/utils/url"
import { Appearance, Platform } from "react-native"
import env from "#shared/env.ts"

export const buildApiUrl = createUrlBuilder(
  env.EXPO_PUBLIC_API_URL,
  isProduction() ? "https" : "http"
)

export const isDarkMode = Appearance.getColorScheme() === "dark"

export const isIOS = Platform.OS === "ios"
export const isAndroid = Platform.OS === "android"

// @ts-expect-error - no index signature for globalThis
export const isFabric = Boolean(global?.nativeFabricUIManager)

export const ios = <T>(value: T) => (isIOS ? value : undefined)
export const android = <T>(value: T) => (isAndroid ? value : undefined)

export const platform = Platform.select
