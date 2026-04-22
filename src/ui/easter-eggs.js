// ─── ChuChu Tamagotchi — Easter Eggs ───
// All 6 Easter egg triggers and effects.

import { bus } from '../engine/event-bus.js';
import { CONFIG } from '../config.js';

export function initEasterEggs(gameLoop) {
  const petContainer = document.getElementById('pet-container');
  const petSprite = document.getElementById('pet-sprite');

  let clickTimestamps = [];
  let lastInteractionTime = Date.now();
  let idleDanceTriggered = false;
  let konamiBuffer = [];

  // ─── 1. Nose Boop ───
  petSprite.addEventListener('click', (e) => {
    lastInteractionTime = Date.now();
    idleDanceTriggered = false;

    const rect = petSprite.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    // Nose zone: center 30%, vertical 40-70%
    const isNose = relX > 0.35 && relX < 0.65 && relY > 0.4 && relY < 0.7;

    if (isNose) {
      petContainer.classList.add('sneeze');
      bus.emit('dialogue:show', { text: "Achoo! 🤧", duration: 2000 });
      createParticleBurst(petContainer, 'sneeze-particle', 6);
      setTimeout(() => petContainer.classList.remove('sneeze'), 800);
      return; // Don't count nose boops toward rapid clicks
    }

    // ─── 2. Rapid Click / Dizzy ───
    const now = Date.now();
    clickTimestamps.push(now);
    clickTimestamps = clickTimestamps.filter(t => now - t < CONFIG.RAPID_CLICK_WINDOW_MS);

    if (clickTimestamps.length >= CONFIG.RAPID_CLICK_THRESHOLD) {
      clickTimestamps = [];
      petContainer.classList.add('dizzy');
      bus.emit('dialogue:show', { text: "Woah... everything is spinning! 😵‍💫", duration: 3000 });
      setTimeout(() => petContainer.classList.remove('dizzy'), 3000);
    }
  });

  // ─── 3. Secret Idle Dance ───
  setInterval(() => {
    if (idleDanceTriggered) return;
    const idleTime = Date.now() - lastInteractionTime;
    if (idleTime < CONFIG.IDLE_DANCE_DELAY_MS) return;

    const stats = gameLoop.stats;
    if (stats.hunger > 60 && stats.happiness > 60 && stats.energy > 60) {
      idleDanceTriggered = true;
      petContainer.classList.add('dancing');
      createMusicNotes(petContainer);

      // If player clicks during dance, embarrassed
      const interruptHandler = () => {
        petContainer.classList.remove('dancing');
        bus.emit('dialogue:show', { text: "Oh! You saw that?! 😳", duration: 2500 });
        petSprite.removeEventListener('click', interruptHandler);
      };
      petSprite.addEventListener('click', interruptHandler, { once: true });

      // Auto-stop after 5s
      setTimeout(() => {
        petContainer.classList.remove('dancing');
        petSprite.removeEventListener('click', interruptHandler);
      }, 5000);
    }
  }, 5000);

  // ─── 4. Weekend Party Hat ───
  function checkWeekend() {
    const day = new Date().getDay();
    if (day === 0 || day === 6) {
      petContainer.classList.add('weekend-party');
      // Only greet once per session
      if (!sessionStorage.getItem('chuchu_weekend_greeted')) {
        setTimeout(() => {
          bus.emit('dialogue:show', { text: "It's the weekend! Party time! 🎉", duration: 3500 });
        }, 2000);
        sessionStorage.setItem('chuchu_weekend_greeted', 'true');
      }
    } else {
      petContainer.classList.remove('weekend-party');
    }
  }
  checkWeekend();
  setInterval(checkWeekend, 60000);

  // ─── 5. Konami Code ───
  document.addEventListener('keydown', (e) => {
    lastInteractionTime = Date.now();
    idleDanceTriggered = false;

    konamiBuffer.push(e.code);
    if (konamiBuffer.length > CONFIG.KONAMI_CODE.length) {
      konamiBuffer.shift();
    }

    if (konamiBuffer.length === CONFIG.KONAMI_CODE.length &&
        konamiBuffer.every((key, i) => key === CONFIG.KONAMI_CODE[i])) {
      konamiBuffer = [];
      activateKonami();
    }
  });

  function activateKonami() {
    // Flash
    const flash = document.createElement('div');
    flash.className = 'konami-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);

    // Rainbow mode
    petContainer.classList.add('konami-rainbow');
    bus.emit('dialogue:show', { text: "I feel FABULOUS! 🌈✨", duration: 4000 });

    setTimeout(() => {
      petContainer.classList.remove('konami-rainbow');
    }, CONFIG.KONAMI_EFFECT_DURATION_MS);
  }

  // ─── Track interactions for idle detection ───
  document.addEventListener('click', () => {
    lastInteractionTime = Date.now();
    idleDanceTriggered = false;
  });

  // ─── Particle helpers ───
  function createParticleBurst(container, className, count) {
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = `particle ${className}`;
      p.style.setProperty('--angle', `${(360 / count) * i}deg`);
      p.style.setProperty('--delay', `${i * 40}ms`);
      container.appendChild(p);
      setTimeout(() => p.remove(), 800);
    }
  }

  function createMusicNotes(container) {
    const notes = ['🎵', '🎶', '♪', '♫'];
    for (let i = 0; i < 4; i++) {
      const n = document.createElement('div');
      n.className = 'music-note';
      n.textContent = notes[i % notes.length];
      n.style.setProperty('--delay', `${i * 400}ms`);
      n.style.left = `${30 + Math.random() * 40}%`;
      container.appendChild(n);
      setTimeout(() => n.remove(), 3000);
    }
  }
}
