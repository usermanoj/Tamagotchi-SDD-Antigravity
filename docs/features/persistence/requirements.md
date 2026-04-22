# Feature: Persistence — Requirements

## Functional Requirements

### REQ-PE-001: Auto-Save
- **Given** the game is running
- **Then** the complete game state SHALL be saved to `localStorage` every 30 seconds
- **And** the save SHALL use the key defined in `CONFIG.STORAGE_KEY` ('chuchu_save')

### REQ-PE-002: Save on Page Unload
- **When** the `beforeunload` event fires (tab close, browser close, navigation away)
- **Then** the current game state SHALL be saved to `localStorage`

### REQ-PE-003: Save on Tab Hidden
- **When** the `visibilitychange` event fires and `document.hidden === true`
- **Then** the current game state SHALL be saved to `localStorage`

### REQ-PE-004: Save Payload Structure
- The saved JSON SHALL include:
  - `version` (integer): schema version, currently 2
  - `timestamp` (integer): `Date.now()` at time of save
  - `stats` (object): `{ hunger, happiness, energy }` as integers
  - `state` (string): current state machine state
  - `stage` (string): current evolution stage
  - `evolution` (object): `{ activeTime, careHistory, careQuality }`
  - `easterEggs` (object): `{ weekendGreeted }`

### REQ-PE-005: Load on Startup
- **When** the application starts
- **Then** it SHALL check `localStorage` for saved data
- **If** save data exists and is valid JSON with correct version
- **Then** the game SHALL restore from saved state (with offline decay applied)
- **If** save data is missing, corrupted, or wrong version
- **Then** the game SHALL start fresh with default values

### REQ-PE-006: Offline Decay Calculation
- **Given** save data with a `timestamp`
- **When** loading the save
- **Then** elapsed time SHALL be calculated: `(Date.now() - timestamp) / 1000` seconds
- **And** decay points SHALL be `Math.floor(elapsed_seconds / 10)`
- **And** decay SHALL be capped at `CONFIG.OFFLINE_DECAY_CAP` (100)
- **And** each stat SHALL be reduced by decay points: `stat = Math.max(0, stat - decay)`

### REQ-PE-007: Post-Load State Evaluation
- **After** offline decay is applied
- **Then** the state machine SHALL re-evaluate based on new stat values
- **If** any stat is 0 after decay → state SHALL be set to Sick

### REQ-PE-008: No Offline Evolution
- **Given** the tab was closed for N seconds
- **Then** active time SHALL NOT increase by N seconds
- **And** no evolution check SHALL run for the offline period
- **And** active time SHALL resume from its saved value

### REQ-PE-009: Welcome Back Dialogue
- **Given** the game loads from saved state
- **And** the elapsed time since last save is > 60 seconds
- **Then** a welcome back dialogue SHALL display based on elapsed time and pet state
- **If** elapsed < 60 seconds → no welcome message

### REQ-PE-010: Reset Function
- **When** the player clicks the Reset button
- **Then** a confirmation modal SHALL appear
- **When** the player confirms the reset
- **Then** `localStorage` SHALL be cleared for the save key
- **And** the page SHALL reload to a fresh state
- **When** the player cancels
- **Then** the modal SHALL close with no effect

### REQ-PE-011: Schema Versioning
- The save payload SHALL include a `version` field
- Current version: 2
- **If** loaded data has a version different from current
- **Then** the system SHALL attempt migration or discard and start fresh
- **If** loaded data has no version field
- **Then** it SHALL be treated as corrupted and discarded

### REQ-PE-012: Error Handling
- **If** `JSON.parse()` throws on saved data → start fresh, log warning
- **If** any required field is missing from parsed data → start fresh, log warning
- **If** `localStorage` is unavailable (private browsing, quota exceeded) → run without persistence, log warning

## UI Requirements

### REQ-PE-UI-001: Reset Button
- The footer SHALL contain a reset button: "🔄 Reset"
- The button SHALL be styled subtly (text-only or ghost style, not accent-colored)

### REQ-PE-UI-002: Confirmation Modal
- **When** reset is clicked → a modal overlay SHALL appear
- The modal SHALL display: "Are you sure you want to reset ChuChu? This cannot be undone!"
- Two buttons: "Yes, Reset" (danger-styled) and "Cancel" (neutral-styled)
- Clicking outside the modal SHALL close it (same as Cancel)
- The modal SHALL have `role="dialog"` and `aria-modal="true"`

### REQ-PE-UI-003: Welcome Back Bubble
- On load from save (elapsed > 60s), a speech bubble SHALL appear
- The message SHALL match the welcome back dialogue table in the feature plan
- The bubble SHALL remain for 4 seconds (longer than normal 3s)

## Non-Functional Requirements

### REQ-PE-NF-001: Save Size
- The serialized save SHALL be < 2KB
- `localStorage` has a 5MB quota — save size is negligible

### REQ-PE-NF-002: Save Performance
- `JSON.stringify()` + `localStorage.setItem()` SHALL complete in < 5ms
- SHALL NOT cause visible frame drops during gameplay

### REQ-PE-NF-003: Load Performance
- Loading and restoring state SHALL complete in < 50ms
- Offline decay calculation SHALL be O(1) — no simulating individual ticks
