import { Canvas, Group, Path, Rect, RoundedRect, Skia } from "@shopify/react-native-skia";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Easing, runOnJS, useAnimatedReaction, useSharedValue, withTiming } from "react-native-reanimated";

import type { Board, GameState, Selector, Suit, Tile } from "@/game/types";

type Props = {
  animationKey?: number;
  animationType?: BoardAnimationType;
  onCellPress?: (column: number, row: number) => void;
  onFrameSample?: (fps: number, frameMs: number) => void;
  onSwipe?: (columnDelta: number, rowDelta: number) => void;
  previousState?: GameState | null;
  reservedVerticalSpace?: number;
  state: GameState;
  showDebugOverlay?: boolean;
};

export type BoardAnimationType = "move" | "swap" | "raise" | "fixture" | "settle" | "clear";

type CellPosition = {
  column: number;
  row: number;
};

const suitColors: Record<Suit, string> = {
  coppe: "#B9443F",
  bastoni: "#3E7F4A",
  spade: "#455F9F",
  denari: "#C89A2D"
};

export function BoardCanvas({
  animationKey = 0,
  animationType = "fixture",
  onCellPress,
  onFrameSample,
  onSwipe,
  previousState = null,
  reservedVerticalSpace = 250,
  state,
  showDebugOverlay = false
}: Props) {
  const { height, width } = useWindowDimensions();
  const [animationProgress, setAnimationProgress] = useState(1);
  const [frameStats, setFrameStats] = useState({ fps: 0, frameMs: 0 });
  const progressValue = useSharedValue(1);
  const frameCount = useRef(0);
  const lastFrameSample = useRef(Date.now());
  const cardGap = 4;
  const maximumBoardHeight = Math.max(360, height - reservedVerticalSpace);
  const maximumWidthFromHeight =
    ((maximumBoardHeight - cardGap * (state.mode.visibleRows - 1)) / (state.mode.visibleRows * 1.2)) *
      state.mode.visibleColumns +
    cardGap * (state.mode.visibleColumns - 1);
  const boardWidth = Math.min(width - 32, 390, maximumWidthFromHeight);
  const cardWidth = (boardWidth - cardGap * (state.mode.visibleColumns - 1)) / state.mode.visibleColumns;
  const cardHeight = cardWidth * 1.2;
  const boardHeight = cardHeight * state.mode.visibleRows + cardGap * (state.mode.visibleRows - 1);
  const resolveCellFromPoint = useCallback(
    (x: number, y: number) => {
      const column = Math.floor(x / (cardWidth + cardGap));
      const row = Math.floor(y / (cardHeight + cardGap));

      if (column < 0 || column >= state.mode.visibleColumns || row < 0 || row >= state.mode.visibleRows) {
        return null;
      }

      return { column, row };
    },
    [cardGap, cardHeight, cardWidth, state.mode.visibleColumns, state.mode.visibleRows]
  );
  const handleTap = useCallback(
    (x: number, y: number) => {
      const cell = resolveCellFromPoint(x, y);

      if (cell) {
        onCellPress?.(cell.column, cell.row);
      }
    },
    [onCellPress, resolveCellFromPoint]
  );
  const handleSwipe = useCallback(
    (translationX: number, translationY: number) => {
      if (!onSwipe) {
        return;
      }

      if (Math.max(Math.abs(translationX), Math.abs(translationY)) < 18) {
        return;
      }

      if (Math.abs(translationX) > Math.abs(translationY)) {
        onSwipe(translationX > 0 ? 1 : -1, 0);
      } else {
        onSwipe(0, translationY > 0 ? 1 : -1);
      }
    },
    [onSwipe]
  );
  const tapGesture = useMemo(
    () => Gesture.Tap().onEnd((event) => runOnJS(handleTap)(event.x, event.y)),
    [handleTap]
  );
  const panGesture = useMemo(
    () => Gesture.Pan().minDistance(18).onEnd((event) => runOnJS(handleSwipe)(event.translationX, event.translationY)),
    [handleSwipe]
  );
  const composedGesture = useMemo(() => Gesture.Exclusive(panGesture, tapGesture), [panGesture, tapGesture]);

  useEffect(() => {
    progressValue.value = 0;
    progressValue.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic)
    });
  }, [animationKey, progressValue]);

  useAnimatedReaction(
    () => progressValue.value,
    (progress) => {
      runOnJS(setAnimationProgress)(progress);
    },
    [progressValue]
  );

  useEffect(() => {
    if (!onFrameSample && !showDebugOverlay) {
      return;
    }

    let frame = 0;
    let mounted = true;
    frameCount.current = 0;
    lastFrameSample.current = Date.now();

    const tick = () => {
      if (!mounted) {
        return;
      }

      frameCount.current += 1;
      const now = Date.now();
      const elapsed = now - lastFrameSample.current;

      if (elapsed >= 600) {
        const fps = Math.round((frameCount.current / elapsed) * 1000);
        const frameMs = Math.round((elapsed / frameCount.current) * 10) / 10;

        setFrameStats({ fps, frameMs });
        onFrameSample?.(fps, frameMs);
        frameCount.current = 0;
        lastFrameSample.current = now;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
    };
  }, [onFrameSample, showDebugOverlay]);
  const easedProgress = 1 - Math.pow(1 - animationProgress, 3);
  const riseShift = animationType === "raise" ? (1 - easedProgress) * (cardHeight + cardGap) * 0.18 : 0;
  const selectorPulse = animationType === "swap" || animationType === "clear" ? 1 - easedProgress : 0;
  const isDangerVisible = state.board.slice(0, 2).some((row) => row.some(Boolean));
  const previousPositions = useMemo(() => mapTilePositions(previousState?.board), [previousState?.board]);
  const currentPositions = useMemo(() => mapTilePositions(state.board), [state.board]);
  const clearingTiles = useMemo(() => {
    if (!previousState || animationType === "move" || animationType === "fixture") {
      return [];
    }

    return collectClearingTiles(previousState.board, currentPositions);
  }, [animationType, currentPositions, previousState]);
  const previousSelector = previousState?.selector;

  return (
    <View
      testID="board-canvas-frame"
      style={{
        alignItems: "center",
        alignSelf: "center",
        borderColor: "#634C3C",
        borderCurve: "continuous",
        borderRadius: 8,
        borderWidth: 1,
        height: boardHeight + 20,
        justifyContent: "center",
        maxWidth: 422,
        overflow: "hidden",
        width: boardWidth + 20
      }}
    >
      <GestureDetector gesture={composedGesture}>
        <Canvas style={{ height: boardHeight, width: boardWidth }}>
          <Rect x={0} y={0} width={boardWidth} height={boardHeight} color="#2B211A" />
          <Group transform={[{ translateY: riseShift }]}>
            {state.board.map((row, rowIndex) =>
              row.map((tile, columnIndex) =>
                tile === null ? null : (
                  <CardTile
                    key={tile.id}
                    cardGap={cardGap}
                    cardHeight={cardHeight}
                    cardWidth={cardWidth}
                    columnIndex={columnIndex}
                    progress={easedProgress}
                    pulse={selectorPulse}
                    previousPosition={previousPositions.get(tile.id)}
                    rowIndex={rowIndex}
                    selected={rowIndex === state.selector.row && (columnIndex === state.selector.column || columnIndex === state.selector.column + 1)}
                    tile={tile}
                  />
                )
              )
            )}
            {clearingTiles.map((clearingTile) => (
              <ClearingCardTile
                key={`clear:${clearingTile.tile.id}`}
                cardGap={cardGap}
                cardHeight={cardHeight}
                cardWidth={cardWidth}
                progress={easedProgress}
                tile={clearingTile.tile}
                position={clearingTile.position}
              />
            ))}
          </Group>
          <Selector
            cardGap={cardGap}
            cardHeight={cardHeight}
            cardWidth={cardWidth}
            column={state.selector.column}
            pulse={selectorPulse}
            previousSelector={previousSelector}
            progress={easedProgress}
            row={state.selector.row}
          />
          {showDebugOverlay ? <Rect x={8} y={8} width={boardWidth * 0.45} height={5} color="#FFF5E8" opacity={0.65} /> : null}
          {showDebugOverlay && isDangerVisible ? (
            <Rect x={0} y={0} width={boardWidth} height={2} color="#D84A43" opacity={0.9} />
          ) : null}
        </Canvas>
      </GestureDetector>
      {showDebugOverlay ? (
        <Text
          selectable
          testID="board-canvas-overlay"
          style={{
            backgroundColor: "rgba(24, 18, 16, 0.82)",
            borderRadius: 6,
            color: "#FFF5E8",
            fontSize: 11,
            fontVariant: ["tabular-nums"],
            fontWeight: "700",
            left: 14,
            lineHeight: 15,
            maxWidth: boardWidth - 28,
            paddingHorizontal: 8,
            paddingVertical: 5,
            position: "absolute",
            top: 14
          }}
        >
          {state.mode.visibleColumns}x{state.mode.visibleRows} | phase {state.phase} | score {state.score} | selector{" "}
          {state.selector.column},{state.selector.row}{"\n"}
          seed {state.seed} | board {state.boardHash}{"\n"}
          fps {frameStats.fps} | frame {frameStats.frameMs}ms
        </Text>
      ) : null}
    </View>
  );
}

