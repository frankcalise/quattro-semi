import { Presets, Settings } from "react-native-pulsar";

export type HapticPattern = "move" | "swap" | "invalid" | "clear" | "chain" | "combo" | "raise" | "danger" | "game-over";

let enabled = true;

const patternPlayers: Record<HapticPattern, () => void> = {
  move: Presets.System.selection,
  swap: Presets.System.impactLight,
  invalid: Presets.System.notificationWarning,
  clear: Presets.System.impactMedium,
  chain: Presets.cascade,
  combo: Presets.flourish,
  raise: Presets.System.impactSoft,
  danger: Presets.System.impactHeavy,
  "game-over": Presets.System.notificationError
};

export function setHapticsEnabled(value: boolean) {
  enabled = value;

  try {
    Settings.enableHaptics(value);
  } catch {
    // Missing native haptic support should never interrupt gameplay.
  }
}

export function playHaptic(pattern: HapticPattern) {
  if (!enabled) {
    return;
  }

  try {
    patternPlayers[pattern]();
  } catch {
    // Haptics are best-effort feedback.
  }
}
