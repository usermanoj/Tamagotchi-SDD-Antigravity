# Feature: Care Loop — Requirements

## Functional Requirements

### REQ-CL-001: Feed Action
- **When** the player clicks the Feed button
- **And** the Feed action is not on cooldown
- **And** ChuChu can act (not in Evolved state)
- **Then** Hunger SHALL increase by 20
- **And** Happiness SHALL increase by 5
- **And** all stats SHALL be clamped to [0, 100]

### REQ-CL-002: Play Action
- **When** the player clicks the Play button
- **And** the Play action is not on cooldown
- **And** ChuChu can act
- **Then** Happiness SHALL increase by 20
- **And** Energy SHALL decrease by 10
- **And** Hunger SHALL decrease by 5
- **And** all stats SHALL be clamped to [0, 100]

### REQ-CL-003: Rest Action
- **When** the player clicks the Rest button
- **And** the Rest action is not on cooldown
- **And** ChuChu can act
- **Then** Energy SHALL increase by 25
- **And** Happiness SHALL decrease by 5
- **And** all stats SHALL be clamped to [0, 100]

### REQ-CL-004: Action Cooldown
- **When** an action is triggered successfully
- **Then** that specific action SHALL enter a 3-second cooldown period
- **And** during cooldown, clicking that button SHALL have no effect
- **And** other action buttons SHALL remain independently usable (unless on their own cooldown)

### REQ-CL-005: Stat Clamping After Actions
- **Given** an action causes a stat to exceed 100
- **Then** the stat SHALL be set to 100
- **Given** an action causes a stat to go below 0
- **Then** the stat SHALL be set to 0

### REQ-CL-006: Action Event Emission
- **When** an action is successfully applied
- **Then** an `'action:applied'` event SHALL be emitted
- **And** the payload SHALL include `{ action: 'feed'|'play'|'rest', effects: {...}, newStats: {...} }`

### REQ-CL-007: Cannot Act Check
- **Given** `canAct()` returns false (Evolved state — implemented in Feature 3)
- **When** any action button is clicked
- **Then** the action SHALL NOT be applied
- **And** the button SHALL appear visually disabled

## UI Requirements

### REQ-CL-UI-001: Action Buttons
- **Given** the application loads
- **Then** three action buttons SHALL be displayed below the stats area
- **And** each button SHALL show an emoji icon and text label
- Feed: 🍖 "Feed"
- Play: 🎾 "Play"
- Rest: 💤 "Rest"

### REQ-CL-UI-002: Button Styling
- Buttons SHALL have the accent color background (`--color-accent`)
- Buttons SHALL have a hover state with darker accent (`--color-accent-hover`)
- Buttons SHALL have a subtle shadow (`--shadow-button`)
- Buttons SHALL have rounded corners (`--radius-md`)
- Buttons SHALL be equally sized and evenly spaced in a horizontal row

### REQ-CL-UI-003: Cooldown Visual
- **When** a button enters cooldown
- **Then** a circular progress ring SHALL animate around the button over 3 seconds
- **And** the button background SHALL change to a muted/disabled color
- **And** the button cursor SHALL change to `not-allowed`
- **When** cooldown completes
- **Then** the button SHALL re-enable with a subtle scale pop animation

### REQ-CL-UI-004: Action Animation (Pet)
- **When** Feed is triggered → pet sprite SHALL play an eating animation (1.5s)
- **When** Play is triggered → pet sprite SHALL play a bouncing animation (2s)
- **When** Rest is triggered → pet sprite SHALL play a curling-up animation (1.5s)
- Animations SHALL be CSS `@keyframes` triggered by temporary CSS classes

### REQ-CL-UI-005: Stat Change Feedback
- **When** a stat increases due to an action
- **Then** that stat bar SHALL flash green briefly (300ms)
- **When** a stat decreases due to an action
- **Then** that stat bar SHALL flash red briefly (300ms)

### REQ-CL-UI-006: Disabled State
- **When** `canAct()` returns false
- **Then** all three buttons SHALL appear grayed out / disabled
- **And** clicking them SHALL have no effect

## Non-Functional Requirements

### REQ-CL-NF-001: Click Responsiveness
- Button click to stat update SHALL complete in < 16ms (single frame)
- Animation should start within the same frame as the click

### REQ-CL-NF-002: Accessibility
- Each button SHALL have an `aria-label` describing its function
- Buttons SHALL be keyboard-focusable and activatable with Enter/Space
