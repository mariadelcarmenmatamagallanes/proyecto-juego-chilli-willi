import test from 'node:test';
import assert from 'node:assert/strict';
import { GameState, GAME_OVER, MAX_HEALTH } from '../src/game/GameState.js';
import { BLANKET, CAMPFIRE, Collectibles } from '../src/objects/Collectibles.js';

const blanket = { x: 0, y: 0.2, z: 0 };
const campfire = { x: 2, y: 0.2, z: 0 };

function fixture() {
  return {
    state: new GameState(),
    items: new Collectibles([
      { id: 'blanket', position: blanket, ...BLANKET },
      { id: 'campfire', position: campfire, ...CAMPFIRE },
    ]),
  };
}

test('blanket reacts in three dimensions, stays at full health and is used once per match', () => {
  const { state, items } = fixture();
  assert.equal(items.update(blanket, 0, state), false);
  assert.equal(items.isConsumed('blanket'), false);

  state.registerFall();
  assert.equal(items.update({ ...blanket, y: blanket.y + BLANKET.radius + 0.01 }, 0, state), false);
  assert.equal(items.update(blanket, 0, state), true);
  assert.equal(state.health, 95);
  assert.equal(state.lives, 2);
  assert.equal(items.isConsumed('blanket'), true);
  assert.equal(items.update(blanket, 20, state), false);
  assert.equal(state.health, 95);

  items.reset();
  state.restart();
  assert.equal(state.health, MAX_HEALTH);
  assert.equal(state.lives, 3);
  assert.equal(items.isConsumed('blanket'), false);
});

test('campfire recovers on contact, can be reused after cooldown and caps health', () => {
  const { state, items } = fixture();
  state.registerFall();
  state.registerFall();
  assert.equal(items.update(campfire, 0, state), true);
  assert.equal(state.health, 55);
  assert.equal(items.update(campfire, 7.9, state), false);
  assert.equal(items.update(campfire, 0.1, state), true);
  assert.equal(state.health, 80);
  assert.equal(items.update(campfire, CAMPFIRE.cooldown, state), true);
  assert.equal(state.health, MAX_HEALTH);
  assert.equal(items.isConsumed('campfire'), false);
  assert.equal(state.lives, 1);

  state.registerFall();
  assert.equal(state.status, GAME_OVER);
  assert.equal(items.update(campfire, CAMPFIRE.cooldown, state), false);
  assert.equal(state.health, 65);
});
