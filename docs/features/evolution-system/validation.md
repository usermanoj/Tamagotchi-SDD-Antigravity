# Feature: Evolution System — Validation

## Test Procedures

### VAL-EV-001: Care Quality Calculation
**Steps:**
1. Open app (fresh state, all stats = 80)
2. Wait 30 seconds (first sample taken)
3. Check footer care quality display

**Expected:**
- Footer shows `Care: 80%`
- First care quality sample = `Math.round((80 + 80 + 80) / 3) = 80`

---

### VAL-EV-002: Active Time Tracking
**Steps:**
1. Open app
2. Keep tab focused for 60 seconds
3. Check footer active time

**Expected:**
- Footer shows approximately `Active: 1:00`

---

### VAL-EV-003: Active Time Pauses on Tab Switch
**Steps:**
1. Open app, note active time
2. Switch to a different tab for 30 seconds
3. Switch back
4. Check active time

**Expected:**
- Active time has NOT increased during the 30 seconds the tab was hidden
- Active time resumes counting after switching back

---

### VAL-EV-004: Baby to Evolved Puppy Evolution (Good Care)
**Steps:**
1. Open app (fresh state)
2. Maintain all stats above 50 by using Feed/Play/Rest rotation
3. Play for 3+ minutes of active time

**Expected:**
- At ~3 minutes with care quality ≥ 50%: evolution triggers
- State changes to Evolved
- 10-second glow/sparkle animation plays
- Stage badge changes from "🐶 Baby Puppy" to "🌟 Evolved Puppy"
- Pet CSS changes to Evolved Puppy appearance (golden fur, larger, sparkles)
- Speech bubble: "Whoa! I feel so different! Look at me!! 🌟"
- After 10 seconds: state returns to Normal, Evolved Puppy form is permanent

---

### VAL-EV-005: No Evolution While Sick
**Steps:**
1. Set up conditions near evolution (active time ~2:55, quality > 50)
2. Force Sick state: `window.__gameLoop.stats.hunger = 0`
3. Wait past the 3-minute mark

**Expected:**
- Evolution does NOT trigger while Sick
- Once player recovers to Normal (all stats > 20), evolution triggers if conditions still met

---

### VAL-EV-006: Final Form Permanence
**Steps:**
1. Reach Evolved Puppy
2. Continue playing for several more minutes

**Expected:**
- No further evolution events
- Stage remains "🌟 Evolved Puppy" permanently
- Care quality continues to display but has no further evolution effect

---

### VAL-EV-007: No Evolution with Low Care Quality
**Steps:**
1. Open app, intentionally let stats decay (don't interact much)
2. Wait 3+ minutes of active time

**Expected:**
- If care quality < 50%: evolution does NOT trigger
- Improve care quality by feeding/playing → once quality ≥ 50% and time ≥ 3 min → triggers

**Shortcut for testing:**
```javascript
// Fast-forward active time to near evolution
window.__evolutionTracker.activeTime = 175; // 5 seconds from threshold
// Check care quality
console.log(window.__evolutionTracker.getCareQuality());
// If quality ≥ 50, evolution triggers in ~5 seconds
```

---

### VAL-EV-008: Care Quality Rolling Window
**Steps:**
1. Open app, maintain high stats for 5 minutes (10 samples, all ~80)
2. Let stats drop drastically for 5 minutes (10 samples, all ~20)
3. Check care quality

**Expected:**
- After step 1: care quality ≈ 80%
- After step 2: care quality ≈ 50% (average of 10 high + 10 low samples)
- Once buffer fills with 20 low samples: quality ≈ 20%

---

## Console Test Commands

```javascript
// Check current evolution state
console.log(window.__evolutionTracker.stage);         // 'baby' or 'evolved'
console.log(window.__evolutionTracker.getActiveTime()); // seconds
console.log(window.__evolutionTracker.getCareQuality()); // 0-100

// Fast-forward to near evolution
window.__evolutionTracker.activeTime = 175; // 5s from trigger
// Then wait 5 seconds with good stats

// Force immediate evolution (manual trigger)
window.__gameLoop.triggerEvolution('baby', 'evolved');

// Check if evolution has been reached
console.log(window.__evolutionTracker.hasEvolved); // true/false
```

## Automated Test Coverage

The following tests are covered by the automated test suite in `tests/test-suite.js`:
- T-EV-001: Care quality calculation with known inputs
- T-EV-002: Rolling buffer respects max size (20 samples)
- T-EV-003: Evolution check returns 'evolved' when conditions met
- T-EV-004: Evolution check returns null when time insufficient
- T-EV-005: Evolution check returns null when quality insufficient
- T-EV-006: Evolution check returns null when already evolved
- T-EV-007: Evolution check returns null when Sick

## Pass Criteria

- [ ] Care quality samples taken every 30 seconds
- [ ] Care quality displays correctly in footer
- [ ] Active time tracks only while tab is visible
- [ ] Active time displays correctly in footer (M:SS format)
- [ ] Baby → Evolved at 3 min + quality ≥ 50%
- [ ] Evolution triggers 10-second Evolved state
- [ ] Evolution animation plays with golden glow/sparkle effects
- [ ] Pet CSS changes to Evolved Puppy appearance
- [ ] No evolution during Sick state
- [ ] Evolved Puppy form is permanent (no regression)
- [ ] Evolution state serializable for persistence
- [ ] Automated test suite passes for all evolution logic
