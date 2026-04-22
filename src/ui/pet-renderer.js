// ─── ChuChu Tamagotchi — Pet Renderer ───
// Renders ChuChu's sprite, state overlays, and action animations.

import { bus } from '../engine/event-bus.js';
import { STAGE_INFO } from '../engine/evolution.js';

// Pet "art" using CSS + emoji for zero-dependency rendering.
// Each stage has different visual characteristics applied via CSS classes.

export function initPetRenderer() {
  const petContainer = document.getElementById('pet-container');
  const petSprite = document.getElementById('pet-sprite');
  const petOverlay = document.getElementById('pet-overlay');
  const stageBadge = document.getElementById('stage-badge');
  const stateBadge = document.getElementById('state-badge');

  let currentStage = 'baby';
  let currentState = 'normal';

  function updateStageVisual(stage) {
    currentStage = stage;
    petContainer.className = `pet-container stage-${stage}`;
    applyStateClass(currentState);

    const info = STAGE_INFO[stage];
    if (info) {
      stageBadge.textContent = `${info.emoji} ${info.name}`;
    }
  }

  function applyStateClass(state) {
    currentState = state;
    // Remove old state classes
    petContainer.classList.remove('state-normal', 'state-sick', 'state-evolved');
    petContainer.classList.add(`state-${state}`);

    // Update state badge
    stateBadge.textContent = state.charAt(0).toUpperCase() + state.slice(1);
    stateBadge.className = `state-badge state-badge-${state}`;
  }

  // Action animations
  bus.on('action:applied', ({ action }) => {
    petSprite.classList.add(`anim-${action}`);
    const duration = action === 'play' ? 2000 : 1500;
    setTimeout(() => petSprite.classList.remove(`anim-${action}`), duration);
  });

  // State changes
  bus.on('state:changed', ({ to }) => {
    applyStateClass(to);
  });

  // Stage info updates
  bus.on('stage:info', ({ stage }) => {
    if (stage !== currentStage) {
      updateStageVisual(stage);
    }
  });

  // Evolution animation
  bus.on('stage:evolving', ({ from, to }) => {
    petContainer.classList.add('evolving');
    // After 5s, swap the visual
    setTimeout(() => {
      updateStageVisual(to);
    }, 5000);
    // Clean up after full animation
    setTimeout(() => {
      petContainer.classList.remove('evolving');
    }, CONFIG.EVOLUTION_INVULNERABILITY_MS);
  });

  // Stage change (after evolution completes)
  bus.on('stage:changed', ({ to }) => {
    updateStageVisual(to);
  });

  // Initialize
  updateStageVisual('baby');
}

// Need config for timeout
import { CONFIG } from '../config.js';
