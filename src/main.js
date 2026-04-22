// ─── ChuChu Tamagotchi — Main Entry Point ───
// Wires together the engine and UI modules.

import { GameLoop } from './engine/game-loop.js';
import { initStatsDisplay } from './ui/stats-display.js';
import { initActionsPanel } from './ui/actions-panel.js';
import { initPetRenderer } from './ui/pet-renderer.js';
import { initDialogueSystem } from './ui/dialogue.js';
import { initEasterEggs } from './ui/easter-eggs.js';
import { initFooter } from './ui/footer.js';

// ─── Boot ───
const game = new GameLoop();

// Initialize UI modules
initStatsDisplay();
initActionsPanel(game);
initPetRenderer();
initDialogueSystem();
initEasterEggs(game);
initFooter(game);

// Load saved state or start fresh
game.init();

// Start the game loop
game.start();

console.log('🐶 ChuChu is alive! Type window.__gameLoop to inspect state.');

if (window.location.search.includes('demo=1')) {
  game.reset(); // clear any neglected history
  game.stop();  // freeze natural decay to control the script

  // Frame 1: Normal State (waits 4 seconds)
  setTimeout(() => {
    // Frame 2: Sudden Sickness from Neglect
    console.log('DEMO: Triggering Sick state...');
    game.stats = { hunger: 0, happiness: 0, energy: 0 };
    game.tick(); // Apply state
  }, 4000);

  // Frame 3: Healing (begins after 8s total)
  setTimeout(() => {
    console.log('DEMO: Healing ChuChu...');
    document.querySelector('.action-btn.feed')?.click();
    document.querySelector('.action-btn.play')?.click();
  }, 8000);
  setTimeout(() => {
    document.querySelector('.action-btn.rest')?.click();
    game.stats = { hunger: 100, happiness: 100, energy: 100 };
    game.tick(); // Fully healed back to Normal
  }, 10000);

  // Frame 4: Evolution (triggers at 13s total)
  setTimeout(() => {
    console.log('DEMO: Triggering Evolution animation...');
    game.triggerEvolution('normal', 'evolved');
  }, 13000);

  // Frame 5: Post-Evolution Interactivity
  setTimeout(() => {
    document.querySelector('.action-btn.play')?.click();
  }, 19000);
  setTimeout(() => {
    document.querySelector('.action-btn.feed')?.click();
  }, 20000);
}
