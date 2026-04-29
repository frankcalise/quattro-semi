import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { createInitialGameState, moveSelector, swapSelected } from "@/game/engine";
import type { ModeConfig } from "@/game/types";
import { BoardCanvas } from "@/rendering/board-canvas";

type Props = {
  mode: ModeConfig;
};

export function GameScreen({ mode }: Props) {
  const initialState = useMemo(() => createInitialGameState(mode, "quattro-semi"), [mode]);
  const [state, setState] = useState(initialState);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: "#211813" }}
      contentContainerStyle={{ padding: 16, gap: 14 }}
    >
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Metric label="Score" value={state.score} />
        <Metric label="Level" value={state.level} />
        <Metric label="Chain" value={state.maxChain} />
      </View>

      <BoardCanvas reservedVerticalSpace={330} state={state} />

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Control label="Left" onPress={() => setState((value) => moveSelector(value, -1, 0))} />
        <Control label="Right" onPress={() => setState((value) => moveSelector(value, 1, 0))} />
        <Control label="Up" onPress={() => setState((value) => moveSelector(value, 0, -1))} />
        <Control label="Down" onPress={() => setState((value) => moveSelector(value, 0, 1))} />
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Control label="Swap" onPress={() => setState((value) => swapSelected(value))} />
        <Control label="Raise" onPress={() => setState((value) => ({ ...value, riseOffset: 1 }))} />
      </View>

      <Text selectable testID="game-debug-summary" style={{ color: "#DCC9B7", fontSize: 13 }}>
        seed {state.seed} | board {state.boardHash} | {mode.automaticRise ? "auto rise" : "manual rise"}
      </Text>
    </ScrollView>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ flex: 1, gap: 3 }}>
      <Text selectable style={{ color: "#AE9480", fontSize: 12, fontWeight: "700" }}>
        {label}
      </Text>
      <Text
        selectable
        style={{ color: "#FFF3E2", fontSize: 20, fontVariant: ["tabular-nums"], fontWeight: "800" }}
      >
        {value}
      </Text>
    </View>
  );
}

function Control({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      testID={`control-${label.toLowerCase()}`}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: pressed ? "#75533C" : "#624832",
        borderCurve: "continuous",
        borderRadius: 8,
        flex: 1,
        minHeight: 48,
        justifyContent: "center"
      })}
    >
      <Text selectable={false} style={{ color: "#FFF6EA", fontSize: 15, fontWeight: "700" }}>
        {label}
      </Text>
    </Pressable>
  );
}
