import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { boardLabFixtures } from "@/debug/board-lab-fixtures";
import { applyCommand, moveSelector } from "@/game/engine";
import { formatGameSummary, summarizeGameState } from "@/game/replay";
import type { GameState } from "@/game/types";
import { BoardCanvas, type BoardAnimationType } from "@/rendering/board-canvas";

export function BoardLabScreen() {
  const initialFixture = useMemo(() => boardLabFixtures[0], []);
  const [state, setState] = useState(initialFixture.state);
  const [previousState, setPreviousState] = useState<GameState | null>(null);
  const [fixtureId, setFixtureId] = useState(initialFixture.id);
  const [fps, setFps] = useState(0);
  const [frameMs, setFrameMs] = useState(0);
  const [gestureLatency, setGestureLatency] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [animationType, setAnimationType] = useState<BoardAnimationType>("fixture");
  const [showOverlay, setShowOverlay] = useState(true);
  const summary = summarizeGameState(state);
  const selectedFixture = boardLabFixtures.find((value) => value.id === fixtureId) ?? initialFixture;

  const commitAnimation = useCallback((type: BoardAnimationType, startedAt = Date.now()) => {
    setAnimationType(type);
    setAnimationKey((value) => value + 1);
    setGestureLatency(Date.now() - startedAt);
  }, []);
  const applyMove = useCallback(
    (columnDelta: number, rowDelta: number, startedAt = Date.now()) => {
      setPreviousState(state);
      setState(
        applyCommand(state, {
          type: "move-selector",
          columnDelta,
          rowDelta,
          tick: state.elapsedTicks + 1
        })
      );
      commitAnimation("move", startedAt);
    },
    [commitAnimation, state]
  );
  const applySwap = useCallback(() => {
    const next = applyCommand(state, { type: "swap", tick: state.elapsedTicks + 1 });
    setPreviousState(state);
    setState(next);
    commitAnimation(resolveSwapAnimationType(state, next));
  }, [commitAnimation, state]);
  const applyRaise = useCallback(() => {
    setPreviousState(state);
    setState(applyCommand(state, { type: "manual-raise", tick: state.elapsedTicks + 1 }));
    commitAnimation("raise");
  }, [commitAnimation, state]);
  const loadFixture = useCallback(
    (id: string) => {
      const fixture = boardLabFixtures.find((value) => value.id === id) ?? boardLabFixtures[0];
      setFixtureId(fixture.id);
      setPreviousState(state);
      setState(fixture.state);
      commitAnimation("fixture");
    },
    [commitAnimation, state]
  );
  const moveSelectorToCell = useCallback(
    (column: number, row: number) => {
      const startedAt = Date.now();
      const targetColumn = Math.max(0, Math.min(state.mode.visibleColumns - 2, column));
      const next = moveSelector(state, targetColumn - state.selector.column, row - state.selector.row);
      setPreviousState(state);
      setState({ ...next, elapsedTicks: state.elapsedTicks + 1 });
      commitAnimation("move", startedAt);
    },
    [commitAnimation, state]
  );
  const recordFrameSample = useCallback((nextFps: number, nextFrameMs: number) => {
    setFps(nextFps);
    setFrameMs(nextFrameMs);
  }, []);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: "#181210" }}
      contentContainerStyle={{ padding: 16, gap: 14 }}
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <DebugChip testID="board-lab-seed" label={`seed ${summary.seed}`} />
        <DebugChip testID="board-lab-phase" label={`phase ${summary.phase}`} />
        <DebugChip testID="board-lab-frame" label={`frame ${frameMs}ms`} />
      </View>

      <BoardCanvas
        animationKey={animationKey}
        animationType={animationType}
        onCellPress={moveSelectorToCell}
        onFrameSample={recordFrameSample}
        onSwipe={(columnDelta, rowDelta) => applyMove(columnDelta, rowDelta)}
        previousState={previousState}
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

      <DebugChip testID={`board-lab-animation-${animationType}`} label={`animation ${animationType}`} />

      <Text selectable testID="board-lab-summary" style={{ color: "#D8C2AB", fontSize: 13 }}>
        {formatGameSummary(summary)} | fixture {fixtureId} | fps {fps} | frame {frameMs}ms | latency{" "}
        {gestureLatency}ms | animation {animationType}
      </Text>
    </ScrollView>
  );
}

function DebugChip({ label, testID }: { label: string; testID: string }) {
  return (
    <Text
      selectable
      testID={testID}
      style={{
        backgroundColor: "#2C211A",
        borderColor: "#5E4636",
        borderRadius: 8,
        borderWidth: 1,
        color: "#F7E7D3",
        flexGrow: 1,
        fontSize: 12,
        fontVariant: ["tabular-nums"],
        fontWeight: "700",
        minHeight: 34,
        paddingHorizontal: 10,
        paddingVertical: 8
      }}
    >
      {label}
    </Text>
  );
}

function resolveSwapAnimationType(previous: GameState, next: GameState): BoardAnimationType {
  if (next.lastResolvedChain > 0 || next.lastResolvedCombo > 0) {
    return "clear";
  }

  if (previous.boardHash !== next.boardHash && hasFallingTile(previous, next)) {
    return "settle";
  }

  return "swap";
}

function hasFallingTile(previous: GameState, next: GameState) {
  const previousRows = new Map<string, number>();

  previous.board.forEach((row, rowIndex) => {
    row.forEach((tile) => {
      if (tile) {
        previousRows.set(tile.id, rowIndex);
      }
    });
  });

  return next.board.some((row, rowIndex) =>
    row.some((tile) => {
      const previousRow = tile ? previousRows.get(tile.id) : undefined;
      return previousRow !== undefined && previousRow < rowIndex;
    })
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
