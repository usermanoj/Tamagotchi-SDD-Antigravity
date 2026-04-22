# Feature: Care Loop — Validation

## Test Procedures

### VAL-CL-001: Feed Action Effects
**Steps:**
1. Open app (fresh state, all stats = 80)
2. Click Feed button

**Expected:**
- Hunger changes from 80 → 100 (80 + 20, clamped at 100)
- Happiness changes from 80 → 85 (80 + 5)
- Energy remains 80
- Hunger bar flashes green
- Happiness bar flashes green
- Pet plays eating animation

---

### VAL-CL-002: Play Action Effects
**Steps:**
1. Open app (fresh state, all stats = 80)
2. Click Play button

**Expected:**
- Happiness changes from 80 → 100 (80 + 20, clamped at 100)
- Energy changes from 80 → 70 (80 − 10)
- Hunger changes from 80 → 75 (80 − 5)
- Happiness bar flashes green
- Energy bar flashes red
- Hunger bar flashes red
- Pet plays bouncing animation

---

### VAL-CL-003: Rest Action Effects
**Steps:**
1. Open app (fresh state, all stats = 80)
2. Click Rest button

**Expected:**
- Energy changes from 80 → 100 (80 + 25, clamped at 100)
- Happiness changes from 80 → 75 (80 − 5)
- Hunger remains 80
- Energy bar flashes green
- Happiness bar flashes red
- Pet plays resting animation

---

### VAL-CL-004: Cooldown Enforcement
**Steps:**
1. Click Feed button
2. Immediately click Feed button again (within 3 seconds)
3. Wait 3 seconds
4. Click Feed button again

**Expected:**
- First click: action applies, cooldown ring animation starts
- Second click (during cooldown): no effect, stats don't change
- After 3 seconds: button re-enables with pop animation
- Third click: action applies normally

---

### VAL-CL-005: Independent Cooldowns
**Steps:**
1. Click Feed button
2. Immediately click Play button
3. Immediately click Rest button

**Expected:**
- All three actions apply (they have independent cooldowns)
- All three buttons show cooldown rings simultaneously
- Stats reflect all three actions combined:
  - Hunger: 80 + 20 − 5 + 0 = 95
  - Happiness: 80 + 5 + 20 − 5 = 100 (clamped)
  - Energy: 80 + 0 − 10 + 25 = 95

---

### VAL-CL-006: Stat Clamping at Maximum
**Steps:**
1. Open app (fresh state, hunger = 80)
2. Click Feed (hunger → 100)
3. Wait for cooldown
4. Click Feed again

**Expected:**
- Hunger stays at 100 (clamped, does not exceed)
- Action still triggers animation and cooldown

---

### VAL-CL-007: Stat Clamping at Minimum
**Steps:**
1. Via console: set energy to 5
2. Click Play (energy −10)

**Expected:**
- Energy becomes 0 (not negative)
- Play animation still triggers

---

### VAL-CL-008: Sustained Play
**Steps:**
1. Open app (fresh state)
2. Over 2 minutes, rotate actions: Feed → Play → Rest → (repeat)
3. Monitor stat values

**Expected:**
- ChuChu's stats remain above 40 throughout
- The player can sustain ChuChu indefinitely with rotation
- No stat reaches 0 with active play

---

### VAL-CL-009: Keyboard Accessibility
**Steps:**
1. Tab to the Feed button
2. Press Enter
3. Tab to Play button
4. Press Space

**Expected:**
- Feed action triggers on Enter
- Play action triggers on Space
- Both buttons are keyboard-focusable with visible focus ring

---

## Pass Criteria

- [ ] Feed increases Hunger +20 and Happiness +5
- [ ] Play increases Happiness +20, decreases Energy −10 and Hunger −5
- [ ] Rest increases Energy +25, decreases Happiness −5
- [ ] Each action has a 3-second per-action cooldown
- [ ] Cooldown is visual (ring animation) and functional (blocks re-click)
- [ ] Stats clamp to [0, 100] after any action
- [ ] Pet plays distinct animations for each action
- [ ] Stat bars flash green (+) or red (−) on change
- [ ] Buttons are keyboard accessible
- [ ] Player can sustain ChuChu with action rotation
