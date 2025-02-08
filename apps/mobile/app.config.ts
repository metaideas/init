import type { ConfigContext, ExpoConfig } from "expo/config"

const APP_ID = "thisapp"
const APP_NAME = "This App"

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  android: {
    adaptiveIcon: {
      backgroundColor: "#ffffff",
      foregroundImage: "./src/assets/images/adaptive-icon.png",
    },
  },
  experiments: {
    typedRoutes: true,
  },
  icon: "./src/assets/images/icon.png",
  ios: {
    privacyManifests: {
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
          NSPrivacyAccessedAPITypeReasons: ["CA92.1"],
        },
        {
          NSPrivacyAccessedAPIType:
            "NSPrivacyAccessedAPICategorySystemBootTime",
          NSPrivacyAccessedAPITypeReasons: ["35F9.1"],
        },
        {
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryFileTimestamp",
          NSPrivacyAccessedAPITypeReasons: ["C617.1"],
        },
      ],
      // Required for Sentry to work:
      NSPrivacyCollectedDataTypes: [
        {
          NSPrivacyCollectedDataType: "NSPrivacyCollectedDataTypeCrashData",
          NSPrivacyCollectedDataTypeLinked: false,
          NSPrivacyCollectedDataTypePurposes: [
            "NSPrivacyCollectedDataTypePurposeAppFunctionality",
          ],
          NSPrivacyCollectedDataTypeTracking: false,
        },
        {
          NSPrivacyCollectedDataType:
            "NSPrivacyCollectedDataTypePerformanceData",
          NSPrivacyCollectedDataTypeLinked: false,
          NSPrivacyCollectedDataTypePurposes: [
            "NSPrivacyCollectedDataTypePurposeAppFunctionality",
          ],
          NSPrivacyCollectedDataTypeTracking: false,
        },
        {
          NSPrivacyCollectedDataType:
            "NSPrivacyCollectedDataTypeOtherDiagnosticData",
          NSPrivacyCollectedDataTypeLinked: false,
          NSPrivacyCollectedDataTypePurposes: [
            "NSPrivacyCollectedDataTypePurposeAppFunctionality",
          ],
          NSPrivacyCollectedDataTypeTracking: false,
        },
      ],
    },
    supportsTablet: true,
  },
  name: APP_NAME,
  newArchEnabled: true,
  orientation: "portrait",
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#ffffff",
        image: "./src/assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
      },
    ],
    [
      "expo-dev-launcher",
      {
        launcherMode: "most-recent",
      },
    ],
    [
      "@sentry/react-native/expo",
      {
        organization: process.env.EXPO_PUBLIC_SENTRY_ORGANIZATION,
        project: process.env.EXPO_PUBLIC_SENTRY_PROJECT,
        url: process.env.EXPO_PUBLIC_SENTRY_URL,
      },
    ],
  ],
  scheme: APP_ID,
  slug: APP_ID,
  userInterfaceStyle: "automatic",
  version: "1.0.0",
  web: {
    bundler: "metro",
    favicon: "./src/assets/images/favicon.png",
    output: "static",
  },
})
