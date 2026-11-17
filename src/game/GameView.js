import { MAX_HEALTH, VICTORY } from './GameState.js';

const illustrations = {
  start: ['chilliwilly.jpeg', 'Chilli Willy'],
  victory: ['ganaste.jpeg', '¡Ganaste!'],
  defeat: ['perdiste.jpeg', '¡Perdiste!'],
};

export class GameView {
  constructor(onPlay) {
    this.root = document.createElement('div');
    this.root.className = 'game-ui';

    this.stats = document.createElement('div');
    this.stats.className = 'game-ui__stats';
    this.stats.setAttribute('role', 'status');
    this.stats.hidden = true;
    this.lives = document.createElement('p');
    this.health = document.createElement('p');
    this.stats.append(this.lives, this.health);

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
    this.root.append(this.stats, this.hint, this.screen);
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

  showPlaying(state) {
    this.screen.hidden = true;
    this.hint.hidden = false;
    this.updateStats(state);
  }

  updateStats({ lives, health }) {
    this.lives.textContent = 'Oportunidades: ' + lives;
    this.health.textContent = 'Vida: ' + health + ' / ' + MAX_HEALTH;
    this.stats.hidden = false;
  }

  showResult(status) {
    this.showScreen(status === VICTORY ? 'victory' : 'defeat', 'Volver a jugar');
  }

  dispose() {
    this.button.removeEventListener('click', this.onPlay);
    this.root.remove();
  }
}
