// ─── ChuChu Tamagotchi — Actions Panel ───
// Feed/Play/Rest buttons with cooldown management.

import { bus } from '../engine/event-bus.js';
import { CONFIG } from '../config.js';

export function initActionsPanel(gameLoop) {
  const buttons = {
    feed: document.getElementById('btn-feed'),
    play: document.getElementById('btn-play'),
    rest: document.getElementById('btn-rest'),
  };

  // Click handlers
  for (const [action, btn] of Object.entries(buttons)) {
    btn.addEventListener('click', () => {
      const success = gameLoop.applyAction(action);
      if (!success) return;

      // Animate the button cooldown ring
      const ring = btn.querySelector('.cooldown-ring');
      ring.classList.add('active');
      btn.classList.add('on-cooldown');
      setTimeout(() => {
        ring.classList.remove('active');
        btn.classList.remove('on-cooldown');
        btn.classList.add('cooldown-pop');
        setTimeout(() => btn.classList.remove('cooldown-pop'), 200);
      }, CONFIG.ACTION_COOLDOWN_MS);
    });
  }

  // Toggle buttons enabled/disabled based on state
  bus.on('tick', ({ canAct }) => {
    for (const btn of Object.values(buttons)) {
      btn.disabled = !canAct;
    }
  });
}
