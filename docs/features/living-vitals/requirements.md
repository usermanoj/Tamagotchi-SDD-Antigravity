# Feature: Living Vitals — Requirements

## Functional Requirements

### REQ-LV-001: Stat Initialization
- **When** the application loads with no saved state
- **Then** all three stats (hunger, happiness, energy) SHALL be set to 80

### REQ-LV-002: Automatic Stat Decay
- **Given** the game loop is running
- **When** a tick fires (every 10,000 ms by default)
- **Then** each stat (hunger, happiness, energy) SHALL be decremented by 1

### REQ-LV-003: Stat Clamping
- **Given** any stat modification (decay or future action)
- **Then** the stat value SHALL be clamped to the range [0, 100]
- **And** values below 0 SHALL be set to 0
- **And** values above 100 SHALL be set to 100

### REQ-LV-004: Tick Event Emission
- **Given** the game loop ticks
- **Then** a `'tick'` event SHALL be emitted on the EventBus
- **And** the event payload SHALL contain `{ stats: { hunger, happiness, energy } }`

### REQ-LV-005: Game Loop Control
- **Given** a `GameLoop` instance
- **Then** it SHALL expose `start()`, `stop()`, `tick()`, and `getState()` methods
- **And** `start()` SHALL begin the tick interval
- **And** `stop()` SHALL clear the tick interval
- **And** `tick()` SHALL execute a single tick immediately
- **And** `getState()` SHALL return the current stats snapshot

## UI Requirements

### REQ-LV-UI-001: Stat Bar Display
- **Given** three stats exist
- **Then** three horizontal stat bars SHALL be rendered
- **And** each bar SHALL display: emoji label, colored fill bar, numeric value

### REQ-LV-UI-002: Stat Bar Color
- **Given** a stat value
- **When** value is 60–100 → bar fill color SHALL be green (#4CAF50)
- **When** value is 30–59 → bar fill color SHALL be amber (#FFC107)
- **When** value is 0–29 → bar fill color SHALL be red (#F44336)

### REQ-LV-UI-003: Stat Bar Animation
- **Given** a stat value changes
- **Then** the bar fill width SHALL animate smoothly (CSS transition, 300ms ease)
- **And** the color change SHALL also animate smoothly

### REQ-LV-UI-004: Stat Bar Width
- **Given** a stat value of N
- **Then** the bar fill width SHALL be `N%` of the bar track width

### REQ-LV-UI-005: Pet Sprite Display
- **Given** the application loads
- **Then** a Baby Puppy sprite SHALL be displayed centered in the pet area
- **And** the sprite SHALL have a subtle breathing animation (scale 1.0 → 1.03 → 1.0, 3s cycle)

### REQ-LV-UI-006: Page Layout
- **Given** the application loads
- **Then** the page SHALL display in this order (top to bottom):
  1. Header with pet name "ChuChu" and stage/state badges
  2. Pet area with ChuChu sprite
  3. Stats area with three stat bars
  4. Actions area (empty placeholder for Feature 2)
  5. Footer with active time and care quality displays

### REQ-LV-UI-007: Typography
- **Given** the application loads
- **Then** body text SHALL use 'Nunito' font family
- **And** display text (pet name, headers) SHALL use 'Baloo 2' font family
- **And** both fonts SHALL be loaded from Google Fonts

### REQ-LV-UI-008: Responsive Layout
- **Given** a viewport width of 375px (minimum supported)
- **Then** all content SHALL be visible without horizontal scrolling
- **And** stat bars SHALL be full-width within their container
- **And** the pet sprite SHALL scale proportionally

## Non-Functional Requirements

### REQ-LV-NF-001: Tick Accuracy
- The tick interval SHALL fire within ±100ms of the configured interval
- Acceptable `setInterval` drift for a 10-second interval

### REQ-LV-NF-002: Performance
- The stat bar re-render after each tick SHALL complete in < 5ms
- No layout thrashing — batch DOM reads before writes

### REQ-LV-NF-003: Module Separation
- `game-loop.js` SHALL NOT import from or reference any UI modules
- `stats-display.js` SHALL NOT modify game state directly
- Communication SHALL be via the EventBus exclusively
