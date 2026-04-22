# Feature: Care Loop — Feature Plan

## Summary

Add the three care actions (Feed, Play, Rest) that let the player interact with ChuChu. Each action modifies stats with primary and secondary effects, has a 3-second cooldown, and triggers a distinct animation. This completes the core gameplay loop: stats decay → player acts → stats recover.

## Problem Statement

Without actions, ChuChu's stats decrease to zero with no player agency. The Care Loop transforms ChuChu from a passive countdown to an interactive experience. The player must thoughtfully rotate between three actions to keep ChuChu healthy, creating a simple but engaging resource management puzzle.

## Approach

### Action System

Three buttons appear below the stats area. Each button triggers a function that:
1. Checks if the action is on cooldown → if yes, ignore
2. Checks if ChuChu can act (not evolving) → if no, ignore  
3. Applies stat changes (primary + secondary effects)
4. Clamps all stats to 0–100
5. Starts a 3-second cooldown on that button
6. Triggers an animation on the pet sprite
7. Emits an `'action:applied'` event

### Stat Modification Table

| Action | Hunger | Happiness | Energy | Net Effect |
|--------|--------|-----------|--------|------------|
| **Feed** 🍖 | +20 | +5 | 0 | Fills belly, small mood boost |
| **Play** 🎾 | −5 | +20 | −10 | Big mood boost, costs energy and hunger |
| **Rest** 💤 | 0 | −5 | +25 | Recharges energy, slightly boring |

**Design rationale:**
- Play is the "expensive" action — it gives the most happiness but costs energy AND hunger, creating pressure to feed and rest.
- Rest has a happiness penalty — the player can't just spam rest to keep ChuChu going. They need to play too.
- Feed is the safest action — pure benefit with a small happiness bonus.

### Cooldown System

Each action has an independent 3-second cooldown:
- On action trigger: start a 3-second timer for that specific button
- During cooldown: button is visually disabled with a circular progress ring animation
- After cooldown: button re-enables with a subtle pop animation
- Multiple buttons can be on cooldown simultaneously

The cooldown is per-action, not global. The player can Feed, then immediately Play (different button), but cannot Feed twice in 3 seconds.

### Action Animations

When an action triggers, the pet sprite plays a short animation:

| Action | Animation | Duration |
|--------|-----------|----------|
| **Feed** | ChuChu's mouth opens, a bone floats in, tail wags rapidly | 1.5s |
| **Play** | ChuChu bounces up, a ball appears, ChuChu chases it | 2s |
| **Rest** | ChuChu curls up briefly, zzz bubbles float up | 1.5s |

Animations are CSS-driven. The pet sprite gets a temporary CSS class (`eating`, `playing`, `resting`) that triggers `@keyframes`. The class is removed after the animation duration.

### Stat Change Feedback

When an action is applied, the affected stat bars briefly flash:
- Green flash for stat increases (+)
- Red flash for stat decreases (−)

This is a quick 300ms opacity pulse on the bar fill, providing immediate visual feedback that the action worked.

## In Scope

- `actions-panel.js` module with button rendering and cooldown management
- `GameLoop.applyAction(name)` method for stat modification
- Three action buttons with emoji icons, labels, and cooldown rings
- Per-action 3-second cooldown with visual progress indicator
- Stat clamping after action application
- Pet animation CSS classes for eat/play/rest
- Stat bar flash feedback (green for +, red for −)
- `'action:applied'` event emission with effects summary
- Button disabled state when `canAct()` returns false

## Out of Scope

- Sick modifier (half effectiveness) — added in Feature 3: Dynamic States
- Evolving blocking (no actions during evolution) — added in Feature 3: Dynamic States
- Sound effects on action
- Action history tracking

## Dependencies

- Feature 1: Living Vitals (stat engine, stat bars, page layout)
