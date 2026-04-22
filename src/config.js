// ─── ChuChu Tamagotchi — Configuration ───
// All tunable values centralized in one place.
// See: docs/specs/tech-stack.md § Configuration

export const CONFIG = {
  // Tick timing
  TICK_INTERVAL_MS: 1_000,
  CARE_SAMPLE_INTERVAL_MS: 6_000,
  CARE_HISTORY_SIZE: 20,
  AUTO_SAVE_INTERVAL_MS: 10_000,

  // Stat ranges
  STAT_MIN: 0,
  STAT_MAX: 100,
  STAT_INITIAL: 80,

  // Decay rates (per tick)
  DECAY_NORMAL: 2,
  DECAY_SICK_MULTIPLIER: 2,

  // Action effects
  ACTIONS: {
    feed:  { hunger: 20, happiness: 5,   energy: 0    },
    play:  { hunger: -5, happiness: 20,  energy: -10  },
    rest:  { hunger: 0,  happiness: -5,  energy: 25   },
  },
  ACTION_COOLDOWN_MS: 250,
  SICK_ACTION_MULTIPLIER: 0.8,

  // State thresholds
  SICK_THRESHOLD: 0,               // Any stat at 0 → Sick
  SICK_RECOVERY_THRESHOLD: 20,    // All stats > 20 → recover from Sick

  // Evolution — single step: Baby → Evolved
  EVOLUTION_INVULNERABILITY_MS: 10_000,
  EVOLUTION_MIN_ACTIVE_TIME: 60,       // 1 minute of active play
  EVOLUTION_MIN_CARE_QUALITY: 50,       // Care quality ≥ 50%

  // Easter eggs
  RAPID_CLICK_THRESHOLD: 10,
  RAPID_CLICK_WINDOW_MS: 3_000,
  IDLE_DANCE_DELAY_MS: 60_000,
  KONAMI_CODE: ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'],
  KONAMI_EFFECT_DURATION_MS: 30_000,

  // Dialogue
  DIALOGUE_DISPLAY_MS: 3_500,
  DIALOGUE_COOLDOWN_MS: 15_000,

  // Persistence
  STORAGE_KEY: 'chuchu_save',
  SAVE_VERSION: 2,                // Bumped version — new schema (no teen/golden/street)
  OFFLINE_DECAY_CAP: 100,
};
