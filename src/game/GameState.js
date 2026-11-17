export const PLAYING = 'PLAYING';
export const GAME_OVER = 'GAME_OVER';
export const VICTORY = 'VICTORY';

const STARTING_LIVES = 3;

export class GameState {
  #status = PLAYING;
  #lives = STARTING_LIVES;

  get status() { return this.#status; }
  get lives() { return this.#lives; }

  registerFall() {
    if (this.#status !== PLAYING) return false;

    this.#lives--;
    if (this.#lives === 0) this.#status = GAME_OVER;
    return true;
  }

  declareVictory() {
    if (this.#status !== PLAYING) return false;

    this.#status = VICTORY;
    return true;
  }

  restart() {
    this.#lives = STARTING_LIVES;
    this.#status = PLAYING;
  }
}
