import Constants from "expo-constants";

export function areDebugRoutesEnabled() {
  return Constants.expoConfig?.extra?.enableDebugRoutes !== false;
}
