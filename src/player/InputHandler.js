const movementCodes = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight',
]);
const controlCodes = new Set([...movementCodes, 'Space', 'KeyR']);

export class InputHandler {
  constructor(target = window) {
    this.target = target;
    this.pressed = new Set();
    this.jumpRequested = false;
    this.resetRequested = false;
    this.onKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const tag = event.target?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || event.target?.isContentEditable) return;
      if (!controlCodes.has(event.code)) return;
      event.preventDefault();
      if (!event.repeat && !this.pressed.has(event.code)) {
        if (event.code === 'Space') this.jumpRequested = true;
        if (event.code === 'KeyR') this.resetRequested = true;
      }
      this.pressed.add(event.code);
    };
    this.onKeyUp = (event) => {
      this.pressed.delete(event.code);
      if (controlCodes.has(event.code)) event.preventDefault();
    };
    this.onBlur = () => this.clear();
    this.onVisibility = () => {
      if (this.document?.hidden) this.clear();
    };
    this.document = target.document;
    target.addEventListener('keydown', this.onKeyDown);
    target.addEventListener('keyup', this.onKeyUp);
    target.addEventListener('blur', this.onBlur);
    this.document?.addEventListener('visibilitychange', this.onVisibility);
  }

  getMovement() {
    const has = (...codes) => codes.some((code) => this.pressed.has(code));
    let x = Number(has('KeyD', 'ArrowRight')) - Number(has('KeyA', 'ArrowLeft'));
    let z = Number(has('KeyS', 'ArrowDown')) - Number(has('KeyW', 'ArrowUp'));
    const length = Math.hypot(x, z);
    if (length > 0) { x /= length; z /= length; }
    return { x, z };
  }

  consumeJump() {
    const requested = this.jumpRequested;
    this.jumpRequested = false;
    return requested;
  }

  consumeReset() {
    const requested = this.resetRequested;
    this.resetRequested = false;
    return requested;
  }

  clear() {
    this.pressed.clear();
    this.jumpRequested = false;
    this.resetRequested = false;
  }

  dispose() {
    this.clear();
    this.target.removeEventListener('keydown', this.onKeyDown);
    this.target.removeEventListener('keyup', this.onKeyUp);
    this.target.removeEventListener('blur', this.onBlur);
    this.document?.removeEventListener('visibilitychange', this.onVisibility);
  }
}

