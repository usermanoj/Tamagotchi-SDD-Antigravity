// ─── ChuChu Tamagotchi — Persistence ───
// localStorage save/load with offline decay compensation.

import { CONFIG } from '../config.js';

export class Persistence {
  /** Save game state to localStorage */
  save(gameState) {
    try {
      const payload = {
        version: CONFIG.SAVE_VERSION,
        timestamp: Date.now(),
        ...gameState,
      };
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('[Persistence] Failed to save:', e.message);
    }
  }

  /** Load game state from localStorage. Returns { data, elapsedSeconds } or null */
  load() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (!raw) return null;

      const data = JSON.parse(raw);

      // Version check
      if (!data.version || data.version !== CONFIG.SAVE_VERSION) {
        console.warn('[Persistence] Version mismatch or missing — starting fresh');
        this.clear();
        return null;
      }

      // Validate required fields
      if (!data.stats || !data.timestamp) {
        console.warn('[Persistence] Invalid save data — starting fresh');
        this.clear();
        return null;
      }

      const elapsedSeconds = Math.max(0, (Date.now() - data.timestamp) / 1000);

      return { data, elapsedSeconds };
    } catch (e) {
      console.warn('[Persistence] Corrupted save data — starting fresh:', e.message);
      this.clear();
      return null;
    }
  }

  /** Calculate stat decay for time spent offline */
  calculateOfflineDecay(elapsedSeconds) {
    const decayTicks = Math.floor(elapsedSeconds / (CONFIG.TICK_INTERVAL_MS / 1000));
    return Math.min(decayTicks * CONFIG.DECAY_NORMAL, CONFIG.OFFLINE_DECAY_CAP);
  }

  /** Get welcome-back message based on elapsed time and health */
  getWelcomeMessage(elapsedSeconds, isSick) {
    if (elapsedSeconds < 60) return null;

    if (elapsedSeconds < 300) { // < 5 min
      return isSick
        ? "You're back... I don't feel so great... 🤒"
        : "You're back! I barely noticed you were gone! 😊";
    }
    if (elapsedSeconds < 1800) { // < 30 min
      return isSick
        ? "Where were you?! I'm not feeling well... 😢"
        : "I missed you! Did you bring snacks? 🥺";
    }
    // 30+ min
    return isSick
      ? "I waited and waited... I'm so hungry... 😢"
      : "You were gone FOREVER! I thought you forgot about me! 😭";
  }

  /** Clear save data */
  clear() {
    try {
      localStorage.removeItem(CONFIG.STORAGE_KEY);
    } catch (e) {
      console.warn('[Persistence] Failed to clear:', e.message);
    }
  }

  /** Check if save data exists */
  hasSaveData() {
    try {
      return localStorage.getItem(CONFIG.STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  }
}
