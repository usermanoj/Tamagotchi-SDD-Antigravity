# ChuChu — Tiny Tamagotchi MVP: Mission

## Overview

**ChuChu** is a browser-based virtual pet web application that simulates the care and growth of a digital puppy companion. Players nurture ChuChu through feeding, playing, and resting — watching it grow from a Baby Puppy into an Evolved Puppy, with evolution gated by sustained care quality.

The application runs entirely in the browser with no server dependencies. State persists across sessions via `localStorage`, and the pet's vitals decay in real time to create a continuous sense of responsibility and emotional attachment.

ChuChu is built as an exercise in **Spec-Driven Development (SDD)** — every feature is specified before implementation, and the specification documents serve as the project's primary engineering artifact.

## Motivation

The Tamagotchi concept — a digital creature that needs ongoing care — remains one of the most effective demonstrations of real-time state management, event-driven UI, and emergent personality in a small-scope application. ChuChu modernizes this concept with:

- **Modern cartoon aesthetics** — CSS-drawn pet art with smooth animations, soft gradients, and playful micro-animations instead of pixel art
- **Meaningful evolution** — the player's sustained care quality gates evolution, creating a tangible goal beyond immediate survival
- **Personality depth** — Easter eggs, quirky reactions, and mood-based dialogue transform ChuChu from a stat dashboard into a character that feels alive

Three specific design goals:

1. **Emotional engagement.** When the player opens the tab and sees ChuChu wagging its tail or looking hungry, they should feel compelled to interact. The UI must communicate state through animation and expression, not just numbers.
2. **Meaningful progression.** The evolution system (Baby → Evolved) creates a narrative arc. A well-cared-for ChuChu transforms into a radiant, sparkly Evolved Puppy. The player's sustained effort is visibly rewarded.
3. **Discoverable personality.** Easter eggs (nose boops, Konami code, rare idle animations) reward curiosity and make the pet feel hand-crafted rather than procedurally generated.

## The Pet: ChuChu

**Species:** Puppy (cute and innocent)

**Personality traits:**
- Playful and bouncy when happy
- Droopy-eared and whimpery when sad or hungry
- Sleepy and slow-blinking when tired
- Dizzy and tongue-out when overstimulated (rapid clicking Easter egg)

**Evolution path:**

```
          ┌─────────────────────┐
          │     BABY PUPPY      │
          │  (round, floppy,    │
          │   big-eyed)         │
          └──────────┬──────────┘
                     │
              active time ≥ 3 min
              AND care quality ≥ 50%
              AND state = Normal
                     │
          ┌──────────▼──────────┐
          │   EVOLVED PUPPY     │
          │  (radiant golden,   │
          │   sparkly, larger,  │
          │   heart eyes)       │
          └─────────────────────┘
```

**Visual identity:** Modern cartoon style — CSS-drawn shapes, soft shading, expressive eyes, smooth animation transitions. No external images needed. Think Duolingo owl meets Neko Atsume aesthetic.

## Core Mechanics

### Living Vitals

Three meters define ChuChu's wellbeing:

| Stat | Range | Decay Rate | Effect When Low | Effect When Zero |
|------|-------|-----------|-----------------|------------------|
| **Hunger** | 0–100 | −1 every 10 seconds | ChuChu drools, stomach growls | Triggers Sick state |
| **Happiness** | 0–100 | −1 every 10 seconds | Ears droop, tail stops wagging | Triggers Sick state |
| **Energy** | 0–100 | −1 every 10 seconds | Eyes half-closed, yawns | Triggers Sick state |

All stats start at 80 on first launch. Stats are clamped to the 0–100 range.

### The Care Loop

Three actions replenish stats:

| Action | Primary Effect | Secondary Effect | Cooldown | Animation |
|--------|---------------|-------------------|----------|-----------|
| **Feed** 🍖 | Hunger +20 | Happiness +5 | 3 seconds | ChuChu chomps, mouth opens, tail wags |
| **Play** 🎾 | Happiness +20 | Energy −10, Hunger −5 | 3 seconds | ChuChu bounces up and down |
| **Rest** 💤 | Energy +25 | Happiness −5 | 3 seconds | ChuChu curls up, eyes close briefly |

**Cooldown rationale:** 3-second cooldowns prevent stat-spamming while keeping the interaction loop snappy for demos. During cooldown, the button is visually disabled with a circular progress indicator.

### Dynamic States

ChuChu exists in one of three mutually exclusive states:

| State | Trigger | Visual Change | Mechanical Change |
|-------|---------|---------------|-------------------|
| **Normal** | Default state; all stats > 0 | Standard idle animations | All actions available at 100% effectiveness |
| **Sick** 🤒 | Any stat hits 0 | Green-tinted face, thermometer, wobble | Stats decay 2× faster; actions work at 50% |
| **Evolved** ✨ | Evolution criteria met | Golden glow, sparkle burst | Stats frozen for 10 seconds (invulnerability) |

**State transitions:**
```
            Normal ──(any stat = 0)──→ Sick
              ↑                          │
              │                          │
        (all stats > 20)           (decay continues at 2×)
              │                          │
              ←──────────────────────────┘
                   Recovery Path

            Normal ──(evolution trigger)──→ Evolved (10s) → Normal (new stage)
```