type CardProps = {
  cardGap: number;
  cardHeight: number;
  cardWidth: number;
  columnIndex: number;
  previousPosition?: CellPosition;
  progress: number;
  pulse: number;
  rowIndex: number;
  selected: boolean;
  tile: Tile;
};

function CardTile({
  cardGap,
  cardHeight,
  cardWidth,
  columnIndex,
  previousPosition,
  progress,
  pulse,
  rowIndex,
  selected,
  tile
}: CardProps) {
  const selectedLift = selected ? pulse * 4 : 0;
  const targetX = columnIndex * (cardWidth + cardGap);
  const targetY = rowIndex * (cardHeight + cardGap);
  const sourceX = previousPosition ? previousPosition.column * (cardWidth + cardGap) : targetX;
  const sourceY = previousPosition ? previousPosition.row * (cardHeight + cardGap) : targetY + cardHeight + cardGap;
  const x = sourceX + (targetX - sourceX) * progress;
  const y = sourceY + (targetY - sourceY) * progress - selectedLift;
  const centerX = x + cardWidth / 2;
  const centerY = y + cardHeight / 2;

  return (
    <Group>
      <RoundedRect x={x} y={y} width={cardWidth} height={cardHeight} r={6} color={selected && pulse > 0 ? "#FFE4A6" : "#F1DEC4"} />
      <RoundedRect
        x={x + 3}
        y={y + 3}
        width={cardWidth - 6}
        height={cardHeight - 6}
        r={4}
        color="#FFF6E8"
        style="stroke"
        strokeWidth={1.5}
      />
      <SuitMark x={centerX} y={centerY} size={cardWidth * 0.34} suit={tile.suit} />
    </Group>
  );
}

