import "react-native-gesture-handler";

import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { areDebugRoutesEnabled } from "@/debug/debug-routes";

export default function RootLayout() {
  const debugRoutesEnabled = areDebugRoutesEnabled();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Quattro Semi" }} />
        <Stack.Screen name="(game)" options={{ headerShown: false }} />
        <Stack.Screen
          name="debug/board-lab"
          options={{
            title: "Board Lab",
            headerShown: debugRoutesEnabled
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
