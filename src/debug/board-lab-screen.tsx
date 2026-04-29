import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { createInitialGameState, moveSelector, swapSelected } from "@/game/engine";
import { practiceMode } from "@/game/modes";
import { BoardCanvas } from "@/rendering/board-canvas";

export function BoardLabScreen() {
  const initialState = useMemo(() => createInitialGameState(practiceMode, "board-lab"), []);
  const [state, setState] = useState(initialState);
  const [showOverlay, setShowOverlay] = useState(true);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: "#181210" }}
      contentContainerStyle={{ padding: 16, gap: 14 }}
    >
      <BoardCanvas reservedVerticalSpace={250} state={state} showDebugOverlay={showOverlay} />

      <View style={{ flexDirection: "row", gap: 8 }}>
        <LabButton label="Left" onPress={() => setState((value) => moveSelector(value, -1, 0))} />
        <LabButton label="Right" onPress={() => setState((value) => moveSelector(value, 1, 0))} />
        <LabButton label="Up" onPress={() => setState((value) => moveSelector(value, 0, -1))} />
        <LabButton label="Down" onPress={() => setState((value) => moveSelector(value, 0, 1))} />
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <LabButton label="Swap" onPress={() => setState((value) => swapSelected(value))} />
        <LabButton
          label={showOverlay ? "Hide Overlay" : "Show Overlay"}
          onPress={() => setShowOverlay((value) => !value)}
        />
      </View>

      <Text selectable testID="board-lab-summary" style={{ color: "#D8C2AB", fontSize: 13 }}>
        phase {state.phase} | selected {state.selector.column},{state.selector.row} | hash {state.boardHash}
      </Text>
    </ScrollView>
  );
}

function LabButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      testID={`board-lab-${label.toLowerCase().replaceAll(" ", "-")}`}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: pressed ? "#75533C" : "#513D2E",
        borderCurve: "continuous",
        borderRadius: 8,
        flex: 1,
        minHeight: 48,
        justifyContent: "center",
        paddingHorizontal: 12
      })}
    >
      <Text selectable={false} style={{ color: "#FFF2E2", fontWeight: "700" }}>
        {label}
      </Text>
    </Pressable>
  );
}
