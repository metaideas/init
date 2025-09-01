import type { ConfigContext, ExpoConfig } from "expo/config"

const APP_ID = "init"
const APP_NAME = "Init"
const APP_OWNER = "metaideas"
const APP_BUNDLE_IDENTIFIER = `app.${APP_OWNER}.${APP_ID}`
const VERSION = "1.0.0"

const expoConfig: ExpoConfig = {
  name: APP_NAME,
  slug: APP_ID,
  owner: APP_OWNER,
  version: VERSION,
  orientation: "portrait",
  icon: "./src/shared/assets/images/icon.png",
  scheme: APP_ID,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: APP_BUNDLE_IDENTIFIER,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./src/shared/assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: APP_BUNDLE_IDENTIFIER,
  },
  web: {
    output: "static",
    favicon: "./src/shared/assets/images/favicon.png",
  },
  plugins: [
    "expo-font",
    "expo-router",
    "expo-secure-store",
    "expo-web-browser",
    [
      "expo-splash-screen",
      {
        image: "./src/shared/assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    ["expo-dev-client", { launchMode: "most-recent" }],
    [
      "@sentry/react-native/expo",
      {
        url: process.env.EXPO_PUBLIC_SENTRY_URL,
        project: process.env.EXPO_PUBLIC_SENTRY_PROJECT,
        organization: process.env.EXPO_PUBLIC_SENTRY_ORG,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  ...expoConfig,
})
