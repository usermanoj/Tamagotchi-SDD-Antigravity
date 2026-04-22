# Feature: Personal Touches — Validation

## Test Procedures

### VAL-PT-001: Nose Boop
**Steps:**
1. Open app
2. Click precisely on ChuChu's nose area (center of the sprite, slightly below middle)

**Expected:**
- ChuChu's head tilts back
- Small white particle burst from nose area
- Speech bubble: "Achoo! 🤧"
- Brief shake animation on pet container
- Bubble disappears after ~2 seconds

---

### VAL-PT-002: Nose Boop Miss
**Steps:**
1. Click on ChuChu's ear or body (outside nose zone)

**Expected:**
- No sneeze animation
- Normal click behavior (counts toward rapid-click tracking)

---

### VAL-PT-003: Dizzy Spin
**Steps:**
1. Click rapidly on ChuChu 10+ times within 3 seconds

**Expected:**
- ChuChu's eyes change to dizzy spirals
- Stars orbit ChuChu's head
- ChuChu wobbles side to side
- Speech bubble: "Woah... everything is spinning! 😵‍💫"
- Effect lasts 3 seconds, then normalizes

---

### VAL-PT-004: Dizzy Spin — Not Enough Clicks
**Steps:**
1. Click ChuChu 8 times within 3 seconds (under threshold)

**Expected:**
- No dizzy effect
- Normal behavior

---

### VAL-PT-005: Secret Idle Dance
**Steps:**
1. Open app, ensure all stats > 60
2. Do not interact with the app for 60+ seconds
3. Watch ChuChu

**Expected:**
- ChuChu begins bouncing rhythmically
- Music notes (🎵🎶) float upward
- Dance lasts ~5 seconds

---

### VAL-PT-006: Idle Dance Interruption
**Steps:**
1. Trigger the idle dance (from VAL-PT-005)
2. Click ChuChu during the dance

**Expected:**
- Dance stops immediately
- Speech bubble: "Oh! You saw that?! 😳"

---

### VAL-PT-007: No Idle Dance with Low Stats
**Steps:**
1. Let stats drop below 60
2. Wait 60+ seconds without interaction

**Expected:**
- No dance triggers (stats too low)
- Normal idle behavior

---

### VAL-PT-008: Weekend Party Hat
**Steps:**
1. Open app on a Saturday or Sunday
   (Or simulate: in console, mock `Date` to return day 6 or 0)

**Expected:**
- Party hat appears on ChuChu's head
- Confetti particles drift in background
- Speech bubble: "It's the weekend! Party time! 🎉" (first load only)

---

### VAL-PT-009: No Party Hat on Weekday
**Steps:**
1. Open app on a weekday (Monday-Friday)

**Expected:**
- No party hat
- No confetti

---

### VAL-PT-010: Konami Code
**Steps:**
1. Press keys in order: ↑ ↑ ↓ ↓ ← → ← → B A

**Expected:**
- Brief screen flash (white overlay)
- ChuChu cycles through rainbow colors
- Rainbow sparkle trail appears
- Speech bubble: "I feel FABULOUS! 🌈✨"
- Effect lasts 30 seconds then fades

---

### VAL-PT-011: Konami Code — Wrong Key Resets
**Steps:**
1. Press: ↑ ↑ ↓ ↓ ← → X (wrong key)
2. Then press: ↑ ↑ ↓ ↓ ← → ← → B A

**Expected:**
- No effect from the first incomplete attempt (X resets the buffer)
- The second complete sequence triggers the rainbow effect

---

### VAL-PT-012: Mood Dialogue — High Hunger
**Steps:**
1. Set hunger to 30 via console
2. Click Feed (hunger goes to 50 → then above 80 if fed twice)
3. Or: set hunger to 85, then feed → hunger = 100

**Expected:**
- Speech bubble: "Burp! That was yummy! 🍖"
- Bubble appears for 3 seconds

---

### VAL-PT-013: Mood Dialogue — Low Happiness
**Steps:**
1. Let happiness drop below 20

**Expected:**
- Speech bubble: "Do you still like me...? 😢"

---

### VAL-PT-014: Dialogue Cooldown
**Steps:**
1. Trigger a mood dialogue (e.g., low hunger)
2. Immediately trigger another condition (e.g., low energy)

**Expected:**
- Only the first dialogue shows
- Second dialogue is suppressed (30-second cooldown)
- After 30 seconds, the next matching condition's dialogue shows

---

### VAL-PT-015: Easter Egg Bypasses Cooldown
**Steps:**
1. Trigger a mood dialogue
2. Immediately do a nose boop

**Expected:**
- Nose boop dialogue ("Achoo!") replaces the mood dialogue
- Easter egg dialogues ignore the 30-second cooldown

---

## Pass Criteria

- [ ] Nose boop triggers sneeze animation when clicking nose zone
- [ ] Nose boop does NOT trigger when clicking outside nose zone
- [ ] Dizzy spin triggers at 10+ clicks in 3 seconds
- [ ] Dizzy effect lasts 3 seconds then auto-resolves
- [ ] Idle dance triggers after 60s idle + all stats > 60
- [ ] Idle dance stops if player clicks, with embarrassed dialogue
- [ ] Party hat appears on Saturday/Sunday
- [ ] Konami code triggers rainbow effect for 30 seconds
- [ ] Wrong key resets Konami code sequence
- [ ] Mood dialogue triggers based on stat thresholds
- [ ] Dialogue has 30-second cooldown between mood lines
- [ ] Easter egg dialogue bypasses mood cooldown
- [ ] Only one speech bubble shows at a time
- [ ] All dialogue is accessible (aria-live)
