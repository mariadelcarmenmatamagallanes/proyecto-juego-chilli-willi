export const BLANKET = Object.freeze({ radius: 0.46, recovery: 30 });
export const CAMPFIRE = Object.freeze({ radius: 0.62, recovery: 25, cooldown: 8 });

export class Collectibles {
  constructor(items) {
    this.items = items.map(item => ({ ...item, consumed: false, readyAt: 0 }));
    this.elapsed = 0;
  }

  update(position, seconds, state) {
    if (Number.isFinite(seconds) && seconds > 0) this.elapsed += seconds;
    let changed = false;

    for (const item of this.items) {
      if (item.consumed || this.elapsed < item.readyAt) continue;
      const x = position.x - item.position.x;
      const y = position.y - item.position.y;
      const z = position.z - item.position.z;
      if (x * x + y * y + z * z > item.radius ** 2) continue;
      if (!state.recoverHealth(item.recovery)) continue;

      if (item.cooldown) item.readyAt = this.elapsed + item.cooldown;
      else item.consumed = true;
      changed = true;
    }
    return changed;
  }

  isConsumed(id) {
    return this.items.find(item => item.id === id)?.consumed === true;
  }

  reset() {
    this.elapsed = 0;
    for (const item of this.items) {
      item.consumed = false;
      item.readyAt = 0;
    }
  }
}
