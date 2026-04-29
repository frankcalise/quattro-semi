import "react-native-gesture-handler";

import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Quattro Semi" }} />
        <Stack.Screen name="(game)" options={{ headerShown: false }} />
        <Stack.Screen name="debug/board-lab" options={{ title: "Board Lab" }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
