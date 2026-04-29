import { setup } from "xstate";

export const gameSessionMachine = setup({
  types: {
    context: {} as {
      modeId: "practice" | "classic";
      seed: string;
    }
  }
}).createMachine({
  id: "gameSession",
  initial: "boot",
  context: {
    modeId: "practice",
    seed: "default"
  },
  states: {
    boot: {
      on: {
        READY: "countdown"
      }
    },
    countdown: {
      on: {
        START: "playing"
      }
    },
    playing: {
      on: {
        PAUSE: "paused",
        GAME_OVER: "gameOver"
      }
    },
    paused: {
      on: {
        RESUME: "playing",
        QUIT: "gameOver"
      }
    },
    gameOver: {
      type: "final"
    }
  }
});
