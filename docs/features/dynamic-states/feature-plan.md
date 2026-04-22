# Feature: Dynamic States — Feature Plan

## Summary

Implement the state machine that governs ChuChu's condition. Three mutually exclusive states (Normal, Sick, Evolved) provide immediate visual feedback on the player's caretaking quality and create mechanical consequences for neglect.

## Problem Statement

Without states, stats are just numbers on a screen. The Dynamic States system translates stat values into visible, meaningful conditions — a puppy that is sick, a puppy that just evolved. These states create both urgency (Sick is dangerous!) and reward (Evolved is exciting!), providing the emotional payload the numbers alone cannot deliver.

## Approach

### State Machine

The state machine evaluates conditions on every tick and action application. Only one state is active at a time. Transitions are deterministic — given a stats snapshot and the current state, the next state is always predictable.

```
┌─────────┐
│ NORMAL  │◄──────────────────────────────────────────────┐
└────┬────┘                                                │
     │                                                     │
     ├──(any stat = 0)──────────┐                          │
     │                          ▼                          │
     │                   ┌─────────┐                       │
     │                   │  SICK   │──(all stats > 20)────┘
     │                   └─────────┘   (Recovery Path)
     │
     └──(evolution trigger)─────┐
                                ▼
                         ┌──────────┐
                         │ EVOLVED  │──(10s elapsed)──→ NORMAL (new stage)
                         └──────────┘
```

### State Evaluation Rules (Priority Order)

On each tick, states are evaluated in this priority order:

1. **EVOLVED** — If currently evolving (managed externally by evolution system): remain in Evolved state. Do not evaluate other transitions.
2. **SICK** — If any stat = 0 → enter Sick. If currently Sick AND all stats > 20 → recover to Normal.
3. **NORMAL** — Default state if none of the above apply.

**Priority rationale:** Evolved takes top priority because it's a reward moment — we don't want Sick to interrupt an evolution celebration. Sick takes priority over Normal because it's a penalty state that must be explicitly escaped.

### State Effects

**Normal:**
- Decay rate: 1 per tick (default)
- Action effectiveness: 100%
- Visual: Standard idle animations (breathing, tail wag, eye movement)

**Sick:**
- Decay rate: 2× (2 per tick instead of 1)
- Action effectiveness: 50% (all stat modifiers halved, rounded down)
- Visual: Green-tinted overlay on pet (CSS `hue-rotate(60deg) saturate(0.6)`), thermometer emoji, wobble animation
- Entry condition: Any single stat reaches 0
- Exit condition (Recovery Path): ALL three stats must be strictly above 20
- Dialogue: "I don't feel so good... 🤒" on entry, "Phew! I feel better now! 😮‍💨" on recovery

**Evolved:**
- Decay rate: 0 (all stats frozen — 10-second invulnerability)
- Action effectiveness: 0 (buttons disabled during evolution animation)
- Visual: Golden glow, sparkle burst, sprite transforms to Evolved Puppy
- Duration: Exactly 10 seconds (`CONFIG.EVOLUTION_INVULNERABILITY_MS`), then auto-transitions to Normal
- Entry: Triggered by evolution system (Feature 4)

### Visual Feedback

Each state change applies a combination of:
1. **CSS class on `#pet-container`**: `state-normal`, `state-sick`, `state-evolved`
2. **State badge**: colored badge in header changes text and color
3. **Overlay element**: thermometer emoji for sick, sparkle glow for evolved

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| Multiple stats hit 0 simultaneously | Enters Sick state (any stat = 0 is sufficient) |
| Stat hits 0 during evolution | No effect — Evolved state has highest priority, stats frozen |
| All stats at 21 while Sick | Remains Sick — recovery requires strictly > 20 |
| All stats at exactly 20 while Sick | Remains Sick — recovery requires strictly > 20 |
| Feed raises hunger above 20 but other stats still ≤ 20 | Remains Sick — ALL stats must be > 20 |
| Evolution criteria met while Sick | Evolution blocked — only triggers from Normal state |

## In Scope

- `state-machine.js` module with evaluate/canAct/getDecayMultiplier/getActionMultiplier methods
- Integration into game-loop.js tick cycle
- Sick state: 2× decay, 50% action effectiveness, green overlay, thermometer
- Evolved state: 10-second invulnerability, stat freeze, sparkle effect
- Recovery path: Sick → Normal when all stats > 20
- State transition events: `'state:changed'` with `{ from, to }`
- State badge UI updates
- Sick/evolved visual overlays
- Button disable/enable based on canAct()
- Sick modifier applied to action effects in game-loop.js

## Out of Scope

- What triggers Evolved state (Feature 4: Evolution System handles the trigger)
- Easter egg interactions during states
- Sound effects for state changes

## Dependencies

- Feature 1: Living Vitals (stat engine, tick loop)
- Feature 2: Care Loop (action effects modified by state)
