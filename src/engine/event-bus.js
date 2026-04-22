// ─── ChuChu Tamagotchi — Event Bus ───
// Lightweight pub/sub using native EventTarget.
// Engine emits events, UI subscribes and re-renders.

class EventBus extends EventTarget {
  emit(eventName, detail = {}) {
    this.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  on(eventName, callback) {
    this.addEventListener(eventName, (e) => callback(e.detail));
  }

  off(eventName, callback) {
    this.removeEventListener(eventName, callback);
  }
}

// Singleton bus shared across all modules
export const bus = new EventBus();
