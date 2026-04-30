import { createRng } from "@/game/rng";
import type { Board, BoardCell, GameState, ModeConfig, Suit, Tile } from "@/game/types";
import type { InputCommand } from "@/input/commands";

const suits: Suit[] = ["coppe", "bastoni", "spade", "denari"];
const clearScore = 10;
const comboScore = 25;
const chainScore = 50;

export function createInitialGameState(mode: ModeConfig, seed: string): GameState {
  const fullSeed = `${mode.seedSalt}:${seed}`;
  const board = createBoard(mode, fullSeed);

  return {
    board,
    boardHash: hashBoard(board),
    elapsedTicks: 0,
    level: mode.startingLevel,
    lastResolvedChain: 0,
    lastResolvedCombo: 0,
    maxChain: 0,
    maxCombo: 0,
    mode,
    phase: "playing",
    riseOffset: 0,
    score: 0,
    seed: fullSeed,
    selector: {
      column: Math.floor(mode.visibleColumns / 2) - 1,
      row: mode.visibleRows - 3
    }
  };
}

export function createGameStateFromBoard(mode: ModeConfig, seed: string, board: Board): GameState {
  return {
    ...createInitialGameState(mode, seed),
    board,
    boardHash: hashBoard(board)
  };
}

export function applyCommand(state: GameState, command: InputCommand): GameState {
  const ticked = advanceTimer(state, command.tick);

  if (ticked.phase !== "playing") {
    return ticked;
  }

  if (command.type === "move-selector") {
    return moveSelector(ticked, command.columnDelta, command.rowDelta);
  }

  if (command.type === "manual-raise") {
    return raiseRows(ticked, 1);
  }

  return swapSelected(ticked);
}

export function replayCommands(mode: ModeConfig, seed: string, commands: InputCommand[]): GameState {
  return commands.reduce((state, command) => applyCommand(state, command), createInitialGameState(mode, seed));
}

export function moveSelector(state: GameState, columnDelta: number, rowDelta: number): GameState {
  const selector = {
    column: clamp(state.selector.column + columnDelta, 0, state.mode.visibleColumns - 2),
    row: clamp(state.selector.row + rowDelta, 0, state.mode.visibleRows - 1)
  };

  return { ...state, selector };
}

export function swapSelected(state: GameState): GameState {
  if (state.phase !== "playing") {
    return state;
  }

  const board = state.board.map((row) => [...row]);
  const { column, row } = state.selector;
  const left = board[row][column];
  const right = board[row][column + 1];

  if (left === null && right === null) {
    return state;
  }

  board[row][column] = right;
  board[row][column + 1] = left;

  return resolveBoard({ ...state, board }, left === null || right === null);
}

export function raiseRows(state: GameState, count: number): GameState {
  if (state.phase !== "playing") {
    return state;
  }

  let next = state;

  for (let index = 0; index < count; index += 1) {
    const rng = createRng(`${next.seed}:raise:${next.riseOffset}`);
    const lostTiles = next.board[0].some(Boolean);
    const boardWithoutNewRow = next.board.slice(1);
    const board = [
      ...boardWithoutNewRow,
      createGeneratedRow(next.mode.visibleRows - 1, next.mode.visibleColumns, rng, boardWithoutNewRow)
    ];
    const phase = lostTiles && !next.mode.relaxedGameOver ? "game-over" : next.phase;

    next = resolveBoard({
      ...next,
      board,
      phase,
      riseOffset: next.riseOffset + 1
    });
  }

  return next;
}

export function hashBoard(board: Board) {
  return board
    .map((row) => row.map((tile) => tile?.suit.charAt(0) ?? "_").join(""))
    .join(".");
}

function createBoard(mode: ModeConfig, seed: string): Board {
  const rng = createRng(seed);
  const emptyRows = mode.visibleRows - mode.startingStackRows;
  const board: Board = [];

  for (let row = 0; row < mode.visibleRows; row += 1) {
    if (row < emptyRows) {
      board.push(Array.from({ length: mode.visibleColumns }, () => null));
    } else {
      board.push(createGeneratedRow(row, mode.visibleColumns, rng, board));
    }
  }

  return board;
}

function createGeneratedRow(row: number, columns: number, rng: () => number, existingRows: Board): Tile[] {
  const generated: Tile[] = [];

  for (let column = 0; column < columns; column += 1) {
    generated.push(createTile(row, column, rng, pickLegalSuit(generated, existingRows, row, column, rng)));
  }

  return generated;
}

function createTile(row: number, column: number, rng: () => number, suit: Suit): Tile {
  return {
    id: `${row}:${column}:${suit}:${Math.floor(rng() * 0xffffffff).toString(36)}`,
    suit
  };
}

