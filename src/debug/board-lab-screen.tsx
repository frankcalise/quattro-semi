import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { boardLabFixtures } from "@/debug/board-lab-fixtures";
import { applyCommand, moveSelector } from "@/game/engine";
import { formatGameSummary, summarizeGameState } from "@/game/replay";
import { BoardCanvas } from "@/rendering/board-canvas";

type AnimationType = "move" | "swap" | "raise" | "fixture";

export function BoardLabScreen() {
  const initialFixture = useMemo(() => boardLabFixtures[0], []);
  const [state, setState] = useState(initialFixture.state);
  const [fixtureId, setFixtureId] = useState(initialFixture.id);
  const [fps, setFps] = useState(0);
  const [gestureLatency, setGestureLatency] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [animationType, setAnimationType] = useState<AnimationType>("fixture");
  const [showOverlay, setShowOverlay] = useState(true);
  const summary = summarizeGameState(state);
  const selectedFixture = boardLabFixtures.find((value) => value.id === fixtureId) ?? initialFixture;

  const commitAnimation = useCallback((type: AnimationType, startedAt = Date.now()) => {
    setAnimationType(type);
    setAnimationKey((value) => value + 1);
    setGestureLatency(Date.now() - startedAt);
  }, []);
  const applyMove = useCallback(
    (columnDelta: number, rowDelta: number, startedAt = Date.now()) => {
      setState((value) =>
        applyCommand(value, {
          type: "move-selector",
          columnDelta,
          rowDelta,
          tick: value.elapsedTicks + 1
        })
      );
      commitAnimation("move", startedAt);
    },
    [commitAnimation]
  );
  const applySwap = useCallback(() => {
    setState((value) => applyCommand(value, { type: "swap", tick: value.elapsedTicks + 1 }));
    commitAnimation("swap");
  }, [commitAnimation]);
  const applyRaise = useCallback(() => {
    setState((value) => applyCommand(value, { type: "manual-raise", tick: value.elapsedTicks + 1 }));
    commitAnimation("raise");
  }, [commitAnimation]);
  const loadFixture = useCallback(
    (id: string) => {
      const fixture = boardLabFixtures.find((value) => value.id === id) ?? boardLabFixtures[0];
      setFixtureId(fixture.id);
      setState(fixture.state);
      commitAnimation("fixture");
    },
    [commitAnimation]
  );
  const moveSelectorToCell = useCallback(
    (column: number, row: number) => {
      const startedAt = Date.now();
      setState((value) => {
        const targetColumn = Math.max(0, Math.min(value.mode.visibleColumns - 2, column));
        const next = moveSelector(value, targetColumn - value.selector.column, row - value.selector.row);
        return { ...next, elapsedTicks: value.elapsedTicks + 1 };
      });
      commitAnimation("move", startedAt);
    },
    [commitAnimation]
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: "#181210" }}
      contentContainerStyle={{ padding: 16, gap: 14 }}
    >
      <BoardCanvas
        animationKey={animationKey}
        animationType={animationType}
        onCellPress={moveSelectorToCell}
        onFrameSample={setFps}
        onSwipe={(columnDelta, rowDelta) => applyMove(columnDelta, rowDelta)}
        reservedVerticalSpace={330}
        state={state}
        showDebugOverlay={showOverlay}
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {boardLabFixtures.map((fixture) => (
          <LabButton
            key={fixture.id}
            active={fixture.id === fixtureId}
            label={fixture.label}
            onPress={() => loadFixture(fixture.id)}
          />
        ))}
      </View>

      <Text selectable testID="board-lab-fixture-note" style={{ color: "#F1DEC4", fontSize: 13, lineHeight: 19 }}>
        {selectedFixture.note}
      </Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <LabButton label="Left" onPress={() => applyMove(-1, 0)} />
        <LabButton label="Right" onPress={() => applyMove(1, 0)} />
        <LabButton label="Up" onPress={() => applyMove(0, -1)} />
        <LabButton label="Down" onPress={() => applyMove(0, 1)} />
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <LabButton label="Swap" onPress={applySwap} />
        <LabButton label="Raise" onPress={applyRaise} />
        <LabButton
          label={showOverlay ? "Hide Overlay" : "Show Overlay"}
          onPress={() => setShowOverlay((value) => !value)}
        />
      </View>

      <Text selectable testID="board-lab-summary" style={{ color: "#D8C2AB", fontSize: 13 }}>
        {formatGameSummary(summary)} | fixture {fixtureId} | fps {fps} | latency {gestureLatency}ms | animation {animationType}
      </Text>
    </ScrollView>
  );
}

function LabButton({ active = false, label, onPress }: { active?: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      testID={`board-lab-${label.toLowerCase().replaceAll(" ", "-")}`}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: pressed || active ? "#75533C" : "#513D2E",
        borderCurve: "continuous",
        borderRadius: 8,
        flexGrow: 1,
        flexShrink: 1,
        minHeight: 48,
        minWidth: 74,
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
