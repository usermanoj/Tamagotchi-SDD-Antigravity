// ─── ChuChu Tamagotchi — Dialogue System ───
// Speech bubbles with mood-based reactive text.

import { bus } from '../engine/event-bus.js';
import { CONFIG } from '../config.js';

const MOOD_LINES = [
  { condition: (s) => s.hunger > 80 && s.happiness > 80 && s.energy > 80, text: "Today is the BEST day ever! ✨", priority: 2 },
  { condition: (s) => s.happiness > 90, text: "I love you SO much!! 💕", priority: 4 },
  { condition: (s) => s.hunger < 20, text: "My tummy is making weird noises... 🥺", priority: 5 },
  { condition: (s) => s.happiness < 20, text: "Do you still like me...? 😢", priority: 6 },
  { condition: (s) => s.energy < 20, text: "*yaaawn* Can we take a nap...? 😴", priority: 7 },
];

export function initDialogueSystem() {
  const bubble = document.getElementById('dialogue-bubble');
  let hideTimeout = null;
  let lastDialogueTime = 0;

  function show(text, duration = CONFIG.DIALOGUE_DISPLAY_MS) {
    // Clear any existing
    if (hideTimeout) clearTimeout(hideTimeout);

    bubble.textContent = text;
    bubble.classList.remove('hidden', 'fade-out');
    bubble.classList.add('fade-in');

    hideTimeout = setTimeout(() => {
      bubble.classList.remove('fade-in');
      bubble.classList.add('fade-out');
      setTimeout(() => {
        bubble.classList.add('hidden');
        bubble.classList.remove('fade-out');
      }, 300);
    }, duration);
  }

  // Direct show (from Easter eggs, evolution, welcome back)
  bus.on('dialogue:show', ({ text, duration }) => {
    show(text, duration || CONFIG.DIALOGUE_DISPLAY_MS);
    // Easter egg dialogues don't set the cooldown
  });

  // Mood-based dialogue on tick
  bus.on('tick', ({ stats, state }) => {
    const now = Date.now();
    if (now - lastDialogueTime < CONFIG.DIALOGUE_COOLDOWN_MS) return;

    for (const line of MOOD_LINES) {
      if (line.condition(stats)) {
        show(line.text);
        lastDialogueTime = now;
        break;
      }
    }
  });

  // State-change dialogue
  bus.on('state:changed', ({ from, to }) => {
    if (to === 'sick' && from !== 'sick') {
      show("I don't feel so good... 🤒");
      lastDialogueTime = Date.now();
    } else if (from === 'sick' && to === 'normal') {
      show("Phew! I feel better now! 😮‍💨");
      lastDialogueTime = Date.now();
    }
  });

  // Stat feedback after feeding
  bus.on('action:applied', ({ action, newStats }) => {
    const now = Date.now();
    if (now - lastDialogueTime < 5000) return; // Short cooldown for action dialogues
    if (action === 'feed' && newStats.hunger > 80) {
      show("Burp! That was yummy! 🍖");
      lastDialogueTime = now;
    }
  });
}
