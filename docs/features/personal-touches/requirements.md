# Feature: Personal Touches — Requirements

## Functional Requirements

### Easter Egg Requirements

#### REQ-PT-001: Nose Boop
- **When** the player clicks within the nose zone of the pet sprite (center 30%, vertically 40-70% of sprite)
- **Then** a sneeze animation SHALL play
- **And** a particle burst SHALL emit from the nose area
- **And** a speech bubble SHALL show "Achoo! 🤧" for 2 seconds
- **And** the pet container SHALL shake briefly

#### REQ-PT-002: Dizzy Spin
- **When** the player clicks on the pet sprite 10+ times within 3 seconds
- **Then** ChuChu's eyes SHALL change to spiral/dizzy style
- **And** small stars SHALL orbit ChuChu's head for 3 seconds
- **And** ChuChu SHALL wobble side to side
- **And** a speech bubble SHALL show "Woah... everything is spinning! 😵‍💫"
- **After** 3 seconds, ChuChu SHALL return to normal

#### REQ-PT-003: Secret Idle Dance
- **Given** no player interaction for 60 seconds
- **And** all stats (hunger, happiness, energy) are above 60
- **Then** ChuChu SHALL perform a dance animation (~5 seconds)
- **And** music note emojis SHALL float upward
- **If** the player clicks during the dance
- **Then** ChuChu SHALL stop and show "Oh! You saw that?! 😳"
- **And** the dance SHALL NOT retrigger until the player interacts and goes idle again

#### REQ-PT-004: Weekend Party Hat
- **When** the current day is Saturday (day 6) or Sunday (day 0)
- **Then** a party hat SHALL appear on ChuChu's head
- **And** subtle confetti particles SHALL drift in the background
- **And** on first load of a weekend session, a speech bubble SHALL show "It's the weekend! Party time! 🎉"

#### REQ-PT-005: Konami Code
- **When** the player types the sequence ↑↑↓↓←→←→BA on the keyboard
- **Then** a brief screen flash SHALL occur
- **And** ChuChu's sprite SHALL cycle through rainbow colors (hue-rotate animation)
- **And** a rainbow sparkle trail SHALL appear
- **And** a speech bubble SHALL show "I feel FABULOUS! 🌈✨"
- **And** the effect SHALL last 30 seconds before fading

#### REQ-PT-006: Konami Code Sequence Detection
- The keyboard listener SHALL buffer key presses
- A non-matching key SHALL reset the buffer
- The buffer SHALL be checked against the sequence: `['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']`

### Dialogue Requirements

#### REQ-PT-010: Speech Bubble Display
- Speech bubbles SHALL appear above the pet sprite
- Bubbles SHALL have a rounded rectangle shape with a bottom pointer
- Bubbles SHALL fade in (300ms) and fade out (300ms)
- Default display duration: 3 seconds (configurable per message)
- Only one bubble SHALL display at a time

#### REQ-PT-011: Mood-Based Dialogue
- **After** each tick and action, the dialogue system SHALL evaluate mood conditions
- **If** a condition is met AND at least 30 seconds have passed since the last dialogue
- **Then** the highest-priority matching dialogue SHALL display

#### REQ-PT-012: Dialogue Priority Order
1. Just evolved → "Whoa! I feel so different! Look at me!! 🌟"
2. All stats > 80 → "Today is the BEST day ever! ✨"
3. Hunger > 80 (just fed) → "Burp! That was yummy! 🍖"
4. Happiness > 90 → "I love you SO much!! 💕"
5. Hunger < 20 → "My tummy is making weird noises... 🥺"
6. Happiness < 20 → "Do you still like me...? 😢"
7. Energy < 20 → "*yaaawn* Can we take a nap...? 😴"
8. Entering Sick → "I don't feel so good... 🤒"
9. Recovering from Sick → "Phew! I feel better now! 😮‍💨"

#### REQ-PT-013: Dialogue Cooldown
- After a dialogue line displays, no new mood dialogue SHALL trigger for 30 seconds
- Easter egg dialogues (nose boop, dizzy, etc.) SHALL bypass this cooldown
- Easter egg dialogues SHALL still replace any currently visible bubble

#### REQ-PT-014: Accessibility
- The dialogue bubble element SHALL have `aria-live="polite"`
- Screen readers SHALL announce dialogue text when it appears

## UI Requirements

### REQ-PT-UI-001: Particle Effects
- Sneeze particles: 5-8 small white dots, burst outward, fade over 500ms
- Sparkle particles: 8-12 small gold/white stars, drift upward, fade over 1s
- Confetti: small colored rectangles, drift downward slowly
- All particles SHALL be CSS pseudo-elements or absolutely positioned divs (no canvas)

### REQ-PT-UI-002: Party Hat
- SHALL be a small triangle/cone shape positioned on top of the pet sprite
- SHALL use CSS (`position: absolute`, `top`, `left`)
- SHALL scale with the pet sprite on responsive layouts

### REQ-PT-UI-003: Rainbow Effect
- Konami code rainbow SHALL use `animation: hue-rotate 2s linear infinite`
- `filter: hue-rotate(0deg)` → cycles through full spectrum
- Transition out after 30s with a 1-second fade

### REQ-PT-UI-004: Music Notes
- Idle dance music notes SHALL be emoji characters (🎵🎶)
- SHALL float upward using `@keyframes` opacity + translateY
- 3-4 notes, staggered by 400ms each
