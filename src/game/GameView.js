import { VICTORY } from './GameState.js';

const illustrations = {
  start: ['chilliwilly.jpeg', 'Chilli Willy'],
  victory: ['ganaste.jpeg', '¡Ganaste!'],
  defeat: ['perdiste.jpeg', '¡Perdiste!'],
};

export class GameView {
  constructor(onPlay) {
    this.root = document.createElement('div');
    this.root.className = 'game-ui';

    this.lives = document.createElement('p');
    this.lives.className = 'game-ui__lives';
    this.lives.setAttribute('role', 'status');
    this.lives.hidden = true;

    this.hint = document.createElement('p');
    this.hint.className = 'game-ui__hint';
    this.hint.textContent = 'Llega a la entrada del iglú · Mover: WASD / flechas · Saltar: Espacio';
    this.hint.hidden = true;

    this.screen = document.createElement('div');
    this.screen.className = 'game-ui__overlay';
    this.screen.setAttribute('role', 'dialog');
    this.screen.setAttribute('aria-modal', 'true');
    this.screen.setAttribute('aria-labelledby', 'game-screen-title');

    const card = document.createElement('div');
    card.className = 'game-ui__card';
    this.image = document.createElement('img');
    this.image.className = 'game-ui__image';
    this.image.id = 'game-screen-title';

    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.addEventListener('click', onPlay);
    this.onPlay = onPlay;
    card.append(this.image, this.button);
    this.screen.append(card);
    this.root.append(this.lives, this.hint, this.screen);
    document.body.append(this.root);
    this.showScreen('start', 'Cargando…', true);
  }

  showScreen(illustration, buttonLabel, disabled = false) {
    const [file, alt] = illustrations[illustration];
    this.image.src = '/assets/imagenes/' + file;
    this.image.alt = alt;
    this.button.textContent = buttonLabel;
    this.button.disabled = disabled;
    this.hint.hidden = true;
    this.screen.hidden = false;
    if (!disabled) this.button.focus();
  }

  ready() {
    this.showScreen('start', 'Jugar');
  }

  loadFailed() {
    this.showScreen('start', 'No se pudo cargar el escenario', true);
  }

  showPlaying(lives) {
    this.screen.hidden = true;
    this.hint.hidden = false;
    this.updateLives(lives);
  }

  updateLives(lives) {
    this.lives.hidden = false;
    this.lives.textContent = 'Oportunidades: ' + lives;
  }

  showResult(status) {
    this.showScreen(status === VICTORY ? 'victory' : 'defeat', 'Volver a jugar');
  }

  dispose() {
    this.button.removeEventListener('click', this.onPlay);
    this.root.remove();
  }
}
