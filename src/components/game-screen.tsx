import { useEffect, useMemo, useRef, useState } from "react";
import { AppState, Pressable, ScrollView, Text, View } from "react-native";

import { configureAudio, playSfx, setSfxActive, setSfxEnabled } from "@/audio/audio-service";
import { applyCommand, createInitialGameState, getAutomaticRiseIntervalTicks } from "@/game/engine";
import { deriveFeedbackEvents, primaryAnimationForEvents } from "@/game/feedback";
import { formatGameSummary, summarizeGameState } from "@/game/replay";
import type { GameState, ModeConfig } from "@/game/types";
import { playHaptic, setHapticsEnabled } from "@/haptics/haptic-service";
import type { InputCommand } from "@/input/commands";
import { BoardCanvas, type BoardAnimationType } from "@/rendering/board-canvas";
import {
  defaultGameFeelSettings,
  loadGameFeelSettings,
  saveGameFeelSettings,
  type GameFeelSettings
} from "@/settings/game-feel-settings";
import { emptyLocalRecords, mergeLocalRecords } from "@/storage/local-records";

type Props = {
  mode: ModeConfig;
};

export function GameScreen({ mode }: Props) {
  const initialState = useMemo(() => createInitialGameState(mode, "quattro-semi"), [mode]);
  const [state, setState] = useState(initialState);
  const [previousBoardState, setPreviousBoardState] = useState<GameState | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [animationType, setAnimationType] = useState<BoardAnimationType>("fixture");
  const [records, setRecords] = useState(emptyLocalRecords);
  const [settings, setSettings] = useState<GameFeelSettings>(defaultGameFeelSettings);
  const recordedGameOverHash = useRef<string | null>(null);
  const automaticRiseInterval = getAutomaticRiseIntervalTicks(mode, state.level);

  useEffect(() => {
    setState(initialState);
    setPreviousBoardState(null);
    setAnimationType("fixture");
    setAnimationKey((value) => value + 1);
    recordedGameOverHash.current = null;
  }, [initialState]);

  useEffect(() => {
    let mounted = true;

    void configureAudio();
    void loadGameFeelSettings().then((loadedSettings) => {
      if (!mounted) {
        return;
      }

      setSettings(loadedSettings);
      setSfxEnabled(loadedSettings.audioEnabled);
      setHapticsEnabled(loadedSettings.hapticsEnabled);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setSfxEnabled(settings.audioEnabled);
    setHapticsEnabled(settings.hapticsEnabled);
    void saveGameFeelSettings(settings);
  }, [settings]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      const active = nextAppState === "active";

      setSfxActive(active);
      setState((value) => {
        if (!mode.automaticRise || value.phase === "game-over") {
          return value;
        }

        if (!active && value.phase === "playing") {
          return { ...value, phase: "paused" };
        }

        if (active && value.phase === "paused") {
          return { ...value, phase: "playing" };
        }

        return value;
      });
    });

    return () => subscription.remove();
  }, [mode.automaticRise]);

  useEffect(() => {
    if (!mode.automaticRise || state.phase !== "playing") {
      return;
    }

    const timer = setInterval(() => {
      setState((value) =>
        applyCommand(value, { type: "move-selector", columnDelta: 0, rowDelta: 0, tick: value.elapsedTicks + 1 })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [mode.automaticRise, state.phase]);

  useEffect(() => {
    if (state.phase !== "game-over") {
      return;
    }

    const resultKey = `${state.seed}:${state.elapsedTicks}:${state.boardHash}`;

    if (recordedGameOverHash.current === resultKey) {
      return;
    }

    recordedGameOverHash.current = resultKey;
    setRecords((value) => mergeLocalRecords(value, state));
  }, [state]);

  const restart = () => {
    recordedGameOverHash.current = null;
    setPreviousBoardState(null);
    setAnimationType("fixture");
    setAnimationKey((value) => value + 1);
    setState(createInitialGameState(mode, `quattro-semi-${Date.now()}`));
  };
  const dispatchCommand = (createCommand: (tick: number) => InputCommand) => {
    setState((value) => {
      const command = createCommand(value.elapsedTicks + 1);
      const next = applyCommand(value, command);
      const events = deriveFeedbackEvents(value, next, command);

      if (events.length > 0) {
        setPreviousBoardState(value);
        setAnimationType(primaryAnimationForEvents(events));
        setAnimationKey((key) => key + 1);
        playFeedback(events);
      }

      return next;
    });
  };
  const moveSelectorBy = (columnDelta: number, rowDelta: number) => {
    dispatchCommand((tick) => ({ type: "move-selector", columnDelta, rowDelta, tick }));
  };
  const swap = () => {
    dispatchCommand((tick) => ({ type: "swap", tick }));
  };
  const raise = () => {
    dispatchCommand((tick) => ({ type: "manual-raise", tick }));
  };
  const handleBoardCellPress = (column: number, row: number) => {
    if (state.phase !== "playing") {
      return;
    }

    const targetColumn = Math.min(column, mode.visibleColumns - 2);
    const tappedSelectedPair =
      row === state.selector.row && (column === state.selector.column || column === state.selector.column + 1);

    if (tappedSelectedPair) {
      swap();
      return;
    }

    moveSelectorBy(targetColumn - state.selector.column, row - state.selector.row);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: "#211813" }}
      contentContainerStyle={{ padding: 16, gap: 14 }}
    >
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Metric label="Score" value={state.score} />
        <Metric label="Level" value={state.level} />
        <Metric label="Time" value={state.elapsedTicks} />
        <Metric label="Rise" value={automaticRiseInterval} />
      </View>

      <BoardCanvas
        animationKey={animationKey}
        animationType={animationType}
        onCellPress={handleBoardCellPress}
        onSwipe={moveSelectorBy}
        previousState={previousBoardState}
        reservedVerticalSpace={260}
        state={state}
      />

      {state.phase === "paused" ? (
        <View
          style={{
            backgroundColor: "#2C211A",
            borderColor: "#6B5140",
            borderRadius: 8,
            borderWidth: 1,
            padding: 12
          }}
        >
          <Text selectable style={{ color: "#FFF3E2", fontSize: 16, fontWeight: "800" }}>
            Paused
          </Text>
        </View>
      ) : null}

      {state.phase === "game-over" ? (
        <ResultsPanel records={records} restart={restart} state={state} />
      ) : (
        <>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Control
              label="Left"
              onPress={() => moveSelectorBy(-1, 0)}
            />
            <Control
              label="Right"
              onPress={() => moveSelectorBy(1, 0)}
            />
            <Control
              label="Up"
              onPress={() => moveSelectorBy(0, -1)}
            />
            <Control
              label="Down"
              onPress={() => moveSelectorBy(0, 1)}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Control
              label="Swap"
              onPress={swap}
            />
            <Control label="Raise" onPress={raise} />
          </View>
        </>
      )}

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Toggle
          enabled={settings.audioEnabled}
          label="Audio"
          onPress={() => setSettings((value) => ({ ...value, audioEnabled: !value.audioEnabled }))}
        />
        <Toggle
          enabled={settings.hapticsEnabled}
          label="Haptics"
          onPress={() => setSettings((value) => ({ ...value, hapticsEnabled: !value.hapticsEnabled }))}
        />
      </View>

      <Text selectable testID="game-debug-summary" style={{ color: "#DCC9B7", fontSize: 13 }}>
        {formatGameSummary(summarizeGameState(state))} | {mode.automaticRise ? "auto rise" : "manual rise"}
      </Text>
    </ScrollView>
  );
}

function playFeedback(events: ReturnType<typeof deriveFeedbackEvents>) {
  for (const event of events) {
    playSfx(event);
    playHaptic(event);
  }
}

function ResultsPanel({
  records,
  restart,
  state
}: {
  records: typeof emptyLocalRecords;
  restart: () => void;
  state: GameState;
}) {
  return (
    <View
      testID="classic-results"
      style={{
        backgroundColor: "#2C211A",
        borderColor: "#6B5140",
        borderCurve: "continuous",
        borderRadius: 8,
        borderWidth: 1,
        gap: 12,
        padding: 14
      }}
    >
      <Text selectable style={{ color: "#FFF3E2", fontSize: 22, fontWeight: "800" }}>
        Game Over
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <ResultMetric label="Score" value={state.score} />
        <ResultMetric label="Time" value={state.elapsedTicks} />
        <ResultMetric label="Chain" value={state.maxChain} />
        <ResultMetric label="Combo" value={state.maxCombo} />
        <ResultMetric label="Level" value={state.level} />
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <ResultMetric label="Best" value={records.highScore} />
        <ResultMetric label="Best Time" value={records.bestTimeSeconds} />
        <ResultMetric label="Best Level" value={records.maxLevel} />
      </View>
      <Control label="Retry" onPress={restart} />
    </View>
  );
}

function ResultMetric({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ minWidth: 92 }}>
      <Text selectable style={{ color: "#AE9480", fontSize: 12, fontWeight: "700" }}>
        {label}
      </Text>
      <Text selectable style={{ color: "#FFF3E2", fontSize: 18, fontVariant: ["tabular-nums"], fontWeight: "800" }}>
        {value}
      </Text>
    </View>
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

function Toggle({ enabled, label, onPress }: { enabled: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      testID={`toggle-${label.toLowerCase()}`}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: enabled ? "#3E7F4A" : "#4A4039",
        borderColor: enabled ? "#7FC48A" : "#6B5140",
        borderRadius: 8,
        borderWidth: 1,
        flex: 1,
        minHeight: 44,
        justifyContent: "center"
      }}
    >
      <Text selectable={false} style={{ color: "#FFF6EA", fontSize: 14, fontWeight: "800" }}>
        {label} {enabled ? "On" : "Off"}
      </Text>
    </Pressable>
  );
}
