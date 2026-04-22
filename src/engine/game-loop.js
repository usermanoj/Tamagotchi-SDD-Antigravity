// ─── ChuChu Tamagotchi — Game Loop ───
// The heartbeat: manages tick interval, stat decay, state checks, evolution.

import { CONFIG } from '../config.js';
import { bus } from './event-bus.js';
import { StateMachine, STATES } from './state-machine.js';
import { EvolutionTracker } from './evolution.js';
import { Persistence } from './persistence.js';

export class GameLoop {
  constructor() {
    this.stats = {
      hunger: CONFIG.STAT_INITIAL,
      happiness: CONFIG.STAT_INITIAL,
      energy: CONFIG.STAT_INITIAL,
    };

    this.state = STATES.NORMAL;
    this.stateMachine = new StateMachine();
    this.evolution = new EvolutionTracker();
    this.persistence = new Persistence();

    this._tickInterval = null;
    this._saveInterval = null;
    this._isEvolving = false;
    this._evolveTimeout = null;
    this._cooldowns = { feed: 0, play: 0, rest: 0 };
    this._lastTickTime = performance.now();

    // Expose for console debugging
    window.__gameLoop = this;
    window.__evolutionTracker = this.evolution;
  }

  /** Initialize — load saved state or start fresh */
  init() {
    const loaded = this.persistence.load();

    if (loaded) {
      const { data, elapsedSeconds } = loaded;

      // Restore stats
      this.stats = { ...data.stats };

      // Apply offline decay
      const decay = this.persistence.calculateOfflineDecay(elapsedSeconds);
      if (decay > 0) {
        this.stats.hunger = Math.max(CONFIG.STAT_MIN, this.stats.hunger - decay);
        this.stats.happiness = Math.max(CONFIG.STAT_MIN, this.stats.happiness - decay);
        this.stats.energy = Math.max(CONFIG.STAT_MIN, this.stats.energy - decay);
      }

      // Restore evolution state
      if (data.evolution) {
        this.evolution.deserialize(data.evolution);
      }

      // Re-evaluate state after offline decay
      this.state = this.stateMachine.evaluate(this.stats, STATES.NORMAL, false, this.evolution.stage);

      // Welcome back dialogue
      const isSick = this.state === STATES.SICK;
      const welcomeMsg = this.persistence.getWelcomeMessage(elapsedSeconds, isSick);
      if (welcomeMsg) {
        // Delay slightly so the UI is ready
        setTimeout(() => bus.emit('dialogue:show', { text: welcomeMsg, duration: 4000 }), 500);
      }
    }

    // Initial render
    bus.emit('tick', this._snapshot());
    bus.emit('state:changed', { from: null, to: this.state });
    bus.emit('stage:info', {
      stage: this.evolution.stage,
      careQuality: this.evolution.getCareQuality(),
      activeTime: this.evolution.getActiveTime(),
    });
  }

