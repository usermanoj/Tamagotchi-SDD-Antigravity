# Feature: Evolution System — Feature Plan

## Summary

Implement a single-step evolution system where ChuChu grows from Baby Puppy to Evolved Puppy. Evolution is gated by the player's sustained care quality (rolling average of stat health) and cumulative active play time. This is the feature that creates a tangible goal and narrative arc.

## Problem Statement

Without evolution, ChuChu is the same creature forever — the player has no long-term goal. The evolution system gives players a target: keep ChuChu healthy for 3 minutes and be rewarded with a stunning visual transformation. This creates meaningful reason to play beyond immediate survival.

## Approach

### Care Quality Tracking

Care quality is a **rolling average** of stat snapshots:

1. Every 30 seconds, sample the current stats: `quality = Math.round((hunger + happiness + energy) / 3)`
2. Store the sample in a circular buffer of size 20 (represents ~10 minutes of history)
3. Care quality = arithmetic mean of all samples in the buffer
4. Range: 0–100 (same as individual stats)

**Why rolling average?** A point-in-time snapshot is too volatile — a player who took a 30-second break shouldn't be penalized forever. The rolling window captures sustained care quality while forgiving brief dips.

### Active Time Tracking

Evolution is gated by **active time** — cumulative seconds the tab has been open and visible.

- Start a `performance.now()` timer when the tab gains focus
- Pause the timer when the tab loses focus (`visibilitychange` event)
- Accumulate total active seconds
- Display as `Active: M:SS` in the footer

**Why active time?** If we used wall-clock time, a player could close the tab for 3 minutes, reopen it with decayed stats, and get an evolution. Active time ensures the player is actually present and playing.

### Evolution Stages

```javascript
const STAGES = {
  BABY: 'baby',      // Starting form
  EVOLVED: 'evolved', // Final form — 1 evolution per challenge scope
};

const STAGE_INFO = {
  baby:    { name: 'Baby Puppy',    emoji: '🐶' },
  evolved: { name: 'Evolved Puppy', emoji: '🌟' },
};
```

### Evolution Check Logic

On every tick, after stats and states are evaluated:

```
function checkEvolution(currentState):
    if currentState is not 'normal':
        return null  // don't evolve while Sick or already Evolved
    
    if currentStage is 'evolved':
        return null  // already at final form
    
    if activeTime >= 180 AND careQuality >= 50:
        return 'evolved'
    
    return null  // not ready yet
```

### Evolution Animation Sequence

When evolution triggers:

1. **Stats freeze** — `_isEvolving = true`, state becomes Evolved
2. **Glow phase** (0–5s): ChuChu glows brighter, scale pulses, golden aura
3. **Transform** (5s): CSS class swaps from `stage-baby` to `stage-evolved`
4. **Settle** (5–10s): New Evolved Puppy appearance visible, sparkle effects
5. **Complete** (10s): `_isEvolving = false`, state returns to Normal, stats resume

The entire 10-second sequence corresponds to the Evolved state from Feature 3.

### Visual Changes After Evolution

| Feature | Baby Puppy 🐶 | Evolved Puppy 🌟 |
|---------|---------------|-------------------|
| **Fur Color** | Warm tan (#F5C77E) | Radiant golden (#FFD54F) |
| **Eyes** | Normal dark pupils | Heart-shaped pupils (♥ via CSS `::before`) |
| **Body** | Small, round (120px head) | Larger (125px head), fluffier |
| **Ears** | Short floppy (55px) | Taller (60px), more elegant |
| **Belly** | Standard (90px) | Fuller (95px) |
| **Paws** | Small (32px) | Bigger (36px) |
| **Tail** | Short (35px) | Longer (42px) |
| **Sparkle** | None | Constant ✨ via CSS `::after` on `.pet-sprite` |

## In Scope

- `evolution.js` module with care quality sampling, active time tracking, evolution checks
- Care quality calculation: `Math.round((hunger + happiness + energy) / 3)`, 30-second samples, 20-sample rolling window
- Active time tracking via `visibilitychange` events and `performance.now()`
- Single evolution check on every tick: Baby → Evolved
- Evolution trigger → enters Evolved state (from Feature 3)
- Stage badge update in header (🐶 Baby Puppy → 🌟 Evolved Puppy)
- 10-second evolution animation sequence
- Different CSS visuals for Evolved Puppy
- Footer displays: `Active: M:SS` and `Care: N%`
- `'stage:changed'` event with `{ from, to, careQuality }`
- `'stage:evolving'` event with `{ from, to }`
- Serialization/deserialization for persistence (Feature 6)

## Out of Scope

- Reversing evolution (once evolved, cannot revert)
- Multiple evolution steps or branching paths
- Stage-specific action effects (all stages use same action values)
- Stage-specific idle animations beyond CSS styling differences

## Dependencies

- Feature 1: Living Vitals (stats values for quality calculation)
- Feature 3: Dynamic States (Evolved state, state checks before evolution)