**Edge cases:**
- If a player triggers evolution close to a stat hitting 0, the evolution check runs before the Sick check because Evolved state has highest priority.
- During the 10-second Evolved state, stats are frozen — no decay occurs, no actions can be performed. This prevents the player from "cheating" by stacking stats during invulnerability.
- Sick recovery requires ALL THREE stats above 20 simultaneously. The player cannot recover by raising just one stat.
- Actions during Sick state have 50% effectiveness (rounded down). Feed gives +10 hunger instead of +20.

### Evolution System

**Care Quality Score:** A rolling average calculated as `(hunger + happiness + energy) / 3` sampled every 30 seconds. The last 20 samples are kept (representing ~10 minutes of play). Care quality = average of all samples.

**Evolution trigger:**

| Transition | Requirement |
|-----------|-------------|
| Baby → Evolved | Active time ≥ 3 minutes AND care quality ≥ 50% AND state = Normal |

**Note:** "Active time" is cumulative time the tab is open and visible, not wall-clock time. This prevents a player from leaving the tab closed for 3 minutes and getting an evolution with decayed stats.

**Evolution is permanent.** Once ChuChu evolves, it stays in its Evolved Puppy form for the rest of the session (and persists across sessions).

### Personal Touches (Easter Eggs)

| Easter Egg | Trigger | Response |
|-----------|---------|----------|
| **Nose Boop** | Click ChuChu's nose area | ChuChu sneezes — "Achoo!" with small particle burst |
| **Dizzy Spin** | Click ChuChu 10+ times in 3 seconds | ChuChu gets dizzy — spiral eyes, wobbles, stars circling head |
| **Secret Dance** | Leave ChuChu idle for 60 seconds with all stats > 60 | ChuChu does a rare happy dance with music notes |
| **Weekend Party** | Open app on Saturday or Sunday | ChuChu wears a tiny party hat |
| **Konami Code** | ↑↑↓↓←→←→BA | ChuChu gets a rainbow-colored costume for 30 seconds |
| **Mood Dialogue** | Various stat thresholds | Speech bubble with personality-driven text (see table below) |

**Mood dialogue examples:**

| Condition | Dialogue |
|-----------|----------|
| Hunger > 80 (after feed) | "Burp! That was yummy! 🍖" |
| Hunger < 20 | "My tummy is making weird noises... 🥺" |
| Happiness > 90 | "I love you SO much!! 💕" |
| Happiness < 20 | "Do you still like me...? 😢" |
| Energy < 20 | "*yaaawn* Can we take a nap...? 😴" |
| All stats > 80 | "Today is the BEST day ever! ✨" |
| Just evolved | "Whoa! I feel so different! Look at me!! 🌟" |
| Entering Sick | "I don't feel so good... 🤒" |
| Recovering from Sick | "Phew! I feel better now! 😮‍💨" |

## Target Audience

- **Primary:** Participants in the DeepLearning.AI 7-Day Challenge evaluating SDD methodology
- **Secondary:** Casual web users looking for a 5-minute interactive diversion
- **Tertiary:** Developers studying SDD as a workflow pattern

## Constraints

### Required (per challenge scope)
- Pet: Named "ChuChu", 1 user, 1 evolution, 1 recovery path
- Stats (0–100): Hunger, Happiness, Energy
- Actions: Feed, Play, Rest
- States: Normal, Sick, Evolved

### Not Allowed (per challenge scope)
- Authentication and multiple users, multiple pets, inventories, or currencies
- Mini-games, social features, or notifications
- Admin features or complex evolutions
- Permanent death mechanics

## Scope

### MVP Delivers

- Real-time stat decay engine with configurable tick rate
- Three care actions (Feed, Play, Rest) with cooldowns and animations
- Three dynamic states (Normal, Sick, Evolved) with visual feedback
- 1 evolution: Baby Puppy → Evolved Puppy based on care quality
- 1 recovery path: Sick → Normal when all stats > 20
- 6 Easter eggs with distinct triggers and responses
- Mood-based dialogue system with reactive speech bubbles
- localStorage persistence with offline decay compensation
- Modern cartoon UI with smooth CSS animations (CSS-drawn puppy art, no external images)
- Single-page application, zero server dependencies
- Mobile-responsive layout

### Deferred (Post-MVP)

- **Sound effects / music** — adds complexity with audio loading, user preferences, autoplay restrictions
- **Multiple pet species** — would require a pet selection screen and multiplied art assets
- **Multiplayer / social** — visiting other pets, leaderboards
- **Mini-games** — structured play activities beyond the simple Play action
- **Achievements / badges** — requires a trophy system and additional UI
- **Settings panel** — difficulty modes, decay rate adjustment (currently hardcoded)
- **Backend / cloud sync** — would require a server, authentication, database

## User Flows

