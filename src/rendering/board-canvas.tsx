import { Canvas, Group, Path, Rect, RoundedRect, Skia } from "@shopify/react-native-skia";
import { useWindowDimensions, View } from "react-native";

import type { GameState, Suit, Tile } from "@/game/types";

type Props = {
  reservedVerticalSpace?: number;
  state: GameState;
  showDebugOverlay?: boolean;
};

const suitColors: Record<Suit, string> = {
  coppe: "#B9443F",
  bastoni: "#3E7F4A",
  spade: "#455F9F",
  denari: "#C89A2D"
};

export function BoardCanvas({ reservedVerticalSpace = 250, state, showDebugOverlay = false }: Props) {
  const { height, width } = useWindowDimensions();
  const cardGap = 4;
  const maximumBoardHeight = Math.max(360, height - reservedVerticalSpace);
  const maximumWidthFromHeight =
    ((maximumBoardHeight - cardGap * (state.mode.visibleRows - 1)) / 1.2) * state.mode.visibleColumns +
    cardGap * (state.mode.visibleColumns - 1);
  const boardWidth = Math.min(width - 32, 390, maximumWidthFromHeight);
  const cardWidth = (boardWidth - cardGap * (state.mode.visibleColumns - 1)) / state.mode.visibleColumns;
  const cardHeight = cardWidth * 1.2;
  const boardHeight = cardHeight * state.mode.visibleRows + cardGap * (state.mode.visibleRows - 1);

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
      <Canvas style={{ height: boardHeight, width: boardWidth }}>
        <Rect x={0} y={0} width={boardWidth} height={boardHeight} color="#2B211A" />
        {state.board.map((row, rowIndex) =>
          row.map((tile, columnIndex) => (
            <CardTile
              key={tile.id}
              cardGap={cardGap}
              cardHeight={cardHeight}
              cardWidth={cardWidth}
              columnIndex={columnIndex}
              rowIndex={rowIndex}
              tile={tile}
            />
          ))
        )}
        <Selector
          cardGap={cardGap}
          cardHeight={cardHeight}
          cardWidth={cardWidth}
          column={state.selector.column}
          row={state.selector.row}
        />
        {showDebugOverlay ? <Rect x={8} y={8} width={boardWidth * 0.45} height={5} color="#FFF5E8" /> : null}
      </Canvas>
    </View>
  );
}

type CardProps = {
  cardGap: number;
  cardHeight: number;
  cardWidth: number;
  columnIndex: number;
  rowIndex: number;
  tile: Tile;
};

function CardTile({ cardGap, cardHeight, cardWidth, columnIndex, rowIndex, tile }: CardProps) {
  const x = columnIndex * (cardWidth + cardGap);
  const y = rowIndex * (cardHeight + cardGap);
  const centerX = x + cardWidth / 2;
  const centerY = y + cardHeight / 2;

  return (
    <Group>
      <RoundedRect x={x} y={y} width={cardWidth} height={cardHeight} r={6} color="#F1DEC4" />
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

function Selector({
  cardGap,
  cardHeight,
  cardWidth,
  column,
  row
}: {
  cardGap: number;
  cardHeight: number;
  cardWidth: number;
  column: number;
  row: number;
}) {
  return (
    <RoundedRect
      x={column * (cardWidth + cardGap) - 2}
      y={row * (cardHeight + cardGap) - 2}
      width={cardWidth * 2 + cardGap + 4}
      height={cardHeight + 4}
      r={8}
      color="#FFE08A"
      style="stroke"
      strokeWidth={3}
    />
  );
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
