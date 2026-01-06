import type { ConfigContext, ExpoConfig } from "expo/config"

const APP_ID = "init"
const APP_NAME = "Init"
const APP_OWNER = "metaideas"
const APP_BUNDLE_IDENTIFIER = `app.${APP_OWNER}.${APP_ID}`
const VERSION = "1.0.0"

const expoConfig: ExpoConfig = {
  android: {
    adaptiveIcon: {
      backgroundColor: "#ffffff",
      foregroundImage: "./src/shared/assets/images/adaptive-icon.png",
    },
    edgeToEdgeEnabled: true,
    package: APP_BUNDLE_IDENTIFIER,
    predictiveBackGestureEnabled: false,
  },
  experiments: {
    reactCompiler: true,
    typedRoutes: true,
  },
  icon: "./src/shared/assets/images/icon.png",
  ios: {
    bundleIdentifier: APP_BUNDLE_IDENTIFIER,
    supportsTablet: true,
  },
  name: APP_NAME,
  newArchEnabled: true,
  orientation: "portrait",
  owner: APP_OWNER,
  plugins: [
    "expo-font",
    "expo-router",
    "expo-secure-store",
    "expo-web-browser",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#ffffff",
        image: "./src/shared/assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
      },
    ],
    ["expo-dev-client", { launchMode: "most-recent" }],
    [
      "@sentry/react-native/expo",
      {
        organization: process.env.EXPO_PUBLIC_SENTRY_ORG,
        project: process.env.EXPO_PUBLIC_SENTRY_PROJECT,
        url: process.env.EXPO_PUBLIC_SENTRY_URL,
      },
    ],
  ],
  scheme: APP_ID,
  slug: APP_ID,
  userInterfaceStyle: "automatic",
  version: VERSION,
  web: {
    favicon: "./src/shared/assets/images/favicon.png",
    output: "static",
  },
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  ...expoConfig,
})
