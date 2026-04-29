import { Stack } from "expo-router/stack";

export default function GameLayout() {
  return (
    <Stack>
      <Stack.Screen name="practice" options={{ title: "Practice" }} />
      <Stack.Screen name="classic" options={{ title: "Classic" }} />
    </Stack>
  );
}
