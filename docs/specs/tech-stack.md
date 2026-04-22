# ChuChu — Tiny Tamagotchi MVP: Tech Stack

## System Design

ChuChu is a **client-side single-page application** with no backend. All logic runs in the browser. State persists in `localStorage`. The game loop is driven by `setInterval`, and the UI updates reactively when state changes.

**Architecture:**

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER                           │
│                                                      │
│  ┌──────────────┐     ┌──────────────────────────┐  │
│  │   UI Layer   │◄────│     Engine Layer          │  │
│  │              │     │                           │  │
│  │ pet-renderer │     │ game-loop.js              │  │
│  │ stats-display│     │   └→ tick every 10s       │  │
│  │ actions-panel│     │   └→ decay stats          │  │
│  │ dialogue     │     │   └→ check states         │  │
│  │ easter-eggs  │     │   └→ check evolution      │  │
│  │ footer       │     │                           │  │
│  │              │     │ state-machine.js          │  │
│  │  DOM updates │     │   └→ Normal/Sick/Evolved  │  │
│  │  CSS classes │     │      transitions          │  │
│  │  animations  │     │                           │  │
│  │              │     │ evolution.js              │  │
│  └──────────────┘     │   └→ care quality tracker │  │
│         ▲              │   └→ Baby → Evolved      │  │
│         │              │                           │  │
│         │              │ persistence.js            │  │
│         │              │   └→ localStorage R/W     │  │
│         │              │   └→ offline decay calc   │  │
│         │              └──────────────────────────┘  │
│         │                         │                   │
│         └─────────────────────────┘                   │
│              renders state                            │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │              localStorage                     │   │
│  │  { stats, stage, careHistory, activeTime,     │   │
│  │    lastSave, evolutionState }                  │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Design principles:**
1. **Engine/UI separation.** The engine layer manages pure state (numbers, enums, timestamps). The UI layer reads state and updates the DOM. They communicate through a simple pub/sub event system — engine emits events, UI subscribes and re-renders.
2. **No framework.** Vanilla JS with manual DOM manipulation. No React, no Vue, no virtual DOM. The state surface is small enough (~10 values) that targeted DOM updates are simpler and faster than a framework's reconciliation.
3. **CSS-driven animation.** All visual transitions (stat bar fills, state overlays, evolution sparkles) are CSS animations / transitions. JS triggers them by toggling classes, not by animating properties frame-by-frame.
4. **CSS-drawn pet art.** ChuChu is drawn entirely with CSS shapes (div elements, border-radius, box-shadow) — no external image dependencies. This ensures zero-asset deployment and precise animation control.

## Technology Decisions

| Layer | Technology | Rationale |
|-------|-----------|-----------| 
| **Build Tool** | Vite 6.x | Instant dev server with HMR. Native ES module support. Near-zero config. Optimized production build. |
| **Language** | Vanilla JavaScript (ES2022+) | No TypeScript overhead for a small project. ES modules for code organization. Optional chaining, nullish coalescing, and private class fields are available. |
| **Styling** | Vanilla CSS with Custom Properties | CSS custom properties for theming (colors, sizes, timing). `@keyframes` for animations. No preprocessor needed. |
| **Persistence** | `localStorage` | Zero dependencies. Synchronous read/write. Sufficient for ~2KB of pet state JSON. Survives page refresh and browser restart. |
| **Pet Art** | Pure CSS shapes | CSS `border-radius`, `box-shadow`, gradients, and pseudo-elements create the puppy. No external images needed. CSS `transform` and `filter` for state variations (sick tint, evolve glow). |
| **Animation** | CSS Transitions + `@keyframes` | Hardware-accelerated via `transform` and `opacity`. JS only toggles CSS classes. No animation libraries. |
| **Time Tracking** | `performance.now()` + `Date.now()` | `performance.now()` for in-session tick accuracy. `Date.now()` timestamps for cross-session elapsed time calculation. |
| **Event System** | Custom `EventTarget` subclass | Lightweight pub/sub for engine → UI communication. No external event library. Native browser API. |
| **Testing** | Browser console test suite + manual | `tests/test-suite.js` provides automated assertions. Manual validation procedures for visual/interaction tests. |

## Configuration

All tunable values are centralized in a single config object:

