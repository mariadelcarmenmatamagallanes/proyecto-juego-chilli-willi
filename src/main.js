import { Game } from './game/Game.js';

const game = new Game({
  physicsDebug: new URLSearchParams(window.location.search).has('physicsDebug'),
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => game.dispose());
}