function pickLegalSuit(generated: Tile[], existingRows: Board, row: number, column: number, rng: () => number): Suit {
  const blocked = new Set<Suit>();
  const leftOne = generated[column - 1];
  const leftTwo = generated[column - 2];
  const aboveOne = existingRows[row - 1]?.[column];
  const aboveTwo = existingRows[row - 2]?.[column];

  if (leftOne && leftTwo && leftOne.suit === leftTwo.suit) {
    blocked.add(leftOne.suit);
  }

  if (aboveOne && aboveTwo && aboveOne.suit === aboveTwo.suit) {
    blocked.add(aboveOne.suit);
  }

  const candidates = suits.filter((suit) => !blocked.has(suit));
  return candidates[Math.floor(rng() * candidates.length)] ?? "coppe";
}

function advanceTimer(state: GameState, tick: number): GameState {
  const previousTick = state.elapsedTicks;
  const elapsedTicks = Math.max(previousTick, tick);
  const ticked = {
    ...state,
    elapsedTicks
  };

  if (!state.mode.automaticRise || state.phase !== "playing") {
    return ticked;
  }

  const interval = getAutomaticRiseIntervalTicks(state.mode, state.level);
  const previousRiseCount = Math.floor(previousTick / interval);
  const nextRiseCount = Math.floor(elapsedTicks / interval);
  const rowsDue = Math.max(0, nextRiseCount - previousRiseCount);

  return rowsDue > 0 ? raiseRows(ticked, rowsDue) : ticked;
}

export function getAutomaticRiseIntervalTicks(mode: ModeConfig, level: number) {
  return Math.max(
    mode.automaticRiseMinimumTicks,
    mode.automaticRiseBaseTicks - Math.max(0, level - mode.startingLevel) * mode.automaticRiseLevelStepTicks
  );
}

function resolveBoard(state: GameState, settleFirst = false): GameState {
  let board = state.board.map((row) => [...row]);
  let chain = 0;
  let highestCombo = 0;
  let score = state.score;

  if (settleFirst) {
    board = applyGravity(board);
  }

  while (true) {
    const matches = findMatches(board);

    if (matches.size === 0) {
      break;
    }

    chain += 1;
    highestCombo = Math.max(highestCombo, matches.size);
    score += matches.size * clearScore + Math.max(0, matches.size - 3) * comboScore + Math.max(0, chain - 1) * chainScore;
    board = clearMatches(board, matches);
    board = applyGravity(board);
  }

  const maxChain = Math.max(state.maxChain, chain);
  const maxCombo = Math.max(state.maxCombo, highestCombo);

  return {
    ...state,
    board,
    boardHash: hashBoard(board),
    level: state.mode.startingLevel + Math.floor(score / 1000),
    lastResolvedChain: chain,
    lastResolvedCombo: highestCombo,
    maxChain,
    maxCombo,
    score
  };
}

function findMatches(board: Board): Set<string> {
  const matches = new Set<string>();

  for (let row = 0; row < board.length; row += 1) {
    collectLineMatches(board[row], (column) => `${row}:${column}`, matches);
  }

  for (let column = 0; column < (board[0]?.length ?? 0); column += 1) {
    collectLineMatches(
      board.map((row) => row[column]),
      (row) => `${row}:${column}`,
      matches
    );
  }

  return matches;
}

function collectLineMatches(line: BoardCell[], keyForIndex: (index: number) => string, matches: Set<string>) {
  let runStart = 0;

  for (let index = 1; index <= line.length; index += 1) {
    const previous = line[runStart];
    const current = line[index];

    if (previous !== null && current?.suit === previous.suit) {
      continue;
    }

    if (previous !== null && index - runStart >= 3) {
      for (let matchIndex = runStart; matchIndex < index; matchIndex += 1) {
        matches.add(keyForIndex(matchIndex));
      }
    }

    runStart = index;
  }
}

function clearMatches(board: Board, matches: Set<string>): Board {
  return board.map((row, rowIndex) =>
    row.map((tile, columnIndex) => (matches.has(`${rowIndex}:${columnIndex}`) ? null : tile))
  );
}

function applyGravity(board: Board): Board {
  const rows = board.length;
  const columns = board[0]?.length ?? 0;
  const next = Array.from({ length: rows }, () => Array.from({ length: columns }, () => null as BoardCell));

  for (let column = 0; column < columns; column += 1) {
    let writeRow = rows - 1;

    for (let row = rows - 1; row >= 0; row -= 1) {
      const tile = board[row][column];

      if (tile !== null) {
        next[writeRow][column] = tile;
        writeRow -= 1;
      }
    }
  }

  return next;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}
