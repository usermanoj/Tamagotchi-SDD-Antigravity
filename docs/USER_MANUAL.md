# ChuChu Tamagotchi MVP — Compliance Audit & User Manual

---

## Part 1: Scope Compliance Audit

### ✅ Required Features — All Confirmed

| Requirement | Status | Implementation |
|---|---|---|
| **Pet: Naming** | ✅ | "ChuChu" — hardcoded in HTML, greeting dialogue |
| **Pet: 1 user** | ✅ | No auth, single player, localStorage only |
| **Pet: 1 evolution** | ✅ | Baby ChuChu → Evolved Puppy (single step) |
| **Pet: 1 recovery path** | ✅ | Sick → Normal (all stats > 20 via Feed/Play/Rest) |
| **Stats: Hunger (0–100)** | ✅ | Decays 1/tick, Feed +20 |
| **Stats: Happiness (0–100)** | ✅ | Decays 1/tick, Play +20 |
| **Stats: Energy (0–100)** | ✅ | Decays 1/tick, Rest +25 |
| **Actions: Feed** | ✅ | Hunger +20, Happiness +5, 3s cooldown |
| **Actions: Play** | ✅ | Happiness +20, Hunger -5, Energy -10, 3s cooldown |
| **Actions: Rest** | ✅ | Energy +25, Happiness -5, 3s cooldown |
| **States: Normal** | ✅ | Default state, 1× decay, 1× action effectiveness |
| **States: Sick** | ✅ | Triggered when any stat = 0, 2× decay, 0.5× action effectiveness |
| **States: Evolved** | ✅ | 10-second invulnerability + glow animation on evolution |

### 🚫 Not Allowed — All Verified Clean

| Restriction | Status | Verification |
|---|---|---|
| No authentication | ✅ Clean | No login, no user accounts |
| No multiple users | ✅ Clean | Single player only |
| No multiple pets | ✅ Clean | One pet: ChuChu |
| No inventories | ✅ Clean | No item system |
| No currencies | ✅ Clean | No coins/gems |
| No mini-games | ✅ Clean | Actions are direct stat modifications, not games |
| No social features | ✅ Clean | No sharing, no leaderboards |
| No notifications | ✅ Clean | No push/browser notifications |
| No admin features | ✅ Clean | Console debug tools only (dev-facing) |
| No complex evolutions | ✅ Clean | Single step: Baby → Evolved (no branching) |
| No permanent death | ✅ Clean | Sick state is recoverable, no death mechanic |

### State Machine Breakdown

```
                    ┌──────────────────────────┐
                    │       NORMAL              │
                    │  • 1× stat decay/tick     │
                    │  • 1× action effect       │
                    │  • Buttons: enabled        │
                    └──────┬────────┬───────────┘
                           │        │
              (any stat=0) │        │ (active time ≥ 3min
                           ▼        │  + care ≥ 50%)
                    ┌──────────┐    │
                    │   SICK   │    │
                    │  • 2× decay  │    │
                    │  • 0.5× action│   │
                    │  • 🌡️ overlay │    │
                    └──────┬───┘    │
                           │        │
               (all stats  │        │
                 > 20)     │        │
                           ▼        ▼
                    ┌──────────┐  ┌──────────┐
                    │ NORMAL   │  │ EVOLVED  │
                    │(Recovery)│  │  • 0 decay   │
                    └──────────┘  │  • No actions │
                                  │  • 10s glow   │
                                  │  • 🌟 sparkle │
                                  └──────┬───┘
                                         │ (10s timer)
                                         ▼
                                  ┌──────────┐
                                  │ NORMAL   │
                                  │(Evolved  │
                                  │ Puppy)   │
                                  └──────────┘
```

> [!IMPORTANT]
> **Recovery Path**: When ChuChu is Sick, the player must use Feed/Play/Rest (at 50% effectiveness) to raise **all three stats above 20**. This is the single required recovery path.

---

