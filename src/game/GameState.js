export const PLAYING = 'PLAYING';
export const GAME_OVER = 'GAME_OVER';
export const VICTORY = 'VICTORY';

const STARTING_LIVES = 3;
export const MAX_HEALTH = 100;
export const FALL_DAMAGE = 35;

export class GameState {
  #status = PLAYING;
  #lives = STARTING_LIVES;
  #health = MAX_HEALTH;

  get status() { return this.#status; }
  get lives() { return this.#lives; }
  get health() { return this.#health; }

  registerFall() {
    if (this.#status !== PLAYING) return false;

    this.#health = Math.max(0, this.#health - FALL_DAMAGE);

    if (this.#health === 0) {
      this.#lives--;

      if (this.#lives === 0) {
        this.#status = GAME_OVER;
      } else {
        this.#health = MAX_HEALTH;
      }
    }
    return true;
  }

  recoverHealth(points) {
    if (this.#status !== PLAYING || !Number.isFinite(points) || points <= 0) return 0;

    const recovered = Math.min(points, MAX_HEALTH - this.#health);
    this.#health += recovered;
    return recovered;
  }

  declareVictory() {
    if (this.#status !== PLAYING) return false;

    this.#status = VICTORY;
    return true;
  }

  restart() {
    this.#lives = STARTING_LIVES;
    this.#health = MAX_HEALTH;
    this.#status = PLAYING;
  }
}
