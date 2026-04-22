// ─── ChuChu Tamagotchi — Stats Display ───
// Renders the three vital meter bars with color transitions.

import { bus } from '../engine/event-bus.js';

export function initStatsDisplay() {
  const hungerFill = document.getElementById('hunger-fill');
  const happinessFill = document.getElementById('happiness-fill');
  const energyFill = document.getElementById('energy-fill');
  const hungerValue = document.getElementById('hunger-value');
  const happinessValue = document.getElementById('happiness-value');
  const energyValue = document.getElementById('energy-value');

  function getBarColor(value) {
    if (value > 60) return 'var(--color-stat-high)';
    if (value > 30) return 'var(--color-stat-mid)';
    return 'var(--color-stat-low)';
  }

  function update(stats) {
    // Update fill widths and colors
    hungerFill.style.width = `${stats.hunger}%`;
    hungerFill.style.backgroundColor = getBarColor(stats.hunger);
    hungerValue.textContent = stats.hunger;

    happinessFill.style.width = `${stats.happiness}%`;
    happinessFill.style.backgroundColor = getBarColor(stats.happiness);
    happinessValue.textContent = stats.happiness;

    energyFill.style.width = `${stats.energy}%`;
    energyFill.style.backgroundColor = getBarColor(stats.energy);
    energyValue.textContent = stats.energy;
  }

  // Flash effect on action
  bus.on('action:applied', ({ effects }) => {
    if (effects.hunger > 0) flashBar('stat-hunger', 'flash-positive');
    else if (effects.hunger < 0) flashBar('stat-hunger', 'flash-negative');

    if (effects.happiness > 0) flashBar('stat-happiness', 'flash-positive');
    else if (effects.happiness < 0) flashBar('stat-happiness', 'flash-negative');

    if (effects.energy > 0) flashBar('stat-energy', 'flash-positive');
    else if (effects.energy < 0) flashBar('stat-energy', 'flash-negative');
  });

  function flashBar(id, flashClass) {
    const el = document.getElementById(id);
    el.classList.add(flashClass);
    setTimeout(() => el.classList.remove(flashClass), 400);
  }

  // Subscribe to ticks
  bus.on('tick', ({ stats }) => update(stats));
}