## Part 2: Complete User Manual

![ChuChu Final Demo](chuchu-demo.webm)

### 🎮 What is ChuChu?

ChuChu is your tiny virtual puppy — a modern take on the classic Tamagotchi! Your job is to keep ChuChu fed, happy, and energized. If you take good care of ChuChu for 3 minutes, your puppy will evolve into a magnificent Evolved Puppy with golden fur and sparkles! ✨

---

### 📊 Understanding the UI

#### Header
- **"ChuChu"** — Your pet's name, displayed in a warm gradient
- **Stage Badge** — Shows current evolution stage (🐶 Baby ChuChu or 🌟 Evolved Puppy)
- **State Badge** — Shows current state with color coding:
  - 🟢 **NORMAL** — Everything is fine!
  - 🔴 **SICK** — ChuChu needs help! (pulses red)
  - 🟡 **EVOLVED** — Evolution in progress! (glows gold)

#### Pet Area
- ChuChu is drawn entirely with CSS — no images needed!
- Animated features: breathing, eye movement, ear wiggling, tail wagging
- State overlays: 🌡️ thermometer when sick, sparkle glow when evolving

#### Stat Bars
| Stat | Icon | What it means | Decay rate |
|---|---|---|---|
| **Hunger** | 🍖 | How full ChuChu is | -1 per 10 seconds |
| **Happiness** | 😊 | How happy ChuChu feels | -1 per 10 seconds |
| **Energy** | ⚡ | How energized ChuChu is | -1 per 10 seconds |

- **Green bar** = stat is above 60 (healthy)
- **Orange bar** = stat is between 30-60 (warning)
- **Red bar** = stat is below 30 (critical!)

#### Action Buttons
| Button | Emoji | Stat Effects | Side Effects |
|---|---|---|---|
| **Feed** | 🍖 | Hunger **+20**, Happiness **+5** | — |
| **Play** | 🎾 | Happiness **+20** | Hunger **-5**, Energy **-10** |
| **Rest** | 💤 | Energy **+25** | Happiness **-5** |

> [!TIP]
> Each button has a **3-second cooldown** after clicking. The button turns grey and shows a ring animation during cooldown. Plan your clicks wisely!

#### Footer
- **Active: M:SS** — How long you've been playing this session (only counts when tab is visible)
- **Care: N%** — Rolling average of your care quality (higher = better care)
- **🔄 Reset** — Start over from scratch (with confirmation)

---

### 🏥 The Three States

#### 1. 🟢 NORMAL State
- **When:** All stats are above 0
- **What happens:** Stats decay at normal speed (1 point per 10 seconds)
- **Actions:** Full effectiveness (Feed = +20 hunger, etc.)
- **ChuChu looks:** Happy, breathing gently, tail wagging, eyes moving

#### 2. 🔴 SICK State
- **When:** Any stat drops to **0**
- **What happens:**
  - Stats decay at **2× speed** (2 points per 10 seconds!)
  - Actions work at **50% effectiveness** (Feed = only +10 hunger)
  - A 🌡️ thermometer appears next to ChuChu
  - ChuChu's colors shift to a sickly green tint
  - ChuChu wobbles weakly
  - Speech bubble: "I don't feel so good... 🤒"
  - State badge pulses red

- **How to recover (Recovery Path):**
  - Use Feed, Play, and Rest to raise **ALL THREE stats above 20**
  - This takes multiple button presses since actions are at 50% effectiveness
  - Once all stats > 20: ChuChu recovers → NORMAL state
  - Speech bubble: "Phew! I feel better now! 😮‍💨"

> [!WARNING]
> Don't let ChuChu stay Sick too long! The 2× decay rate means stats spiral downward fast. Act quickly with Feed, Play, and Rest to recover.

