// ─── ChuChu Tamagotchi — Evolution Tracker ───
// Tracks care quality, active time, and determines evolution readiness.
// Single evolution: Baby ChuChu → Evolved Puppy (per challenge scope: "1 evolution")

import { CONFIG } from '../config.js';

export const STAGES = {
  BABY: 'baby',
  EVOLVED: 'evolved',
};

export const STAGE_INFO = {
  baby:    { name: 'Baby ChuChu',    emoji: '🐶' },
  evolved: { name: 'Evolved Puppy', emoji: '🌟' },
};

export class EvolutionTracker {
  constructor() {
    this.stage = STAGES.BABY;
    this.activeTime = 0;         // cumulative active seconds
    this.careHistory = [];       // rolling care quality samples
    this.careQuality = CONFIG.STAT_INITIAL;
    this._lastSampleTime = 0;
    this._visibleSince = null;
    this._tickAccumulator = 0;

    // Track tab visibility for active time
    this._onVisibilityChange = this._onVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this._onVisibilityChange);

    if (!document.hidden) {
      this._visibleSince = performance.now();
    }
  }

  _onVisibilityChange() {
    if (document.hidden) {
      // Tab hidden — accumulate active time
      if (this._visibleSince !== null) {
        this.activeTime += (performance.now() - this._visibleSince) / 1000;
        this._visibleSince = null;
      }
    } else {
      // Tab visible — start counting
      this._visibleSince = performance.now();
    }
  }

  /** Get current accumulated active time in seconds */
  getActiveTime() {
    let time = this.activeTime;
    if (this._visibleSince !== null) {
      time += (performance.now() - this._visibleSince) / 1000;
    }
    return Math.floor(time);
  }

  /** Record a care quality sample from current stats */
  sampleCareQuality(stats) {
    const quality = Math.round((stats.hunger + stats.happiness + stats.energy) / 3);
    this.careHistory.push(quality);
    if (this.careHistory.length > CONFIG.CARE_HISTORY_SIZE) {
      this.careHistory.shift();
    }
    this.careQuality = this.getCareQuality();
  }

  /** Get rolling care quality average */
  getCareQuality() {
    if (this.careHistory.length === 0) return CONFIG.STAT_INITIAL;
    const sum = this.careHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.careHistory.length);
  }

  /**
   * Check if evolution should occur.
   * Single evolution: Baby → Evolved when:
   *   1. Active time ≥ 3 minutes
   *   2. Care quality ≥ 50%
   *   3. Currently in Normal state (not Sick)
   * Returns the next stage string or null.
   */
  checkEvolution(currentState) {
    // Don't evolve during special states
    if (currentState !== 'normal') return null;

    // Already evolved — final form
    if (this.stage === STAGES.EVOLVED) return null;

    const time = this.getActiveTime();
    const quality = this.getCareQuality();

    if (time >= CONFIG.EVOLUTION_MIN_ACTIVE_TIME &&
        quality >= CONFIG.EVOLUTION_MIN_CARE_QUALITY) {
      return STAGES.EVOLVED;
    }

    return null;
  }

  /** Apply a stage transition */
  evolve(newStage) {
    this.stage = newStage;
  }

  /** Tick the care quality sampler */
  tick(stats, deltaMs) {
    this._tickAccumulator += deltaMs;
    if (this._tickAccumulator >= CONFIG.CARE_SAMPLE_INTERVAL_MS) {
      this._tickAccumulator -= CONFIG.CARE_SAMPLE_INTERVAL_MS;
      this.sampleCareQuality(stats);
    }
  }

  /** Serialize for persistence */
  serialize() {
    return {
      stage: this.stage,
      activeTime: this.getActiveTime(),
      careHistory: [...this.careHistory],
      careQuality: this.careQuality,
    };
  }

  /** Restore from persisted state */
  deserialize(data) {
    if (!data) return;
    this.stage = data.stage || STAGES.BABY;
    this.activeTime = data.activeTime || 0;
    this.careHistory = data.careHistory || [];
    this.careQuality = data.careQuality || CONFIG.STAT_INITIAL;
    if (!document.hidden) {
      this._visibleSince = performance.now();
    }
  }
}
