# Feature: Evolution System — Requirements

## Functional Requirements

### REQ-EV-001: Care Quality Sampling
- **Given** the game loop is running
- **Every** 30 seconds (configurable via `CONFIG.CARE_SAMPLE_INTERVAL_MS`)
- **Then** a care quality sample SHALL be calculated as `Math.round((hunger + happiness + energy) / 3)`
- **And** the sample SHALL be appended to a circular buffer of size 20 (`CONFIG.CARE_HISTORY_SIZE`)

### REQ-EV-002: Care Quality Calculation
- **Given** the care quality buffer contains N samples (1 ≤ N ≤ 20)
- **Then** `getCareQuality()` SHALL return the arithmetic mean of all samples, rounded to nearest integer
- **And** the result SHALL be in range [0, 100]

### REQ-EV-003: Active Time Tracking
- **When** the browser tab is visible and focused
- **Then** active time SHALL increment continuously (1 second per second)
- **When** the browser tab loses visibility (`document.hidden === true`)
- **Then** active time SHALL pause
- **When** the tab regains visibility
- **Then** active time SHALL resume from where it paused

### REQ-EV-004: Baby to Evolved Puppy Evolution
- **Given** current stage is `baby`
- **And** active time ≥ 180 seconds (3 minutes, configurable via `CONFIG.EVOLUTION_MIN_ACTIVE_TIME`)
- **And** care quality ≥ 50 (configurable via `CONFIG.EVOLUTION_MIN_CARE_QUALITY`)
- **And** current state is Normal (not Sick or Evolved)
- **Then** the stage SHALL transition to `evolved`
- **And** the Evolved state SHALL be triggered (10-second animation)

### REQ-EV-005: Final Form Lock
- **Given** current stage is `evolved`
- **Then** no further evolution checks SHALL be performed
- **And** the stage SHALL remain permanent for the rest of the session and across sessions

### REQ-EV-006: Evolution Blocked During Sick State
- **Given** current state is Sick
- **Then** evolution checks SHALL be skipped
- **And** no stage transition SHALL occur until state returns to Normal

### REQ-EV-007: Stage Changed Event
- **When** a stage transition occurs
- **Then** a `'stage:changed'` event SHALL be emitted with `{ from: 'baby', to: 'evolved', careQuality }`
- **And** a `'stage:evolving'` event SHALL be emitted to trigger the animation

### REQ-EV-008: Evolution Serialization
- The EvolutionTracker SHALL expose `serialize()` and `deserialize()` methods
- Serialized data SHALL include: current stage, care quality buffer, active time accumulator
- This enables persistence (Feature 6) to save and restore evolution state

## UI Requirements

### REQ-EV-UI-001: Stage Badge
- The header SHALL display the current stage name next to the pet name
- Stage names: "🐶 Baby Puppy" or "🌟 Evolved Puppy"

### REQ-EV-UI-002: Stage-Specific Visuals
- **Baby Puppy:** Warm tan colors, small rounded body, standard CSS puppy art
- **Evolved Puppy:** Golden colors (#FFD54F), larger body, heart-shaped eye pupils (♥), constant sparkle effect (✨)
- Visual change SHALL occur during the 10-second Evolved state animation

### REQ-EV-UI-003: Evolution Animation
- **When** a stage transition triggers
- **Then** a 10-second animation SHALL play:
  - Pet glows with golden aura (`evolveGlow` animation)
  - CSS class swaps from `stage-baby` to `stage-evolved` mid-animation
  - Sparkle effects surround the pet
  - After 10s: effects settle, Normal idle resumes

### REQ-EV-UI-004: Active Time Display
- The footer SHALL display cumulative active time as `Active: M:SS`
- This SHALL update every second while the tab is visible

### REQ-EV-UI-005: Care Quality Display
- The footer SHALL display current care quality as `Care: N%`
- This SHALL update every 30 seconds when a new care quality sample is taken