```javascript
// src/config.js
export const CONFIG = {
  // Tick timing
  TICK_INTERVAL_MS: 10_000,        // 10 seconds between stat decay ticks
  CARE_SAMPLE_INTERVAL_MS: 30_000, // 30 seconds between care quality samples
  CARE_HISTORY_SIZE: 20,           // Number of care quality samples to keep
  AUTO_SAVE_INTERVAL_MS: 30_000,   // 30 seconds between auto-saves

  // Stat ranges
  STAT_MIN: 0,
  STAT_MAX: 100,
  STAT_INITIAL: 80,

  // Decay rates (per tick)
  DECAY_NORMAL: 1,
  DECAY_SICK_MULTIPLIER: 2,

  // Action effects
  ACTIONS: {
    feed:  { hunger: +20, happiness: +5,  energy: 0    },
    play:  { hunger: -5,  happiness: +20, energy: -10  },
    rest:  { hunger: 0,   happiness: -5,  energy: +25  },
  },
  ACTION_COOLDOWN_MS: 3_000,
  SICK_ACTION_MULTIPLIER: 0.5,   // Actions restore half when sick

  // State thresholds
  SICK_THRESHOLD: 0,              // Any stat at 0 → Sick
  SICK_RECOVERY_THRESHOLD: 20,   // All stats > 20 → recover from Sick

  // Evolution — single step: Baby → Evolved
  EVOLUTION_INVULNERABILITY_MS: 10_000,  // 10 seconds of frozen stats
  EVOLUTION_MIN_ACTIVE_TIME: 180,        // 3 minutes (180 seconds)
  EVOLUTION_MIN_CARE_QUALITY: 50,        // Care quality ≥ 50%

  // Easter eggs
  RAPID_CLICK_THRESHOLD: 10,
  RAPID_CLICK_WINDOW_MS: 3_000,
  IDLE_DANCE_DELAY_MS: 60_000,
  KONAMI_CODE: ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
                'KeyB','KeyA'],
  KONAMI_EFFECT_DURATION_MS: 30_000,

  // Dialogue
  DIALOGUE_DISPLAY_MS: 3_500,
  DIALOGUE_COOLDOWN_MS: 30_000,

  // Persistence
  STORAGE_KEY: 'chuchu_save',
  SAVE_VERSION: 2,
  OFFLINE_DECAY_CAP: 100,         // Max stat points to decay offline
};
```

## Module Architecture

### Engine Layer

**`game-loop.js`** — The heartbeat. Manages the main `setInterval` tick, delegates to stat decay, state checks, and evolution checks.

```
GameLoop
├── start()           → begins the tick interval
├── stop()            → pauses the tick interval
├── tick()            → single tick: decay stats → check state → check evolution → emit 'tick'
├── applyAction(name) → applies feed/play/rest effects, respects cooldown + sick multiplier
├── triggerEvolution()→ force-trigger evolution (for testing)
└── reset()           → resets all state to initial values
```

**`state-machine.js`** — Evaluates current stats and manages state transitions. Three states only.

```
StateMachine
├── evaluate(stats, currentState, isEvolving) → returns next state based on rules
├── canAct(state)                             → returns boolean (false if evolving)
├── getDecayMultiplier(state)                 → Normal=1, Sick=2, Evolved=0
└── getActionMultiplier(state)                → Normal=1, Sick=0.5, Evolved=0
```

**`evolution.js`** — Tracks care quality over time and determines evolution readiness.

```
EvolutionTracker
├── sampleCareQuality(stats)      → records a quality sample
├── getCareQuality()              → returns rolling average (0-100)
├── checkEvolution(currentState)  → returns 'evolved' or null
├── getActiveTime()               → returns cumulative active seconds
├── evolve(newStage)              → applies stage transition
├── tick(stats, deltaMs)          → accumulates sample timing
└── serialize() / deserialize()   → for persistence
```

**`persistence.js`** — Saves and loads state from `localStorage`.

```
Persistence
├── save(gameState)                    → serializes to JSON, writes to localStorage
├── load()                             → reads from localStorage, returns { data, elapsedSeconds }
├── calculateOfflineDecay(elapsed)     → returns stat decrement based on elapsed time
├── getWelcomeMessage(elapsed, isSick) → returns welcome-back dialogue text
├── clear()                            → removes save data
└── hasSaveData()                      → returns boolean
```

### UI Layer

**`pet-renderer.js`** — Renders ChuChu's visual representation using CSS classes.

```
PetRenderer
├── updateStageVisual(stage) → applies stage-specific CSS class
├── applyStateClass(state)   → applies state-specific CSS class
└── (event listeners)        → listens for action:applied, state:changed, stage:evolving
```

**`stats-display.js`** — Renders the three vital meters.

```
StatsDisplay
├── update(stats)             → updates bar widths, colors, labels
├── animateChange(stat, delta)→ flash green (+) or red (−)
└── getBarColor(value)        → green > 60, amber > 30, red ≤ 30
```

**`actions-panel.js`** — Renders the Feed/Play/Rest buttons.

```
ActionsPanel
├── (button click handlers)   → calls gameLoop.applyAction()
├── startCooldown(action)     → shows grey button + ring animation
└── setDisabled(disabled)     → disable all buttons (during evolution)
```

**`dialogue.js`** — Renders speech bubbles from ChuChu.

