# Feature: Living Vitals — Feature Plan

## Summary

Create the real-time stat engine that drives ChuChu's need for care. Three vital meters — Hunger, Happiness, and Energy — automatically decay over time, creating the fundamental tension that makes the pet feel alive.

## Problem Statement

A virtual pet without changing state is just a static image. The Living Vitals system creates urgency: ChuChu's needs grow over time, compelling the player to act. Without this engine, the rest of the game has no foundation — actions, states, and evolution all depend on stat values.

## Approach

### Game Loop Architecture

A `setInterval`-based tick loop runs every 10 seconds (configurable via `CONFIG.TICK_INTERVAL_MS`). Each tick:
1. Decrements each stat by the decay rate (1 per tick in Normal state)
2. Clamps all stats to the 0–100 range
3. Emits a `'tick'` event with the updated stats snapshot
4. The UI layer subscribes to this event and re-renders the stat bars

### Stat Representation

Each stat is a simple integer:
```javascript
const stats = {
  hunger: 80,      // 0 = starving, 100 = stuffed
  happiness: 80,   // 0 = miserable, 100 = ecstatic
  energy: 80       // 0 = exhausted, 100 = hyper
};
```

### UI Component: Stat Bars

Each stat is rendered as a horizontal bar with:
- **Label** (emoji + name): `🍖 Hunger`
- **Track** (gray background): full width of the container
- **Fill** (colored bar): width = `stat_value%` of track
- **Value** (number): displayed at the end of the bar

**Color transitions:**
- Value 60–100: `--color-stat-high` (green #4CAF50)
- Value 30–59: `--color-stat-mid` (amber #FFC107)
- Value 0–29: `--color-stat-low` (red #F44336)

The fill width and color use CSS transitions (`transition: width 300ms ease, background-color 300ms ease`) so changes animate smoothly rather than jumping.

### ChuChu Sprite (Initial)

For this feature, ChuChu appears as a static Baby Puppy sprite with a subtle CSS breathing animation (gentle scale pulse). The sprite is centered in the pet area above the stats.

```css
@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}
#pet-sprite { animation: breathe 3s ease-in-out infinite; }
```

## In Scope

- `game-loop.js` module with start/stop/tick/getState methods
- Three stat values (hunger, happiness, energy) initialized to 80
- Automatic decay: −1 per stat per 10-second tick
- Stat clamping to 0–100 range
- EventBus with `'tick'` event emission
- `stats-display.js` module rendering three animated stat bars
- Color-coded bar fills with smooth CSS transitions
- ChuChu baby sprite with breathing idle animation
- Basic page layout (header, pet area, stats area, empty actions area, footer)
- Google Fonts loading (Nunito + Baloo 2)

## Out of Scope

- Care actions (Feature 2: Care Loop)
- State transitions — stats CAN reach 0 but nothing happens yet (Feature 3: Dynamic States)
- Evolution — no stage tracking yet (Feature 4: Evolution System)
- Persistence — stats reset on refresh (Feature 6: Persistence)
- Easter eggs (Feature 5: Personal Touches)

## Dependencies

None — this is the foundational feature.

## Risks

| Risk | Mitigation |
|------|-----------|
| `setInterval` drift over long sessions | Acceptable for MVP. The tick is 10 seconds — drift of a few ms is imperceptible. |
| Tab backgrounding throttles timers | Modern browsers throttle `setInterval` to 1/second when backgrounded. This is fine — the persistence feature (Feature 6) handles elapsed time compensation. |
| Stats reach 0 with no consequence | Expected for this feature. Feature 3 adds state transitions. |
