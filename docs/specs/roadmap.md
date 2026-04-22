# ChuChu — Tiny Tamagotchi MVP: Roadmap

## Roadmap Philosophy

Features are sequenced by **dependency order** — each feature builds on the previous one. The stat engine must exist before actions can modify stats, states depend on stat values, evolution depends on state tracking, and Easter eggs depend on the full interaction surface.

Each feature is a self-contained development cycle: spec → implement → validate → commit.

---

## Phase 1: Foundation (Core Loop)

The minimum viable interaction loop — ChuChu exists, has stats, and the player can act.

### Feature 1: Living Vitals
**Priority:** P0 (Blocks everything)
**Estimated effort:** Small
**Dependencies:** None

Create the real-time stat engine that drives ChuChu's need for care. Three meters (Hunger, Happiness, Energy) tick down automatically at a configurable rate. The UI displays these as animated progress bars with color transitions (green → yellow → red).

**Delivers:**
- Game loop with `setInterval` tick (default: every 10 seconds)
- Three stat values clamped to 0–100
- Animated stat bars with gradient color coding
- ChuChu idle sprite on screen (CSS-drawn breathing animation)
- Basic page layout: pet area + stat display

**Acceptance:** Stats visibly decrement over time. Bars change color as values drop.

---

### Feature 2: Care Loop
**Priority:** P0 (Blocks state system)
**Dependencies:** Living Vitals

Add the three care actions that let the player interact with ChuChu. Each action modifies stats with primary and secondary effects, has a 3-second cooldown, and triggers a distinct animation.

**Delivers:**
- Feed button: Hunger +20, Happiness +5
- Play button: Happiness +20, Energy −10, Hunger −5
- Rest button: Energy +25, Happiness −5
- 3-second cooldown per action with circular progress indicator
- Action animations (chomp, bounce, curl up)
- Stat clamping (0–100 enforced after every action)

**Acceptance:** Player can sustain ChuChu indefinitely by using all three actions in rotation.

---

## Phase 2: State & Progression

ChuChu reacts to its condition and grows over time.

### Feature 3: Dynamic States
**Priority:** P0 (Core requirement)
**Dependencies:** Living Vitals, Care Loop

Implement the state machine that governs ChuChu's condition. Three states (Normal, Sick, Evolved) with distinct visual feedback and mechanical consequences.

**Delivers:**
- State machine with clean transitions per the spec
- Sick state: triggered when any stat hits 0, 2× decay, half action effectiveness, visual overlay
- Evolved state: 10-second invulnerability window with sparkle effects
- 1 recovery path: Sick → Normal when all stats > 20
- State indicator badge on the UI
- Smooth visual transitions between states

**Acceptance:** All state transitions fire correctly. Sick state is escapable by bringing all stats above 20. Evolved state auto-resolves after 10 seconds.

---

### Feature 4: Evolution System
**Priority:** P1 (Key differentiator)
**Dependencies:** Dynamic States

Implement the single-step evolution system. Track care quality as a rolling average and trigger the Baby → Evolved transition when criteria are met.

**Delivers:**
- Care quality scoring: `(hunger + happiness + energy) / 3` sampled every 30 seconds, rolling window of 20 samples
- Active time tracker (only counts when tab is focused)
- Baby → Evolved Puppy at 3 minutes active time, quality ≥ 50%
- Evolution animation sequence (glow → transform → sparkle burst)
- Different CSS visual for Evolved Puppy (golden fur, larger, sparkle ✨, heart eyes ♥)
- Stage indicator in the UI

**Acceptance:** Evolved Puppy is reachable with sustained good care. Timing is based on active tab time, not wall clock. Evolution is permanent.

---

## Phase 3: Polish & Delight

Personality, persistence, and the details that earn recognition.

### Feature 5: Personal Touches
**Priority:** P1 (Challenge requirement)
**Dependencies:** Care Loop, Dynamic States, Evolution System

Add the Easter eggs, mood dialogue, and personality animations that make ChuChu feel alive beyond just the numbers.

**Delivers:**
- Nose boop (click → sneeze)
- Dizzy spin (10+ rapid clicks → spiral eyes)
- Secret idle dance (60s idle + all stats > 60)
- Weekend party hat (Saturday/Sunday detection)
- Konami code (↑↑↓↓←→←→BA → rainbow costume)
- Mood-based speech bubbles with personality-driven text

**Acceptance:** All 6 Easter eggs trigger correctly and have visual responses. Speech bubbles appear reactively based on stat thresholds.

---

### Feature 6: Persistence
**Priority:** P1 (Required for real use)
**Dependencies:** All previous features

Save ChuChu's complete state to `localStorage` and restore it on page load, including compensation for time elapsed while the tab was closed.

**Delivers:**
- Auto-save every 30 seconds and on page unload (`beforeunload`)
- Save payload: all stats, current stage, care quality history, evolution state, active time, last save timestamp
- Load on startup: restore state + calculate elapsed time since last save
- Offline decay: apply `elapsed_seconds / 10` stat decrement (capped at 100 points max)
- If offline decay triggers Sick state, load into Sick state
- "Welcome back!" dialogue with ChuChu commenting on how long you were gone
- Reset button to start fresh (with confirmation modal)

**Acceptance:** Close tab, wait 30 seconds, reopen — stats have decayed by ~3 points. Evolution stage is preserved. Care quality history is preserved.

---

## Milestone Summary

| Milestone | Features | Player Experience |
|-----------|----------|-------------------|
| **M1: It Lives** | Living Vitals | ChuChu appears, stats tick down. No interaction yet. |
| **M2: It Responds** | + Care Loop | Player can feed, play, rest. ChuChu survives with care. |
| **M3: It Reacts** | + Dynamic States | ChuChu gets sick, shows condition. Recovery path works. |
| **M4: It Grows** | + Evolution System | ChuChu evolves from Baby to Evolved Puppy. |
| **M5: It Surprises** | + Personal Touches | Easter eggs, dialogue, personality depth. |
| **M6: It Remembers** | + Persistence | ChuChu persists across sessions. Complete MVP. |

---

## Post-MVP Backlog (Not in scope)

These items are documented for future consideration but will NOT be implemented in the MVP:

1. **Sound effects** — bark, munch, snore, evolution jingle
2. **Multiple pets** — pet selection screen, different species
3. **Mini-games** — structured play activities (fetch, tug-of-war)
4. **Achievements** — trophy system, milestones
5. **Settings panel** — decay rate adjustment, theme toggle
6. **Cloud sync** — server-backed persistence
7. **Sharing** — screenshot export, social media sharing
8. **Day/night cycle** — time-of-day affects ChuChu's behavior
