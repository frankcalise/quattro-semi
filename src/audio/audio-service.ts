import { createAudioPlayer, setAudioModeAsync, setIsAudioActiveAsync } from "expo-audio";

export type SfxName = "move" | "swap" | "invalid" | "clear" | "chain" | "combo" | "raise" | "danger" | "game-over";

declare const require: (path: string) => number;

const sources: Record<SfxName, number> = {
  move: require("../../assets/sfx/selector.wav"),
  swap: require("../../assets/sfx/swap.wav"),
  invalid: require("../../assets/sfx/invalid.wav"),
  clear: require("../../assets/sfx/clear.wav"),
  chain: require("../../assets/sfx/chain.wav"),
  combo: require("../../assets/sfx/combo.wav"),
  raise: require("../../assets/sfx/raise.wav"),
  danger: require("../../assets/sfx/danger.wav"),
  "game-over": require("../../assets/sfx/game-over.wav")
};

type AudioPlayer = ReturnType<typeof createAudioPlayer>;

const players = new Map<SfxName, AudioPlayer>();
let configured = false;
let enabled = true;

export async function configureAudio() {
  if (configured) {
    return;
  }

  configured = true;

  try {
    await setAudioModeAsync({
      interruptionMode: "mixWithOthers",
      playsInSilentMode: true,
      shouldPlayInBackground: false
    });
  } catch {
    // Audio setup is optional polish; failed setup should not affect the game loop.
  }
}

export function setSfxEnabled(value: boolean) {
  enabled = value;
  void setIsAudioActiveAsync(value).catch(() => undefined);
}

export function setSfxActive(value: boolean) {
  if (!enabled) {
    return;
  }

  void setIsAudioActiveAsync(value).catch(() => undefined);
}

export function playSfx(name: SfxName) {
  if (!enabled) {
    return;
  }

  void configureAudio();

  try {
    const player = getPlayer(name);
    const volume = name === "danger" || name === "game-over" ? 0.42 : 0.28;

    player.volume = volume;
    void player.seekTo(0).catch(() => undefined);
    player.play();
  } catch {
    // SFX is intentionally non-blocking.
  }
}

function getPlayer(name: SfxName) {
  const existing = players.get(name);

  if (existing) {
    return existing;
  }

  const player = createAudioPlayer(sources[name], {
    keepAudioSessionActive: false,
    updateInterval: 1000
  });

  players.set(name, player);
  return player;
}
