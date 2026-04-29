import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Quattro Semi",
  slug: "quattro-semi",
  scheme: "quattrosemi",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.quattrosemi.game"
  },
  android: {
    package: "com.quattrosemi.game"
  },
  experiments: {
    typedRoutes: true
  },
  plugins: [
    "expo-router",
    [
      "expo-build-properties",
      {
        ios: {
          newArchEnabled: true
        },
        android: {
          newArchEnabled: true
        }
      }
    ]
  ],
  extra: {
    enableDebugRoutes:
      process.env.EXPO_PUBLIC_ENABLE_DEBUG_ROUTES === "true" || process.env.NODE_ENV !== "production"
  }
};

export default config;
