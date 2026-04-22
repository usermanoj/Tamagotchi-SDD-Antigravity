# Feature: Personal Touches — Feature Plan

## Summary

Add the Easter eggs, mood dialogue, and personality animations that transform ChuChu from a stat management exercise into a character that feels hand-crafted and alive. This feature directly addresses the challenge requirement for "small Easter eggs or quirky reactions to give your pet a unique personality beyond just the numbers."

## Problem Statement

A pet with stats and states is mechanically complete but emotionally shallow. Personal touches are the layer that creates surprise, humor, and attachment. When a player discovers that clicking ChuChu's nose makes it sneeze, or that ChuChu puts on a party hat on weekends, they feel a connection to the craft behind the product — not just the code.

## Approach

### Easter Egg #1: Nose Boop

**Trigger:** Click on ChuChu's nose region (center 30% of the pet sprite).

**Detection:** Compare click coordinates against the pet sprite's bounding rect. The "nose zone" is a circle centered at approximately 50% horizontal, 55% vertical of the sprite, with a radius of 15% of the sprite width.

**Response:**
1. ChuChu's head tilts back slightly (CSS transform)
2. A sneeze particle burst (small white dots) emits from the nose area
3. Speech bubble shows "Achoo! 🤧" for 2 seconds
4. Brief shake animation on the pet container

### Easter Egg #2: Dizzy Spin

**Trigger:** Click ChuChu 10+ times within 3 seconds anywhere on the sprite.

**Detection:** Maintain a click timestamp array. On each click, filter out timestamps older than 3 seconds. If array length ≥ 10, trigger.

**Response:**
1. ChuChu's eyes change to spiral/dizzy eyes (CSS filter or overlay)
2. Small stars orbit around ChuChu's head (`@keyframes rotate`)
3. ChuChu wobbles side to side
4. Speech bubble: "Woah... everything is spinning! 😵‍💫"
5. Effect lasts 3 seconds, then returns to normal

### Easter Egg #3: Secret Idle Dance

**Trigger:** ChuChu has been idle (no player interaction) for 60 seconds AND all stats are above 60.

**Detection:** Track `lastInteractionTime`. On each tick, if `now - lastInteractionTime > 60000` and all stats > 60, trigger. Only fires once per idle period (reset when player interacts).

**Response:**
1. ChuChu starts bouncing rhythmically
2. Music note emojis (🎵🎶) float up from ChuChu
3. ChuChu does a spin animation and a little jump
4. Dance lasts ~5 seconds
5. If the player clicks during the dance, ChuChu stops embarrassed — speech bubble: "Oh! You saw that?! 😳"

### Easter Egg #4: Weekend Party Hat

**Trigger:** The current day is Saturday (day 6) or Sunday (day 0).

**Detection:** `new Date().getDay()` checked on page load and once per minute.

**Response:**
1. A tiny party hat appears on ChuChu's head (CSS positioned absolute element)
2. Subtle confetti particles drift in the background
3. If it's the player's first visit on a weekend, speech bubble: "It's the weekend! Party time! 🎉"

### Easter Egg #5: Konami Code

**Trigger:** Player types ↑↑↓↓←→←→BA on the keyboard.

**Detection:** Listen for `keydown` events. Maintain a sequence buffer. After each keypress, check if the buffer matches the Konami code. Reset buffer on any non-matching key.

**Response:**
1. Screen flashes briefly (white overlay fade)
2. ChuChu's sprite gets a rainbow hue-rotate animation (CSS `filter: hue-rotate(Xdeg)` cycling)
3. Rainbow sparkle trail follows the pet
4. Speech bubble: "I feel FABULOUS! 🌈✨"
5. Effect lasts 30 seconds, then fades back to normal

### Easter Egg #6: Mood Dialogue

**Trigger:** Reactive speech bubbles based on stat thresholds, checked after each tick and action.

**Detection:** After each tick/action, evaluate conditions in priority order. Only show one dialogue at a time. Cooldown of 30 seconds between dialogue lines to prevent spam.

**Dialogue Table:**

| Priority | Condition | Dialogue | Emoji |
|----------|-----------|----------|-------|
| 1 | Just evolved | "Whoa! I feel so different! Look at me!!" | 🌟 |
| 2 | All stats > 80 | "Today is the BEST day ever!" | ✨ |
| 3 | Hunger > 80 (just fed) | "Burp! That was yummy!" | 🍖 |
| 4 | Happiness > 90 | "I love you SO much!!" | 💕 |
| 5 | Hunger < 20 | "My tummy is making weird noises..." | 🥺 |
| 6 | Happiness < 20 | "Do you still like me...?" | 😢 |
| 7 | Energy < 20 | "*yaaawn* Can we take a nap...?" | 😴 |
| 8 | Entering Sick state | "I don't feel so good..." | 🤒 |
| 9 | Recovering from Sick | "Phew! I feel better now!" | 😮‍💨 |

### Speech Bubble UI

Speech bubbles appear above ChuChu:
- Rounded rectangle with a small triangle pointer at the bottom
- White background, dark text, subtle shadow
- Fade-in (300ms), display (3 seconds), fade-out (300ms)
- Only one bubble at a time (new dialogue replaces old)
- `aria-live="polite"` for accessibility

## In Scope

- `easter-eggs.js` module managing all 6 Easter egg triggers and effects
- `dialogue.js` module managing speech bubble display and mood evaluation
- Nose boop detection (click zone within pet sprite)
- Rapid click counter for dizzy effect
- Idle timer for secret dance
- Day-of-week check for weekend hat
- Keyboard listener for Konami code
- 10 mood dialogue lines with stat-based triggers
- Speech bubble component with fade animations
- 30-second cooldown between dialogue lines
- Stage-specific personality modifiers (Baby is bouncier; Evolved is more confident)

## Out of Scope

- Sound effects for Easter eggs
- More than 6 Easter eggs
- Player-configurable dialogue
- Easter egg achievement tracking

## Dependencies

- Feature 1: Living Vitals (stat values for mood evaluation)
- Feature 2: Care Loop (interaction events for idle detection)
- Feature 3: Dynamic States (state change events for dialogue triggers)
- Feature 4: Evolution System (stage for personality modifiers)