#### 3. 🟡 EVOLVED State (Evolution Event)
- **When:** Active time reaches **3 minutes** AND care quality ≥ **50%** AND currently Normal
- **What happens:**
  - A 10-second evolution animation plays
  - ChuChu glows brightly with golden light
  - Stats **freeze** (no decay during evolution)
  - All buttons are **disabled** (can't act during evolution)
  - After 10s: ChuChu transforms into **Evolved Puppy** 🌟
  - New appearance: golden fur, heart-shaped pupils, constant sparkle effect ✨
  - Speech bubble: "Whoa! I feel so different! Look at me!! 🌟"
  - State returns to NORMAL
  - Evolution is **permanent** — ChuChu stays Evolved forever!

---

### 🌟 Evolution Guide

#### Requirements to Evolve
1. **Active Time ≥ 3 minutes** — You must have the tab open and focused for at least 3 minutes total
2. **Care Quality ≥ 50%** — Your rolling average of stat management must be decent
3. **Normal State** — ChuChu cannot evolve while Sick

#### Care Quality Explained
- Every 30 seconds, the game samples your current stats: `quality = (hunger + happiness + energy) / 3`
- The last 20 samples are averaged to get your care quality %
- Keeping all stats above 50 at all times = easy evolution
- Letting stats frequently drop = lower quality = harder to evolve

#### Strategy for Fast Evolution
1. **At launch**: All stats start at 80 — you're in great shape
2. **Every 10 seconds**: Stats drop by 1 each
3. **Rotate actions**: Feed → Play → Rest → Feed → Play → Rest...
4. **Watch the footer**: Active time counts up, care quality should stay above 50%
5. **At 3:00**: If quality ≥ 50%, evolution triggers automatically! 🎉

#### Visual Changes After Evolution
| Feature | Baby ChuChu 🐶 | Evolved Puppy 🌟 |
|---|---|---|
| **Fur Color** | Warm tan/beige | Radiant golden |
| **Eyes** | Normal dark pupils | Heart-shaped pupils ♥ |
| **Body** | Small and round | Larger, fluffier |
| **Sparkles** | None | Constant ✨ floating |
| **Ears** | Short floppy | Taller, more elegant |

---

### 🥚 Hidden Easter Eggs

ChuChu has **6 secret interactions** that add personality beyond the numbers!

#### 1. 🤧 Nose Boop
- **How:** Click precisely on ChuChu's **nose** (the dark brown spot in the center of the face)
- **What happens:** ChuChu sneezes! Head tilts back, white particle burst, "Achoo! 🤧"

#### 2. 😵‍💫 Dizzy Spin
- **How:** Click ChuChu **10+ times within 3 seconds** (rapid clicking!)
- **What happens:** ChuChu gets dizzy — eyes spin, stars orbit head, wobbles side to side
- "Woah... everything is spinning! 😵‍💫" — lasts 3 seconds

#### 3. 💃 Secret Idle Dance
- **How:** Don't touch anything for **60 seconds** while all stats are above 60
- **What happens:** ChuChu starts dancing! Music notes 🎵🎶 float upward
- **If you click during the dance:** ChuChu stops, embarrassed — "Oh! You saw that?! 😳"

#### 4. 🎉 Weekend Party Hat
- **How:** Play on a **Saturday or Sunday**
- **What happens:** A tiny pink party hat appears on ChuChu's head, with subtle confetti
- First visit: "It's the weekend! Party time! 🎉"

#### 5. 🌈 Konami Code
- **How:** Type on your keyboard: **↑ ↑ ↓ ↓ ← → ← → B A**
- **What happens:**
  - Screen flashes white
  - ChuChu cycles through rainbow colors for **30 seconds**
  - "I feel FABULOUS! 🌈✨"
- Pressing any wrong key resets the sequence

#### 6. 💬 Mood Dialogue
ChuChu talks based on how they feel! Speech bubbles appear automatically:

| Trigger | ChuChu Says |
|---|---|
| All stats > 80 | "Today is the BEST day ever! ✨" |
| Happiness > 90 | "I love you SO much!! 💕" |
| Just fed (hunger > 80) | "Burp! That was yummy! 🍖" |
| Hunger < 20 | "My tummy is making weird noises... 🥺" |
| Happiness < 20 | "Do you still like me...? 😢" |
| Energy < 20 | "*yaaawn* Can we take a nap...? 😴" |
| Entering Sick | "I don't feel so good... 🤒" |
| Recovering from Sick | "Phew! I feel better now! 😮‍💨" |
| After evolution | "Whoa! I feel so different! Look at me!! 🌟" |

> [!NOTE]
> Mood dialogues have a **30-second cooldown** between lines to prevent spam. Easter egg dialogues (nose boop, dizzy, etc.) bypass this cooldown.

---

### 💾 Persistence & Saving

#### Auto-Save
- Your game is **automatically saved** every 30 seconds
- Also saves when you switch tabs or close the browser
- Uses `localStorage` — data stays in your browser

#### Coming Back Later
When you close the tab and reopen later:
- **Offline decay** is applied: 1 stat point per 10 seconds you were away
- **Capped at 100 points** — so even after hours away, stats don't go below 0 multiple times
- **Welcome back messages** based on how long you were gone:

| Time Away | Message (if healthy) | Message (if sick) |
|---|---|---|
| < 1 min | (no message) | (no message) |
| 1–5 min | "You're back! I barely noticed you were gone! 😊" | "You're back... I don't feel so great... 🤒" |
| 5–30 min | "I missed you! Did you bring snacks? 🥺" | "Where were you?! I'm not feeling well... 😢" |
| 30+ min | "You were gone FOREVER! I thought you forgot about me! 😭" | "I waited and waited... I'm so hungry... 😢" |

#### Reset
- Click **🔄 Reset** in the footer
- A confirmation modal appears: "Are you sure you want to reset ChuChu? This cannot be undone! 😢"
- **Yes, Reset** — clears all save data, page reloads to a brand new ChuChu
- **Cancel** — nothing happens, game continues

---

### 🔧 Developer Console Commands

For testing and debugging, open the browser console (F12) and use:

```javascript
// View current game state
window.__gameLoop.stats           // { hunger: 80, happiness: 80, energy: 80 }
window.__gameLoop.state           // 'normal', 'sick', or 'evolved'
window.__evolutionTracker.stage   // 'baby' or 'evolved'

// Force stats to trigger Sick state
window.__gameLoop.stats.hunger = 0;

// Force stats to recover from Sick
window.__gameLoop.stats.hunger = 30;
window.__gameLoop.stats.happiness = 30;
window.__gameLoop.stats.energy = 30;

// Check active time and care quality
window.__evolutionTracker.getActiveTime()  // seconds
window.__evolutionTracker.getCareQuality() // 0-100

// Fast-forward active time to near evolution
window.__evolutionTracker.activeTime = 170; // 10s from evolving

// Inspect save data
JSON.parse(localStorage.getItem('chuchu_save'))

// Simulate 5-minute absence
let s = JSON.parse(localStorage.getItem('chuchu_save'));
s.timestamp -= 300000; // 5 min ago
localStorage.setItem('chuchu_save', JSON.stringify(s));
location.reload();

// Clear save for fresh start
localStorage.removeItem('chuchu_save');
location.reload();
```

---

### 🎯 Quick Reference Card

| What | How |
|---|---|
| **Start fresh** | 🔄 Reset → Yes, Reset |
| **Prevent Sick** | Keep all stats above 0 |
| **Recover from Sick** | Feed + Play + Rest until all stats > 20 |
| **Trigger evolution** | Play 3+ minutes with care quality ≥ 50% |
| **Nose boop** | Click ChuChu's nose |
| **Dizzy spin** | Click ChuChu 10× in 3 seconds |
| **Idle dance** | Wait 60s idle, all stats > 60 |
| **Weekend hat** | Play on Saturday/Sunday |
| **Rainbow mode** | ↑↑↓↓←→←→BA |
