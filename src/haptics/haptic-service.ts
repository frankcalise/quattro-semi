export type HapticPattern = "selector" | "swap" | "invalid" | "clear" | "chain" | "danger" | "game-over";

export function playHaptic(_pattern: HapticPattern) {
  // Backed by react-native-pulsar once dev-client plumbing is installed.
}