```
DialogueSystem
├── show(text, duration?)     → displays speech bubble for 3-4 seconds
├── (mood evaluation)         → checks stat thresholds on tick
└── (state change reactions)  → sick/recovery dialogue
```

**`easter-eggs.js`** — Manages all Easter egg detection and triggering.

```
EasterEggs
├── (nose boop detection)     → click target area on pet sprite
├── (rapid click tracking)    → counts clicks within time window
├── (idle dance timer)        → fires after 60s idle if stats > 60
├── (weekend hat check)       → applies party hat on Sat/Sun
└── (Konami code listener)    → keyboard sequence detection
```

**`footer.js`** — Footer UI showing active time, care quality, and reset button.

```
Footer
├── (active time display)     → updates M:SS format every second
├── (care quality display)    → updates Care: N% on stage:info events
└── (reset button/modal)      → confirmation modal → clears save → reloads
```

### Event Bus

The engine and UI layers communicate through a shared `EventBus`:

```javascript
// Events emitted by the engine
'tick'             → { stats, state, stage, canAct }
'action:applied'   → { action, effects, newStats }
'action:cooldown'  → { action, remainingMs }
'state:changed'    → { from, to }
'stage:changed'    → { from, to, careQuality }
'stage:evolving'   → { from, to }
'stage:info'       → { stage, careQuality, activeTime }
'dialogue:show'    → { text, duration }
```

## HTML Structure

Single `index.html` page. Semantic, accessible, with unique IDs for all interactive elements. ChuChu is drawn with CSS art (div elements with border-radius, colors, pseudo-elements) — no `<img>` tags needed for the pet.

## CSS Design System

### Custom Properties (Theme Tokens)

```css
:root {
  /* Colors */
  --color-bg: #FEF5E7;
  --color-bg-gradient: linear-gradient(135deg, #FEF5E7, #FDE8D0, #FCE4EC);
  --color-surface: #FFFFFF;
  --color-text: #2D2D2D;
  --color-text-muted: #9E9E9E;
  --color-accent: #FF6B9D;
  --color-accent-hover: #FF4081;
  
  /* Stat bar colors */
  --color-stat-high: #66BB6A;   /* Green (60-100) */
  --color-stat-mid: #FFA726;    /* Amber (30-59) */
  --color-stat-low: #EF5350;    /* Red (0-29) */
  
  /* State colors */
  --color-state-normal: #81C784;  /* Green badge */
  --color-state-sick: #E57373;    /* Red badge */
  --color-state-evolved: #FFD54F; /* Gold badge */
  
  /* Typography */
  --font-primary: 'Nunito', 'Segoe UI', sans-serif;
  --font-display: 'Baloo 2', cursive;
  
  /* Animation timing */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 600ms ease;
  --bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Responsive Breakpoints

```css
/* Mobile-first */
/* Default: 375px+ (iPhone SE) */
/* Tablet: 768px+ */
/* Desktop: 1024px+ */
```

The layout is a single centered column on all sizes. Buttons display in a horizontal row at all breakpoints.

## Development Workflow

```
1. npm install
2. Write feature spec → implement → validate → commit
3. npm run dev (development with HMR)
4. npm run build (final production bundle for deployment)
5. Deploy via GitHub Pages or Vercel (static export)
```

### Git Branch Strategy

For this MVP, we work on `main` with feature-scoped commits:
- `feat(vitals): add real-time stat decay engine`
- `feat(care): add feed/play/rest actions with cooldowns`
- `feat(states): add Normal/Sick/Evolved state machine`
- `feat(evolution): add single-step evolution with care quality`
- `feat(personality): add Easter eggs and mood dialogue`
- `feat(persistence): add localStorage save/load with offline decay`
- `docs: add all spec documents`

### Browser Support

Target: latest versions of Chrome, Firefox, Safari, Edge. No IE11 support. Features used:
- ES Modules (`import`/`export`)
- CSS Custom Properties
- `localStorage`
- `performance.now()`
- `EventTarget` constructor
- Optional chaining (`?.`)
- Nullish coalescing (`??`)

## Performance Budget

| Metric | Target | Rationale |
|--------|--------|-----------|
| First Contentful Paint | < 500ms | Vite production build is tiny (~50KB total) |
| JavaScript bundle | < 30KB (gzipped) | No framework overhead |
| CSS | < 10KB (gzipped) | Vanilla CSS, no utility bloat |
| Image assets | 0KB | Pet is CSS-drawn, no images needed |
| Memory | < 10MB | No complex state, no canvas rendering |
| `setInterval` accuracy | ±50ms | Sufficient for 10-second tick |

## Security Considerations

- **No server.** No network requests, no API keys, no authentication.
- **localStorage only.** Data is browser-local. No PII collected.
- **No eval.** All code is static. No dynamic code execution.
- **CSP friendly.** No inline scripts (Vite handles module loading). External fonts loaded from Google Fonts CDN.
