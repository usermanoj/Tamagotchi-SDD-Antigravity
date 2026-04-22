# Feature: Persistence — Feature Plan

## Summary

Save ChuChu's complete state to `localStorage` and restore it on page load, including compensation for time elapsed while the tab was closed. This makes ChuChu feel like a living pet that continues existing between sessions — the cornerstone of the Tamagotchi experience.

## Problem Statement

Without persistence, every page refresh resets ChuChu to a newborn puppy. The player loses all progress — evolution stage, care history, accumulated playtime. Worse, the pet doesn't "miss" the player when they're gone. Persistence closes this gap: ChuChu remembers its state, decays while you're away, and greets you when you return.

## Approach

### Save Payload

All game state is serialized to a single JSON object:

```javascript
{
  version: 2,                        // Schema version for forward compatibility
  timestamp: 1713657600000,          // Date.now() at save time
  stats: {
    hunger: 65,
    happiness: 72,
    energy: 48
  },
  state: 'normal',                   // Current state machine state
  stage: 'evolved',                  // Current evolution stage ('baby' or 'evolved')
  evolution: {
    activeTime: 245,                 // Cumulative active seconds
    careHistory: [80, 77, 73, ...],  // Rolling care quality samples
    careQuality: 76                  // Current calculated care quality
  },
  easterEggs: {
    weekendGreeted: false,           // Has weekend greeting shown this session?
    konamiActive: false              // Is Konami effect currently active?
  }
}
```

### Save Triggers

State is saved at three points:
1. **Auto-save:** Every 30 seconds via `setInterval`
2. **Page unload:** On `beforeunload` event (catches tab/browser close)
3. **Visibility change:** On `visibilitychange` when tab becomes hidden

### Load & Offline Decay

On startup:

```
1. Check localStorage for save data
2. If no save → fresh start (all stats = 80, stage = baby)
3. If save exists:
   a. Parse JSON, validate schema version
   b. Calculate elapsed seconds: (Date.now() - save.timestamp) / 1000
   c. Calculate offline decay: elapsed_seconds / 10 (one tick per 10 seconds)
   d. Cap decay at CONFIG.OFFLINE_DECAY_CAP (100 points max)
   e. Apply decay to each stat: stat = max(0, stat - decay)
   f. Re-evaluate state machine (offline decay may trigger Sick)
   g. Restore evolution state (stage, activeTime, careHistory)
   h. Show "Welcome back!" dialogue with context-appropriate message
```

### Offline Decay Logic

When ChuChu is "alone" (tab closed), stats decay as if the game were running:

- **Decay formula:** `decay_points = Math.floor(elapsed_seconds / 10)`
- **Cap:** Maximum 100 points of decay (prevents stats from going negative multiple times over)
- **State consequences:** If offline decay drops any stat to 0, ChuChu loads in Sick state
- **No evolution offline:** Active time does NOT accumulate while the tab is closed

**Design reasoning:** The cap at 100 prevents a player who leaves for a week from coming back to an utterly broken game state. After ~17 minutes of absence, all stats would be at 0 anyway (80 initial - 100 decay cap). Beyond that, the pet is already fully starved — additional decay is meaningless.

### Welcome Back Dialogue

Based on elapsed time and state:

| Elapsed Time | ChuChu's State | Message |
|-------------|----------------|---------|
| < 1 minute | Any | (No welcome message — too brief) |
| 1–5 minutes | Healthy | "You're back! I barely noticed you were gone! 😊" |
| 1–5 minutes | Sick | "You're back... I don't feel so great... 🤒" |
| 5–30 minutes | Healthy | "I missed you! Did you bring snacks? 🥺" |
| 5–30 minutes | Sick | "Where were you?! I'm not feeling well... 😢" |
| 30+ minutes | Healthy | "You were gone FOREVER! I thought you forgot about me! 😭" |
| 30+ minutes | Sick | "I waited and waited... I'm so hungry... 😢" |

### Reset Function

A reset button in the footer allows the player to start fresh:
1. Click "🔄 Reset" → confirmation modal appears
2. "Are you sure you want to reset ChuChu? This cannot be undone!"
3. "Yes, Reset" → clears localStorage, reloads page
4. "Cancel" → closes modal, no effect

### Schema Versioning

The save payload includes a `version` field. On load:
- If `version` matches current → load normally
- If `version` is older → attempt migration (for future use)
- If `version` is missing or unparseable → discard save, start fresh

This prevents corrupted saves from crashing the app.

## In Scope

- `persistence.js` module with save/load/clear/calculateOfflineDecay methods
- Auto-save every 30 seconds
- Save on `beforeunload` and `visibilitychange`
- Offline decay calculation from elapsed time
- Decay cap at 100 points
- State re-evaluation after offline decay
- Welcome back dialogue based on elapsed time
- Reset button with confirmation modal
- Schema versioning (v1)
- Error handling for corrupted/missing save data

## Out of Scope

- Cloud/server backup
- Multiple save slots
- Export/import save data
- Undo reset

## Dependencies

- Feature 1: Living Vitals (stats to save/restore)
- Feature 2: Care Loop (action cooldowns — not persisted, reset on load)
- Feature 3: Dynamic States (state re-evaluation after load)
- Feature 4: Evolution System (evolution state to save/restore)
- Feature 5: Personal Touches (Easter egg state — minimal persistence)
