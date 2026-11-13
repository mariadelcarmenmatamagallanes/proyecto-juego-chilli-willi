import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as CANNON from 'cannon-es';
import { Box3, Group, Scene, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PhysicsWorld } from '../src/physics/PhysicsWorld.js';
import { CollisionSystem } from '../src/physics/CollisionSystem.js';
import { PlayerController } from '../src/player/PlayerController.js';
import { InputHandler } from '../src/player/InputHandler.js';

function fixture() {
  const physics = new PhysicsWorld();
  const collisions = new CollisionSystem(physics);
  const floor = new CANNON.Body({
    mass: 0, shape: new CANNON.Plane(), material: physics.groundMaterial,
  });
  floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  collisions.addSurface(floor);
  const input = {
    direction: { x: 0, z: 0 }, jump: false, reset: false,
    getMovement() { return this.direction; },
    consumeJump() { const value = this.jump; this.jump = false; return value; },
    consumeReset() { const value = this.reset; this.reset = false; return value; },
  };
  const visual = new Group();
  const player = new PlayerController({
    physics, collisions, input, visual, radius: 0.26, position: { x: 0, y: 0.26, z: 0 },
  });
  const advance = (seconds, fps = 60) => {
    for (let i = 0; i < Math.round(seconds * fps); i++) {
      physics.step(1 / fps);
      player.syncVisual();
    }
  };
  advance(0.5);
  return { physics, collisions, floor, input, visual, player, advance };
}

test('WASD/arrows normalize diagonals, prevent key repeat, clear focus and dispose', () => {
  const target = new EventTarget();
  const input = new InputHandler(target);
  function key(type, code, repeat = false) {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat });
    target.dispatchEvent(event);
  }
  key('keydown', 'KeyW');
  key('keydown', 'ArrowRight');
  assert.ok(Math.abs(Math.hypot(...Object.values(input.getMovement())) - 1) < 1e-9);
  assert.ok(input.getMovement().z < 0);
  key('keydown', 'Space');
  assert.equal(input.consumeJump(), true);
  key('keydown', 'Space', true);
  assert.equal(input.consumeJump(), false);
  key('keyup', 'Space');
  key('keydown', 'Space');
  assert.equal(input.consumeJump(), true);
  target.dispatchEvent(new Event('blur'));
  assert.deepEqual(input.getMovement(), { x: 0, z: 0 });
  assert.equal(input.consumeJump(), false);
  key('keydown', 'KeyR');
  assert.equal(input.consumeReset(), true);
  assert.equal(input.consumeReset(), false);
  input.dispose();
  key('keydown', 'KeyW');
  assert.deepEqual(input.getMovement(), { x: 0, z: 0 });
});

test('acceleration, maximum speed, deceleration and exact visual/body sync', () => {
  const f = fixture();
  assert.ok(f.player.grounded);
  f.input.direction = { x: 1, z: 0 };
  f.advance(1 / 60);
  assert.ok(f.player.body.velocity.x > 0 && f.player.body.velocity.x < 0.5);
  f.advance(1);
  assert.ok(Math.abs(f.player.body.velocity.x - 2.2) < 0.01);
  assert.equal(f.visual.position.x, f.player.body.position.x);
  assert.equal(f.visual.position.y, f.player.body.position.y);
  f.input.direction = { x: 0, z: 0 };
  f.advance(0.5);
  assert.ok(Math.hypot(f.player.body.velocity.x, f.player.body.velocity.z) < 0.01);
});

test('jump requires ground, airborne presses are discarded, landing permits next jump', () => {
  const f = fixture();
  f.input.jump = true;
  f.advance(1 / 60);
  assert.equal(f.player.jumpCount, 1);
  assert.ok(f.player.body.velocity.y > 2.5);
  f.advance(0.15);
  f.input.jump = true;
  const velocity = f.player.body.velocity.y;
  f.advance(1 / 60);
  assert.equal(f.player.jumpCount, 1);
  assert.ok(f.player.body.velocity.y < velocity);
  f.advance(1);
  assert.ok(f.player.grounded);
  assert.equal(f.player.jumpCount, 1, 'airborne input must not cause auto-jump on landing');
  f.input.jump = true;
  f.advance(1 / 60);
  assert.equal(f.player.jumpCount, 2);
});