### Flow 1: First-Time Player
1. Player opens app → ChuChu appears as Baby Puppy, all stats = 80, state = Normal
2. Stats decay by 1 every 10 seconds → bars gradually decrease
3. Player clicks Feed → hunger +20, happiness +5, eating animation plays
4. Player rotates Feed/Play/Rest to maintain stats above 0
5. After 3 minutes of active play with care quality ≥ 50 → evolution triggers
6. 10-second evolution animation → Baby Puppy transforms to Evolved Puppy
7. Player continues caring for Evolved Puppy

### Flow 2: Neglect → Sick → Recovery
1. Player stops interacting → stats decay to 0 → enters Sick state
2. Thermometer appears, green tint, decay doubles to 2×/tick
3. Player uses Feed/Play/Rest at 50% effectiveness → slowly raises stats
4. All stats above 20 → recovers to Normal state → "Phew! I feel better now!"

### Flow 3: Returning Player
1. Player re-opens app after 5 minutes → offline decay applied (30 points)
2. Welcome back message appears → "I missed you! Did you bring snacks? 🥺"
3. If stats decayed to 0 → loads in Sick state → player must recover

## Success Metrics

| What We Measure | Success Threshold | Method |
|-----------------|-------------------|--------|
| **Spec completeness** | 100% of features have feature-plan, requirements, and validation docs | Filesystem check |
| **Spec-to-code fidelity** | Implementation matches spec on all specified behaviors | Manual validation against each validation.md |
| **Stat decay accuracy** | Vitals decrement by exactly 1 per tick interval (±50ms) | Console timer logs during testing |
| **State transitions** | All state transitions fire correctly per the state machine | Systematic trigger testing of all paths |
| **Evolution trigger** | Evolved Puppy reachable under specified conditions | Playthrough with sustained care |
| **Recovery path** | Sick → Normal recovery works via Feed/Play/Rest | Force Sick state, recover via actions |
| **Persistence** | Stats, stage, and care history survive refresh and restore correctly | Refresh at various states, verify restoration |
| **Easter egg coverage** | All 6 Easter eggs functional | Trigger each individually |
| **Mobile responsive** | Usable on 375px viewport (iPhone SE) through desktop | Browser DevTools responsive mode check |
| **Load time** | < 1 second first paint | Lighthouse performance audit |
| **Automated tests** | All test scripts pass without errors | Run test suite in browser console |

## File Structure

```
Tamagotchi/
├── docs/
│   ├── specs/
│   │   ├── mission.md              ← You are here
│   │   ├── roadmap.md
│   │   └── tech-stack.md
│   └── features/
│       ├── living-vitals/
│       │   ├── feature-plan.md
│       │   ├── requirements.md
│       │   └── validation.md
│       ├── care-loop/
│       │   ├── feature-plan.md
│       │   ├── requirements.md
│       │   └── validation.md
│       ├── dynamic-states/
│       │   ├── feature-plan.md
│       │   ├── requirements.md
│       │   └── validation.md
│       ├── evolution-system/
│       │   ├── feature-plan.md
│       │   ├── requirements.md
│       │   └── validation.md
│       ├── personal-touches/
│       │   ├── feature-plan.md
│       │   ├── requirements.md
│       │   └── validation.md
│       └── persistence/
│           ├── feature-plan.md
│           ├── requirements.md
│           └── validation.md
├── src/
│   ├── index.html
│   ├── main.js
│   ├── style.css
│   ├── config.js                   # All tunable constants
│   ├── engine/
│   │   ├── event-bus.js            # Pub/sub event system
│   │   ├── game-loop.js            # Main tick loop, stat decay, actions
│   │   ├── state-machine.js        # Normal/Sick/Evolved transitions
│   │   ├── evolution.js            # Care quality tracking, stage transitions
│   │   └── persistence.js          # localStorage save/load, offline decay
│   └── ui/
│       ├── pet-renderer.js         # ChuChu CSS art rendering
│       ├── stats-display.js        # Vital meter bars
│       ├── actions-panel.js        # Feed/Play/Rest buttons with cooldowns
│       ├── dialogue.js             # Speech bubble system
│       ├── easter-eggs.js          # Easter egg triggers and effects
│       └── footer.js               # Active time, care quality, reset
├── tests/
│   └── test-suite.js               # Automated test suite (runs in browser console)
├── package.json
└── vite.config.js
```

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| All three stats hit 0 simultaneously | Enters Sick state (any stat = 0 triggers Sick) |
| Feed while hunger is 95 | Hunger clamps to 100 (95 + 20 = 115 → clamped to 100) |
| Play while energy is 5 | Energy clamps to 0 (5 − 10 = −5 → clamped to 0); may trigger Sick |
| Spam-click same button | 3-second cooldown prevents double-fire; only first click applies |
| Tab backgrounded for 24 hours | Offline decay capped at 100 points; stats don't go below 0 |
| Corrupted localStorage | Graceful fresh start (all defaults); console warning |
| Evolution threshold met during Sick state | Evolution is blocked; fires once state returns to Normal |
| Browser doesn't support CSS nesting | Graceful degradation; all CSS is also valid without nesting |
| Stats at 21 during Sick | Still Sick (requires ALL stats > 20, not ≥ 20) |
| Stats exactly at 20 during Sick | Still Sick — recovery threshold is strictly greater than 20 |
