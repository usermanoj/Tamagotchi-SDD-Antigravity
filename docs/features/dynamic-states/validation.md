# Feature: Dynamic States — Validation

## Test Procedures

### VAL-DS-001: Sick State Entry
**Steps:**
1. Open app (fresh state, all stats = 80)
2. Via console: `window.__gameLoop.stats.hunger = 1`
3. Wait one tick (10 seconds) — hunger drops to 0

**Expected:**
- State transitions from Normal to Sick
- State badge changes to red "SICK" with pulse animation
- Pet sprite gets green tint overlay
- Thermometer 🌡️ appears near pet
- `'state:changed'` event fires with `{ from: 'normal', to: 'sick' }`
- Speech bubble: "I don't feel so good... 🤒"

---

### VAL-DS-002: Sick State Double Decay
**Steps:**
1. Enter Sick state (from VAL-DS-001)
2. Note current happiness value
3. Wait one tick (10 seconds)

**Expected:**
- Happiness decreases by 2 (not 1) — sick 2× multiplier
- Energy also decreases by 2
- Hunger stays at 0 (already at floor)

---

### VAL-DS-003: Sick State Half Action Effectiveness
**Steps:**
1. Enter Sick state
2. Note current hunger value (should be 0)
3. Click Feed button

**Expected:**
- Hunger increases by 10 (not 20) — sick 0.5× multiplier, `Math.floor(20 * 0.5) = 10`
- Happiness increases by 2 (not 5) — `Math.floor(5 * 0.5) = 2`

---

### VAL-DS-004: Sick State Recovery (Recovery Path)
**Steps:**
1. Enter Sick state
2. Use Feed/Play/Rest repeatedly until all stats are above 20

**Expected:**
- State transitions from Sick to Normal
- Green tint overlay removes
- State badge changes to green "NORMAL"
- Thermometer disappears
- Decay rate returns to 1 per tick
- Speech bubble: "Phew! I feel better now! 😮‍💨"

---

### VAL-DS-005: Sick Recovery Requires ALL Stats > 20
**Steps:**
1. Enter Sick state (hunger = 0, happiness = 60, energy = 60)
2. Feed ChuChu until hunger = 25 (well above 20)
3. Check state

**Expected:**
- If all three stats are above 20 → recovers to Normal
- If any stat is still ≤ 20 → remains Sick

---

### VAL-DS-006: Evolved State (via Console)
**Steps:**
1. Via console: `window.__gameLoop.triggerEvolution('baby', 'evolved')`
2. Observe for 10 seconds

**Expected:**
- State transitions to Evolved
- Golden glow effects appear on pet
- Stats are frozen (no decay during 10 seconds)
- Action buttons are disabled (grayed out, not clickable)
- State badge shows gold "EVOLVED" with glow
- After 10 seconds: state transitions to Normal, stats resume decaying
- Stage badge updates to "🌟 Evolved Puppy"

---

### VAL-DS-007: Actions Blocked During Evolution
**Steps:**
1. Trigger Evolved state (from VAL-DS-006)
2. Attempt to click Feed, Play, and Rest buttons

**Expected:**
- No stat changes occur
- No action animations play
- Buttons appear visually disabled (opacity 0.45, cursor not-allowed)

---

### VAL-DS-008: State Priority — Evolved Over Sick
**Steps:**
1. Set hunger = 0 (normally triggers Sick)
2. Simultaneously trigger evolution via console

**Expected:**
- Evolved state takes priority over Sick
- Stats freeze at current values during evolution
- After evolution completes, if hunger is still 0, enters Sick state

---

## Console Test Commands

```javascript
// Quick sick test
window.__gameLoop.stats.hunger = 0;
window.__gameLoop.tick(); // Should enter Sick

// Quick recovery test (while sick)
window.__gameLoop.stats.hunger = 25;
window.__gameLoop.stats.happiness = 25;
window.__gameLoop.stats.energy = 25;
window.__gameLoop.tick(); // Should recover to Normal

// Quick evolution test
window.__gameLoop.triggerEvolution('baby', 'evolved');
// Wait 10 seconds → returns to Normal with Evolved Puppy stage

// Verify decay multiplier
console.log(window.__gameLoop.stateMachine.getDecayMultiplier('normal'));  // 1
console.log(window.__gameLoop.stateMachine.getDecayMultiplier('sick'));    // 2
console.log(window.__gameLoop.stateMachine.getDecayMultiplier('evolved')); // 0

// Verify action multiplier
console.log(window.__gameLoop.stateMachine.getActionMultiplier('normal'));  // 1
console.log(window.__gameLoop.stateMachine.getActionMultiplier('sick'));    // 0.5
console.log(window.__gameLoop.stateMachine.getActionMultiplier('evolved')); // 0
```

## Automated Test Coverage

The following tests are covered by the automated test suite in `tests/test-suite.js`:
- T-DS-001: Sick state decay multiplier = 2
- T-DS-002: Sick state action multiplier = 0.5
- T-DS-003: Evolved state decay multiplier = 0
- T-DS-004: Evolved state action multiplier = 0
- T-DS-005: Normal state decay multiplier = 1
- T-DS-006: Sick state entry when stat = 0
- T-DS-007: Sick state recovery when all stats > 20
- T-DS-008: canAct() returns true for Normal and Sick
- T-DS-009: canAct() returns false for Evolved

## Pass Criteria

- [ ] Sick state triggers when any stat reaches 0
- [ ] Sick state applies 2× decay multiplier
- [ ] Sick state halves action effectiveness (rounded down)
- [ ] Sick state recovers when ALL stats > 20 (recovery path)
- [ ] Evolved state freezes all stats for 10 seconds
- [ ] Evolved state blocks all actions
- [ ] State badges update with correct colors
- [ ] Visual overlays render for each state (green tint + thermometer for Sick, glow for Evolved)
- [ ] Evolved takes priority over Sick
- [ ] Automated test suite passes for all state machine functions
