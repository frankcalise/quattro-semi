export type SfxName = "selector" | "swap" | "invalid" | "clear" | "chain" | "combo" | "raise" | "danger" | "game-over";

export function playSfx(_name: SfxName) {
  // Audio is intentionally deferred until the core loop is playable.
}