  /** Start the game loop */
  start() {
    this._lastTickTime = performance.now();

    this._tickInterval = setInterval(() => this.tick(), CONFIG.TICK_INTERVAL_MS);

    // Auto-save
    this._saveInterval = setInterval(() => this._save(), CONFIG.AUTO_SAVE_INTERVAL_MS);

    // Save on page unload / tab hide
    window.addEventListener('beforeunload', () => this._save());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this._save();
    });
  }

  /** Stop the game loop */
  stop() {
    clearInterval(this._tickInterval);
    clearInterval(this._saveInterval);
  }

  /** Execute a single tick */
  tick() {
    const now = performance.now();
    const deltaMs = now - this._lastTickTime;
    this._lastTickTime = now;

    const prevState = this.state;

    // --- Apply stat decay (frozen during transformation) ---
    if (!this._isEvolving) {
      const multiplier = this.stateMachine.getDecayMultiplier(this.state);
      if (multiplier > 0) {
        this.stats.hunger = Math.max(CONFIG.STAT_MIN, this.stats.hunger - CONFIG.DECAY_NORMAL * multiplier);
        this.stats.happiness = Math.max(CONFIG.STAT_MIN, this.stats.happiness - CONFIG.DECAY_NORMAL * multiplier);
        this.stats.energy = Math.max(CONFIG.STAT_MIN, this.stats.energy - CONFIG.DECAY_NORMAL * multiplier);
      }
    }

    // --- Evolution care quality tick ---
    this.evolution.tick(this.stats, CONFIG.TICK_INTERVAL_MS);

    // --- State evaluation ---
    const newState = this.stateMachine.evaluate(this.stats, this.state, this._isEvolving, this.evolution.stage);
    if (newState !== this.state) {
      this.state = newState;
      bus.emit('state:changed', { from: prevState, to: newState });
    }

    // --- Evolution check (only in normal state) ---
    if (!this._isEvolving) {
      const nextStage = this.evolution.checkEvolution(this.state);
      if (nextStage) {
        this._triggerEvolution(nextStage);
      }
    }

    // --- Emit tick ---
    bus.emit('tick', this._snapshot());
    bus.emit('stage:info', {
      stage: this.evolution.stage,
      careQuality: this.evolution.getCareQuality(),
      activeTime: this.evolution.getActiveTime(),
    });
  }

  /** Apply an action (feed, play, rest) */
  applyAction(actionName) {
    // Freeze player input during transformation animation
    if (this._isEvolving) return false;
    if (!this.stateMachine.canAct(this.state)) return false;

    // Cooldown check
    if (Date.now() < this._cooldowns[actionName]) return false;

    const effects = CONFIG.ACTIONS[actionName];
    if (!effects) return false;

    const multiplier = this.stateMachine.getActionMultiplier(this.state);

    const appliedEffects = {};
    for (const [stat, delta] of Object.entries(effects)) {
      const adjusted = Math.floor(delta * multiplier);
      this.stats[stat] = this._clamp(this.stats[stat] + adjusted);
      appliedEffects[stat] = adjusted;
    }

    // Start cooldown
    this._cooldowns[actionName] = Date.now() + CONFIG.ACTION_COOLDOWN_MS;

    // Re-evaluate state immediately
    const prevState = this.state;
    const newState = this.stateMachine.evaluate(this.stats, this.state, this._isEvolving, this.evolution.stage);
    if (newState !== this.state) {
      this.state = newState;
      bus.emit('state:changed', { from: prevState, to: newState });
    }

    bus.emit('action:applied', { action: actionName, effects: appliedEffects, newStats: { ...this.stats } });
    bus.emit('tick', this._snapshot());

    // Start cooldown UI event
    bus.emit('action:cooldown', { action: actionName, remainingMs: CONFIG.ACTION_COOLDOWN_MS });

    return true;
  }

  /** Force-trigger evolution (for console testing) */
  triggerEvolution(from, to) {
    this._triggerEvolution(to);
  }

  /** Reset to fresh state */
  reset() {
    this.stop();
    this.persistence.clear();
    this.stats = {
      hunger: CONFIG.STAT_INITIAL,
      happiness: CONFIG.STAT_INITIAL,
      energy: CONFIG.STAT_INITIAL,
    };
    this.state = STATES.NORMAL;
    this._isEvolving = false;
    if (this._evolveTimeout) clearTimeout(this._evolveTimeout);
    this.evolution = new EvolutionTracker();
    this._cooldowns = { feed: 0, play: 0, rest: 0 };
    window.__evolutionTracker = this.evolution;
  }

  // ─── Private ───

  _triggerEvolution(nextStage) {
    const prevStage = this.evolution.stage;
    this._isEvolving = true;

    // Enter evolved state
    const prevState = this.state;
    this.state = STATES.EVOLVED;
    bus.emit('state:changed', { from: prevState, to: STATES.EVOLVED });
    bus.emit('stage:evolving', { from: prevStage, to: nextStage });

    // After invulnerability window, complete evolution
    this._evolveTimeout = setTimeout(() => {
      this.evolution.evolve(nextStage);
      this._isEvolving = false;

      const finalState = this.stateMachine.evaluate(this.stats, this.state, false, nextStage);
      this.state = finalState;
      bus.emit('state:changed', { from: STATES.EVOLVED, to: finalState });
      bus.emit('stage:changed', {
        from: prevStage,
        to: nextStage,
        careQuality: this.evolution.getCareQuality(),
      });
      bus.emit('dialogue:show', {
        text: "Whoa! I feel so different! Look at me!! 🌟",
        duration: 4000,
      });
    }, CONFIG.EVOLUTION_INVULNERABILITY_MS);
  }

  _clamp(value) {
    return Math.max(CONFIG.STAT_MIN, Math.min(CONFIG.STAT_MAX, value));
  }

  _snapshot() {
    return {
      stats: { ...this.stats },
      state: this.state,
      stage: this.evolution.stage,
      canAct: this.stateMachine.canAct(this.state),
    };
  }

  _save() {
    this.persistence.save({
      stats: { ...this.stats },
      state: this.state,
      stage: this.evolution.stage,
      evolution: this.evolution.serialize(),
    });
  }
}
