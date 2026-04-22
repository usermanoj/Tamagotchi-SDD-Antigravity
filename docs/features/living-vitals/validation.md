# Feature: Living Vitals — Validation

## Test Procedures

### VAL-LV-001: Initial State
**Steps:**
1. Open the application in a fresh browser (clear localStorage first)
2. Observe the three stat bars

**Expected:**
- All three bars show value `80`
- All three bars are green-colored
- All three bars are at 80% width

---

### VAL-LV-002: Stat Decay Over Time
**Steps:**
1. Open the application (fresh state, stats = 80)
2. Wait 10 seconds (1 tick)
3. Observe stat values
4. Wait another 10 seconds (2 ticks total)
5. Observe stat values

**Expected:**
- After 1 tick: all stats show `79`
- After 2 ticks: all stats show `78`
- Bar widths decrease proportionally

---

### VAL-LV-003: Color Transitions
**Steps:**
1. Open the application
2. Wait until any stat drops below 60 (after ~200 seconds / ~3.3 minutes)
3. Continue until a stat drops below 30

**Expected:**
- At stat value 59: bar transitions from green to amber
- At stat value 29: bar transitions from amber to red
- Color transitions are smooth (animated), not instant

**Shortcut for testing:** Manually set a stat value via browser console:
```javascript
// Access game loop and set stats for testing
window.__gameLoop.stats.hunger = 25;
window.__gameLoop.tick();
```

---

### VAL-LV-004: Stat Floor (Clamping at 0)
**Steps:**
1. Open the application
2. Wait until any stat reaches 0 (800 seconds / ~13.3 minutes without intervention)
3. Wait one more tick

**Expected:**
- Stat at 0 remains 0 (does not go negative)
- Bar fill width is 0%
- Bar color is red

**Shortcut:** Set a stat to 1 via console and wait one tick.

---

### VAL-LV-005: Pet Sprite Display
**Steps:**
1. Open the application
2. Observe the pet area

**Expected:**
- ChuChu baby puppy sprite is visible and centered
- Sprite has a gentle breathing animation (subtle scale pulsing)
- Sprite is sized appropriately for the viewport

---

### VAL-LV-006: Responsive Layout
**Steps:**
1. Open the application in Chrome DevTools device simulator
2. Test at 375px width (iPhone SE)
3. Test at 768px width (tablet)
4. Test at 1024px+ width (desktop)

**Expected:**
- At all widths: header, pet, stats, actions area, footer are visible without horizontal scroll
- Stat bars span full container width
- Pet sprite scales proportionally
- No content overflow or clipping

---

### VAL-LV-007: Tick Event Emission
**Steps:**
1. Open browser console
2. Add listener: `document.addEventListener('tick', e => console.log('tick', e.detail))`
3. Wait 10 seconds

**Expected:**
- Console shows tick events with `{ stats: { hunger: N, happiness: N, energy: N } }`
- Events fire approximately every 10 seconds

---

## Automated Checks (Console Commands)

```javascript
// Verify initial stats
console.assert(window.__gameLoop.getState().stats.hunger === 80, 'Initial hunger should be 80');
console.assert(window.__gameLoop.getState().stats.happiness === 80, 'Initial happiness should be 80');
console.assert(window.__gameLoop.getState().stats.energy === 80, 'Initial energy should be 80');

// Verify decay
window.__gameLoop.tick();
console.assert(window.__gameLoop.getState().stats.hunger === 79, 'After 1 tick, hunger should be 79');

// Verify clamping
window.__gameLoop.stats.hunger = 0;
window.__gameLoop.tick();
console.assert(window.__gameLoop.getState().stats.hunger === 0, 'Hunger should not go below 0');
```

## Pass Criteria

- [ ] All three stats initialize to 80 on fresh load
- [ ] Stats decrement by 1 every ~10 seconds
- [ ] Stats never go below 0 or above 100
- [ ] Stat bars animate smoothly on value changes
- [ ] Bar colors transition at thresholds (60, 30)
- [ ] ChuChu sprite is visible with breathing animation
- [ ] Layout is responsive from 375px to 1024px+
- [ ] Tick events are emitted and loggable