test('raycast rejects self, non-support bodies, walls and distant floor', () => {
  const f = fixture();
  assert.ok(f.collisions.getGround(f.player.body, f.player.radius));
  f.player.body.position.y = 0.4;
  assert.equal(f.collisions.getGround(f.player.body, f.player.radius), null);
  f.player.body.position.y = 2;
  const decoration = new CANNON.Body({
    mass: 0, shape: new CANNON.Box(new CANNON.Vec3(1, 0.1, 1)),
    position: new CANNON.Vec3(0, 1.72, 0),
  });
  f.physics.world.addBody(decoration);
  assert.equal(f.collisions.getGround(f.player.body, f.player.radius), null);
  f.collisions.surfaces.delete(f.floor);
  f.player.body.position.y = 0.26;
  const wall = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
  f.collisions.addSurface(wall);
  assert.equal(f.collisions.getGround(f.player.body, f.player.radius), null);
});

test('fixed-step controls give equivalent movement at 30/60/120 FPS', () => {
  const results = [30, 60, 120].map((fps) => {
    const f = fixture();
    f.input.direction = { x: Math.SQRT1_2, z: -Math.SQRT1_2 };
    f.advance(1, fps);
    return { x: f.player.body.position.x, speed: f.player.body.velocity.length() };
  });
  assert.ok(Math.max(...results.map(r => r.x)) - Math.min(...results.map(r => r.x)) < 0.01);
  assert.ok(results.every(r => r.speed < 2.21));
});

test('R resets physical pose and velocity; dispose removes listeners and body', () => {
  const f = fixture();
  f.input.direction = { x: 1, z: 0 };
  f.advance(1);
  f.input.reset = true;
  f.advance(1 / 60);
  assert.ok(Math.abs(f.player.body.position.x) < 1e-9);
  assert.equal(f.player.body.velocity.x, 0);
  const body = f.player.body;
  f.player.dispose();
  assert.ok(!f.physics.world.bodies.includes(body));
  f.advance(0.2);
  assert.equal(body.velocity.x, 0);
});

test('actual GLB: isolate penguin unchanged, land on real platform, jump and move only penguin', async () => {
  const bytes = fs.readFileSync(new URL('../public/assets/modelos/chilli_willi.glb', import.meta.url));
  const gltf = await new GLTFLoader().parseAsync(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '',
  );
  const scene = new Scene();
  scene.add(gltf.scene);
  scene.updateMatrixWorld(true);
  const penguin = gltf.scene.getObjectByName('Pinguino');
  const bounds = new Box3().setFromObject(penguin);
  const originalMin = bounds.min.clone();
  const center = bounds.getCenter(new Vector3());
  const igloo = gltf.scene.getObjectByName('Casa');
  const iglooPosition = igloo.getWorldPosition(new Vector3());
  const pivot = new Group();
  pivot.position.copy(center);
  scene.add(pivot);
  pivot.attach(penguin);
  assert.ok(new Box3().setFromObject(penguin).min.distanceTo(originalMin) < 1e-6);
  const physics = new PhysicsWorld();
  const collisions = new CollisionSystem(physics);
  const counts = collisions.addPlatformsFromScene(gltf.scene);
  assert.equal(counts.platforms, 3);
  assert.ok(counts.triangles > 0);
  const input = {
    jump: false, direction: { x: 0, z: 0 },
    consumeJump() { const r = this.jump; this.jump = false; return r; },
    consumeReset: () => false,
    getMovement() { return this.direction; },
  };
  const player = new PlayerController({
    physics, collisions, input, visual: pivot, position: center,
    radius: bounds.getSize(new Vector3()).y / 2,
  });
  for (let i = 0; i < 120; i++) physics.step(1 / 60);
  assert.ok(player.grounded, 'spawn must stand on the actual GLB platform');
  assert.ok(Math.abs(player.body.position.y - center.y) < 0.01);
  assert.ok(collisions.getGround(player.body, player.radius).distance < 0.6);
  input.jump = true;
  physics.step(1 / 60);
  assert.equal(player.jumpCount, 1);
  input.direction = { x: 1, z: 0 };
  for (let i = 0; i < 30; i++) physics.step(1 / 60);
  player.syncVisual();
  assert.ok(player.body.position.x > center.x + 0.1);
  assert.ok(igloo.getWorldPosition(new Vector3()).distanceTo(iglooPosition) < 1e-9);
  assert.ok(new Box3().setFromObject(penguin).getCenter(new Vector3()).distanceTo(pivot.position) < 1e-6);
});

