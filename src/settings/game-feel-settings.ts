import AsyncStorage from "@react-native-async-storage/async-storage";

export type GameFeelSettings = {
  audioEnabled: boolean;
  hapticsEnabled: boolean;
};

export const defaultGameFeelSettings: GameFeelSettings = {
  audioEnabled: true,
  hapticsEnabled: true
};

const storageKey = "quattro-semi:game-feel-settings:v1";

export async function loadGameFeelSettings(): Promise<GameFeelSettings> {
  try {
    const raw = await AsyncStorage.getItem(storageKey);

    if (!raw) {
      return defaultGameFeelSettings;
    }

    return normalizeSettings(JSON.parse(raw));
  } catch {
    return defaultGameFeelSettings;
  }
}

export async function saveGameFeelSettings(settings: GameFeelSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(normalizeSettings(settings)));
  } catch {
    // Settings persistence is best effort; gameplay must stay independent of storage.
  }
}

function normalizeSettings(value: Partial<GameFeelSettings>): GameFeelSettings {
  return {
    audioEnabled: typeof value.audioEnabled === "boolean" ? value.audioEnabled : defaultGameFeelSettings.audioEnabled,
    hapticsEnabled:
      typeof value.hapticsEnabled === "boolean" ? value.hapticsEnabled : defaultGameFeelSettings.hapticsEnabled
  };
}
