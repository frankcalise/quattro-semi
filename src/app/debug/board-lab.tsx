import { Text, View } from "react-native";

import { BoardLabScreen } from "@/debug/board-lab-screen";
import { areDebugRoutesEnabled } from "@/debug/debug-routes";

export default function BoardLabRoute() {
  if (!areDebugRoutesEnabled()) {
    return (
      <View
        style={{
          alignItems: "center",
          backgroundColor: "#181210",
          flex: 1,
          justifyContent: "center",
          padding: 24
        }}
      >
        <Text selectable style={{ color: "#F6E8D2", fontSize: 18, fontWeight: "700", textAlign: "center" }}>
          Debug routes are disabled for this build.
        </Text>
      </View>
    );
  }

  return <BoardLabScreen />;
}
