# Feature: Persistence — Validation

## Test Procedures

### VAL-PE-001: Fresh Load (No Save)
**Steps:**
1. Clear localStorage: `localStorage.removeItem('chuchu_save')`
2. Reload the page

**Expected:**
- All stats initialize to 80
- Stage is "Baby Puppy"
- State is Normal
- Active time is 0:00
- No welcome message

---

### VAL-PE-002: Save and Restore
**Steps:**
1. Open app (fresh state)
2. Click Feed a few times (change stats from default)
3. Wait 30 seconds (auto-save triggers)
4. Note current stat values
5. Reload the page

**Expected:**
- Stats are restored to approximately the values from step 4
- Stats may be slightly lower due to offline decay during the brief reload time (~1-2 seconds)
- Stage is preserved
- Active time is preserved

---

### VAL-PE-003: Offline Decay — Short Absence
**Steps:**
1. Open app, let stats settle (e.g., hunger = 70, happiness = 65, energy = 60)
2. Close the tab
3. Wait 30 seconds
4. Reopen the app

**Expected:**
- Stats are ~3 points lower than when saved (30 seconds ÷ 10 seconds/tick = 3 ticks of decay)
- Welcome message: "You're back! I barely noticed you were gone! 😊"

---

### VAL-PE-004: Offline Decay — Medium Absence
**Steps:**
1. Open app, note stats
2. Close the tab
3. Wait 5 minutes (300 seconds)
4. Reopen the app

**Expected:**
- Stats reduced by ~30 points (300 ÷ 10 = 30 ticks)
- If any stat was below 30, it should be at 0 → Sick state on load
- Welcome message reflects medium absence

---

### VAL-PE-005: Offline Decay — Cap
**Steps:**
1. Open app, note stats (all = 80)
2. Close the tab
3. Wait 20+ minutes (1200+ seconds)
4. Reopen the app

**Expected:**
- Decay capped at 100 points (not 120+)
- All stats at 0 (80 - 100 = 0, clamped)
- ChuChu loads in Sick state
- Welcome message: "I waited and waited... I'm so hungry... 😢"

---

### VAL-PE-006: Evolution State Persists
**Steps:**
1. Play until ChuChu evolves to Evolved Puppy
2. Close the tab
3. Reopen the tab

**Expected:**
- ChuChu is still Evolved Puppy (not Baby)
- Care history is preserved
- Active time is preserved (no offline increment)

---

### VAL-PE-007: No Offline Evolution
**Steps:**
1. Set ChuChu to Baby stage with 2:50 active time (10 seconds from evolution)
2. Save and close the tab
3. Wait 2 minutes
4. Reopen

**Expected:**
- Active time is still ~2:50 (NOT 4:50)
- ChuChu has NOT evolved to Evolved Puppy
- Active time resumes counting from saved value

---

### VAL-PE-008: Reset Button
**Steps:**
1. Play for a while (change stats, evolve, etc.)
2. Click "🔄 Reset" button

**Expected:**
- Confirmation modal appears with warning text
- "Cancel" closes modal, no changes
- "Yes, Reset" clears save data and reloads page
- After reset: all stats = 80, Baby Puppy, 0:00 active time

---

### VAL-PE-009: Reset Confirmation — Cancel
**Steps:**
1. Click "🔄 Reset"
2. Click "Cancel"

**Expected:**
- Modal closes
- Game continues unchanged
- Save data is intact

---

### VAL-PE-010: Corrupted Save Data
**Steps:**
1. Set corrupted data: `localStorage.setItem('chuchu_save', 'not json')`
2. Reload page

**Expected:**
- App starts fresh (stats = 80, Baby Puppy)
- Console shows a warning about corrupted save data
- No crash or error screen

---

### VAL-PE-011: Missing Fields in Save
**Steps:**
1. Set partial data: `localStorage.setItem('chuchu_save', '{"version":1}')`
2. Reload page

**Expected:**
- App starts fresh (stats = 80, Baby Puppy)
- Console shows a warning about invalid save data

---

### VAL-PE-012: Save on Tab Switch
**Steps:**
1. Open app, change some stats
2. Switch to a different browser tab (do NOT close the app tab)
3. Inspect localStorage in DevTools on the same original tab

**Expected:**
- `localStorage` contains updated save data (saved on visibilitychange)

---

### VAL-PE-013: Save Before Close
**Steps:**
1. Open app, make changes
2. Open DevTools → Application → Local Storage before closing
3. Close the tab (or navigate away)
4. Open a new tab and check localStorage

**Expected:**
- Save data reflects the state just before the tab was closed

---

## Console Test Commands

```javascript
// Check current save data
console.log(JSON.parse(localStorage.getItem('chuchu_save')));

// Simulate 5-minute absence
const save = JSON.parse(localStorage.getItem('chuchu_save'));
save.timestamp = Date.now() - (5 * 60 * 1000);
localStorage.setItem('chuchu_save', JSON.stringify(save));
location.reload();

// Clear save for fresh start
localStorage.removeItem('chuchu_save');
location.reload();
```

## Pass Criteria

- [ ] Auto-save triggers every 30 seconds
- [ ] Save triggers on beforeunload (tab close)
- [ ] Save triggers on visibilitychange (tab switch)
- [ ] Load restores stats, state, stage, and evolution data
- [ ] Offline decay: 1 point per 10 seconds elapsed
- [ ] Offline decay capped at 100 points
- [ ] Sick state triggered if offline decay drops stat to 0
- [ ] Active time does NOT accumulate offline
- [ ] Welcome back message appears based on elapsed time
- [ ] Reset button shows confirmation modal
- [ ] Reset clears localStorage and reloads to fresh state
- [ ] Corrupted save data → graceful fresh start (no crash)
- [ ] Schema version mismatch → graceful fresh start
- [ ] Save data is < 2KB
