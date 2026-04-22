# Feature: Dynamic States — Requirements

## Functional Requirements

### REQ-DS-001: State Machine Evaluation
- **Given** a stats snapshot and current state
- **When** the game loop ticks OR an action is applied
- **Then** the state machine SHALL evaluate and determine the correct next state
- **And** if the state changes, a `'state:changed'` event SHALL be emitted with `{ from, to }`

### REQ-DS-002: Normal State
- **Given** all stats are above 0 AND the pet is not evolving
- **Then** the state SHALL be Normal
- **And** decay rate SHALL be 1 per tick per stat
- **And** action effectiveness SHALL be 100%

### REQ-DS-003: Sick State Entry
- **Given** the current state is Normal
- **When** any stat reaches 0 (hunger ≤ 0 OR happiness ≤ 0 OR energy ≤ 0)
- **Then** the state SHALL transition to Sick

### REQ-DS-004: Sick State Effects
- **Given** the state is Sick
- **Then** stat decay rate SHALL be 2 per tick per stat (2× normal)
- **And** all action stat modifiers SHALL be multiplied by 0.5 (rounded down via `Math.floor`)
- **And** actions SHALL still be usable (buttons enabled)

### REQ-DS-005: Sick State Recovery (Recovery Path)
- **Given** the state is Sick
- **When** ALL three stats are strictly above 20 (`hunger > 20 AND happiness > 20 AND energy > 20`)
- **Then** the state SHALL transition to Normal
- **Note:** This is the single required recovery path per challenge scope

### REQ-DS-006: Evolved State Entry
- **Given** the evolution system triggers a stage transition (Feature 4)
- **Then** the state SHALL transition to Evolved
- **And** the `_isEvolving` flag SHALL be set to true

### REQ-DS-007: Evolved State Effects
- **Given** the state is Evolved
- **Then** ALL stat decay SHALL be frozen (0 per tick)
- **And** all action buttons SHALL be disabled
- **And** `canAct()` SHALL return false
- **And** a 10-second timer SHALL begin (via `setTimeout`)

### REQ-DS-008: Evolved State Exit
- **Given** the state is Evolved
- **When** 10 seconds have elapsed since entering Evolved state
- **Then** the state SHALL transition to Normal
- **And** stat decay SHALL resume at normal rate
- **And** the `_isEvolving` flag SHALL be set to false

### REQ-DS-009: State Priority
- **Given** multiple transition conditions are met simultaneously
- **Then** Evolved SHALL have highest priority
- **Then** Sick SHALL have second priority
- **Then** Normal SHALL be the default

### REQ-DS-010: Decay Multiplier
- The state machine SHALL expose a `getDecayMultiplier(state)` method:
  - Normal → 1
  - Sick → 2 (configurable via `CONFIG.DECAY_SICK_MULTIPLIER`)
  - Evolved → 0

### REQ-DS-011: Action Multiplier
- The state machine SHALL expose a `getActionMultiplier(state)` method:
  - Normal → 1
  - Sick → 0.5 (configurable via `CONFIG.SICK_ACTION_MULTIPLIER`)
  - Evolved → 0

## UI Requirements

### REQ-DS-UI-001: State Badge
- The header SHALL display a state badge showing the current state name
- Badge colors:
  - Normal: green (`--color-state-normal: #81C784`)
  - Sick: red with pulse animation (`--color-state-sick: #E57373`)
  - Evolved: gold with glow animation (`--color-state-evolved: #FFD54F`)

### REQ-DS-UI-002: Sick Visual
- **Given** state is Sick
- **Then** the pet sprite SHALL have a green tint (CSS filter: `hue-rotate(60deg) saturate(0.6) brightness(0.9)`)
- **And** a thermometer emoji (🌡️) SHALL appear near the pet
- **And** the pet SHALL wobble with the `sickWobble` animation

### REQ-DS-UI-003: Evolved Visual
- **Given** state is Evolved
- **Then** the pet sprite SHALL glow with increased brightness and saturation
- **And** a golden drop-shadow SHALL surround the pet
- **And** the `evolveGlow` animation SHALL pulse the pet's scale

### REQ-DS-UI-004: Button Disable State
- **Given** `canAct()` returns false (Evolved state)
- **Then** all action buttons SHALL be visually disabled
- **And** button opacity SHALL be 0.45
- **And** cursor SHALL be `not-allowed`
- **And** clicks SHALL have no effect

### REQ-DS-UI-005: State Transition Feedback
- **Given** a state changes
- **Then** the state badge SHALL update immediately with correct text and color
- **And** CSS class on pet container SHALL change from `state-{old}` to `state-{new}`