function ClearingCardTile({
  cardGap,
  cardHeight,
  cardWidth,
  position,
  progress,
  tile
}: {
  cardGap: number;
  cardHeight: number;
  cardWidth: number;
  position: CellPosition;
  progress: number;
  tile: Tile;
}) {
  const fade = 1 - progress;
  const inset = progress * cardWidth * 0.08;
  const x = position.column * (cardWidth + cardGap) + inset;
  const y = position.row * (cardHeight + cardGap) + inset;
  const width = cardWidth - inset * 2;
  const height = cardHeight - inset * 2;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  return (
    <Group opacity={fade}>
      <RoundedRect x={x} y={y} width={width} height={height} r={6} color="#FFF0CE" />
      <RoundedRect
        x={x + 3}
        y={y + 3}
        width={width - 6}
        height={height - 6}
        r={4}
        color="#FFE08A"
        style="stroke"
        strokeWidth={2}
      />
      <SuitMark x={centerX} y={centerY} size={cardWidth * 0.34 * (1 - progress * 0.12)} suit={tile.suit} />
    </Group>
  );
}

function Selector({
  cardGap,
  cardHeight,
  cardWidth,
  column,
  pulse,
  previousSelector,
  progress,
  row
}: {
  cardGap: number;
  cardHeight: number;
  cardWidth: number;
  column: number;
  pulse: number;
  previousSelector?: Selector;
  progress: number;
  row: number;
}) {
  const targetX = column * (cardWidth + cardGap);
  const targetY = row * (cardHeight + cardGap);
  const sourceX = previousSelector ? previousSelector.column * (cardWidth + cardGap) : targetX;
  const sourceY = previousSelector ? previousSelector.row * (cardHeight + cardGap) : targetY;
  const x = sourceX + (targetX - sourceX) * progress;
  const y = sourceY + (targetY - sourceY) * progress;

  return (
    <RoundedRect
      x={x - 2 - pulse * 2}
      y={y - 2 - pulse * 2}
      width={cardWidth * 2 + cardGap + 4 + pulse * 4}
      height={cardHeight + 4 + pulse * 4}
      r={8}
      color="#FFE08A"
      style="stroke"
      strokeWidth={3}
    />
  );
}

