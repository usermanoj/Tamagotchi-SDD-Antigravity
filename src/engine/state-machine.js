// ─── ChuChu Tamagotchi — State Machine ───
// Evaluates current stats to determine ChuChu's state.
// Required states per challenge scope: Normal, Sick, Evolved

import { CONFIG } from '../config.js';

export const STATES = {
  NORMAL: 'normal',
  SICK: 'sick',
  EVOLVED: 'evolved',
};

export class StateMachine {
  /**
   * Evaluate the next state based on current conditions.
   * Priority: evolved > sick > normal
   *
   * State machine:
   *   Normal ──(any stat = 0)──→ Sick
   *   Sick   ──(all stats > 20)──→ Normal   (recovery path)
   *   Normal ──(evolution trigger)──→ Evolved
   *   Evolved ──(10s elapsed)──→ Normal
   */
  evaluate(stats, currentState, isEvolving = false, stage = 'baby') {
    // During actual transformation, force EVOLVED state
    if (isEvolving) return STATES.EVOLVED;

    // Sick: any stat at 0
    if (stats.hunger <= CONFIG.SICK_THRESHOLD ||
        stats.happiness <= CONFIG.SICK_THRESHOLD ||
        stats.energy <= CONFIG.SICK_THRESHOLD) {
      return STATES.SICK;
    }

    // Recovering from sick: all stats above threshold
    if (currentState === STATES.SICK) {
      if (stats.hunger > CONFIG.SICK_RECOVERY_THRESHOLD &&
          stats.happiness > CONFIG.SICK_RECOVERY_THRESHOLD &&
          stats.energy > CONFIG.SICK_RECOVERY_THRESHOLD) {
        return stage === 'evolved' ? STATES.EVOLVED : STATES.NORMAL;
      }
      return STATES.SICK;
    }

    return stage === 'evolved' ? STATES.EVOLVED : STATES.NORMAL;
  }

  /** Can the player perform actions in this state? */
  canAct(state) {
    // Player can act in all states (freeze logic is handled by game-loop during evolution)
    return state === STATES.NORMAL || state === STATES.SICK || state === STATES.EVOLVED;
  }

  /** Stat decay multiplier per state */
  getDecayMultiplier(state) {
    switch (state) {
      case STATES.SICK: return CONFIG.DECAY_SICK_MULTIPLIER;  // 2× decay when sick
      default: return 1;
    }
  }

  /** Action effectiveness multiplier per state */
  getActionMultiplier(state) {
    switch (state) {
      case STATES.SICK: return CONFIG.SICK_ACTION_MULTIPLIER;  // 80% effectiveness when sick
      default: return 1;
    }
  }
}
