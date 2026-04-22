// ─── ChuChu Tamagotchi — Footer Display ───
// Active time and care quality trackers in the footer.

import { bus } from '../engine/event-bus.js';

export function initFooter(gameLoop) {
  const activeTimeEl = document.getElementById('active-time');
  const careQualityEl = document.getElementById('care-quality');
  const btnReset = document.getElementById('btn-reset');
  const modal = document.getElementById('reset-modal');
  const btnConfirm = document.getElementById('btn-confirm-reset');
  const btnCancel = document.getElementById('btn-cancel-reset');

  // Update footer info
  bus.on('stage:info', ({ careQuality, activeTime }) => {
    const mins = Math.floor(activeTime / 60);
    const secs = activeTime % 60;
    activeTimeEl.textContent = `Active: ${mins}:${String(secs).padStart(2, '0')}`;
    careQualityEl.textContent = `Care: ${careQuality}%`;
  });

  // Reset button
  btnReset.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  btnCancel.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  btnConfirm.addEventListener('click', () => {
    gameLoop.reset();
    location.reload();
  });

  // Click outside modal to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
}