function mapTilePositions(board?: Board) {
  const positions = new Map<string, CellPosition>();

  board?.forEach((row, rowIndex) => {
    row.forEach((tile, columnIndex) => {
      if (tile) {
        positions.set(tile.id, { column: columnIndex, row: rowIndex });
      }
    });
  });

  return positions;
}

function collectClearingTiles(board: Board, currentPositions: Map<string, CellPosition>) {
  const clearingTiles: Array<{ position: CellPosition; tile: Tile }> = [];

  board.forEach((row, rowIndex) => {
    row.forEach((tile, columnIndex) => {
      if (tile && !currentPositions.has(tile.id)) {
        clearingTiles.push({
          position: { column: columnIndex, row: rowIndex },
          tile
        });
      }
    });
  });

  return clearingTiles;
}

function SuitMark({ size, suit, x, y }: { size: number; suit: Suit; x: number; y: number }) {
  if (suit === "denari") {
    const path = Skia.Path.Make();
    path.moveTo(x, y - size);
    path.lineTo(x + size, y);
    path.lineTo(x, y + size);
    path.lineTo(x - size, y);
    path.close();
    return <Path path={path} color={suitColors[suit]} />;
  }

  if (suit === "bastoni") {
    return <RoundedRect x={x - size * 0.25} y={y - size} width={size * 0.5} height={size * 2} r={size * 0.24} color={suitColors[suit]} />;
  }

  if (suit === "spade") {
    const path = Skia.Path.Make();
    path.moveTo(x, y - size);
    path.cubicTo(x + size, y - size * 0.1, x + size * 0.8, y + size * 0.75, x, y + size);
    path.cubicTo(x - size * 0.8, y + size * 0.75, x - size, y - size * 0.1, x, y - size);
    path.close();
    return <Path path={path} color={suitColors[suit]} />;
  }

  const path = Skia.Path.Make();
  path.moveTo(x, y + size);
  path.cubicTo(x - size * 1.2, y + size * 0.2, x - size, y - size, x, y - size * 0.2);
  path.cubicTo(x + size, y - size, x + size * 1.2, y + size * 0.2, x, y + size);
  path.close();
  return <Path path={path} color={suitColors[suit]} />;
}
