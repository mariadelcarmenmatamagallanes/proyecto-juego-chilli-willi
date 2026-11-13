import * as CANNON from 'cannon-es';

export class PhysicsWorld {
  constructor() {
    this.fixedTimeStep = 1 / 60;
    this.maxSubSteps = 6;
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.81, 0),
      allowSleep: true,
    });
    this.groundMaterial = new CANNON.Material('ground');
    this.dynamicMaterial = new CANNON.Material('dynamic');
    this.world.addContactMaterial(new CANNON.ContactMaterial(
      this.groundMaterial, this.dynamicMaterial,
      { friction: 0.3, restitution: 0.35 },
    ));
  }

  step(deltaSeconds) {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return;
    // Limit catch-up work after a hidden tab or a long frame.
    this.world.step(this.fixedTimeStep, Math.min(deltaSeconds, 0.1), this.maxSubSteps);
  }

  createTestBodies() {
    const floor = new CANNON.Body({
      mass: 0, material: this.groundMaterial, shape: new CANNON.Plane(),
    });
    floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    const cube = new CANNON.Body({
      mass: 1, material: this.dynamicMaterial,
      shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
      position: new CANNON.Vec3(2, 3, 0),
      angularFactor: new CANNON.Vec3(0, 0, 0),
    });
    this.world.addBody(floor);
    this.world.addBody(cube);
    return { cube, floor };
  }

  dispose() {
    for (const body of [...this.world.bodies]) this.world.removeBody(body);
  }
}

