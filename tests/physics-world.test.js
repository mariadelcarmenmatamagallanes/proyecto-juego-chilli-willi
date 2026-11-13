import test from 'node:test';
import assert from 'node:assert/strict';
import { PhysicsWorld } from '../src/physics/PhysicsWorld.js';

test('gravity, floor contact, bounce and stable resting position', () => {
  const physics = new PhysicsWorld();
  const { cube, floor } = physics.createTestBodies();
  let contacted = false;
  let bounced = false;
  cube.addEventListener('collide', ({ body }) => {
    if (body === floor) contacted = true;
  });
  physics.step(1 / 60);
  assert.ok(cube.position.y < 3, 'gravity must move the cube down');
  for (let i = 0; i < 600; i++) {
    physics.step(1 / 60);
    if (contacted && cube.velocity.y > 0.1) bounced = true;
    assert.ok(cube.position.y > 0.4, 'cube must not pass through the floor');
    assert.ok(Number.isFinite(cube.position.y));
  }
  assert.ok(contacted, 'floor contact must occur');
  assert.ok(bounced, 'cube must rebound after contact');
  assert.ok(Math.abs(cube.position.y - 0.5) < 0.02);
  physics.dispose();
  assert.equal(physics.world.bodies.length, 0);
});

test('fixed stepping gives equivalent free fall at 30, 60 and 120 FPS', () => {
  const heights = [30, 60, 120].map((fps) => {
    const physics = new PhysicsWorld();
    const { cube } = physics.createTestBodies();
    for (let i = 0; i < fps / 2; i++) physics.step(1 / fps);
    return cube.position.y;
  });
  assert.ok(Math.max(...heights) - Math.min(...heights) < 0.01);
});

test('invalid deltas are ignored and long pauses have bounded catch-up', () => {
  const physics = new PhysicsWorld();
  const { cube } = physics.createTestBodies();
  for (const delta of [0, -1, NaN, Infinity]) physics.step(delta);
  assert.equal(cube.position.y, 3);
  physics.step(300);
  assert.ok(cube.position.y > 2.9);
});

