import test from 'node:test';
import assert from 'node:assert/strict';
import { GameState, PLAYING, GAME_OVER, VICTORY } from '../src/game/GameState.js';

test('a new match starts with three lives; the third fall ends it', () => {
  const state = new GameState();
  assert.equal(state.status, PLAYING);
  assert.equal(state.lives, 3);
  for (const remaining of [2, 1, 0]) {
    assert.equal(state.registerFall(), true);
    assert.equal(state.lives, remaining);
    assert.equal(state.status, remaining ? PLAYING : GAME_OVER);
  }
  assert.equal(state.registerFall(), false);
  assert.equal(state.declareVictory(), false);
  assert.equal(state.lives, 0);
  assert.equal(state.status, GAME_OVER);
});

test('victory retains remaining lives and prevents additional transitions', () => {
  const state = new GameState();
  state.registerFall();
  assert.equal(state.declareVictory(), true);
  assert.equal(state.registerFall(), false);
  assert.equal(state.declareVictory(), false);
  assert.equal(state.lives, 2);
  assert.equal(state.status, VICTORY);
});

test('restart restores PLAYING and three lives after either ending', () => {
  const state = new GameState();
  state.registerFall();
  state.registerFall();
  state.registerFall();
  state.restart();
  assert.equal(state.status, PLAYING);
  assert.equal(state.lives, 3);
  state.declareVictory();
  state.restart();
  assert.equal(state.status, PLAYING);
  assert.equal(state.lives, 3);
});
