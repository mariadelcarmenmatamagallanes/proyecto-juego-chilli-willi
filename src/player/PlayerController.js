import * as CANNON from 'cannon-es';

export class PlayerController {
  constructor({ physics, collisions, input, visual, position, radius = 0.26, config = {} }) {
    if (!(radius > 0 && radius + 0.025 < 0.6)) throw new Error('Radio del personaje no valido.');
    this.physics = physics;
    this.collisions = collisions;
    this.input = input;
    this.visual = visual;
    this.radius = radius;
    this.config = {
      maxSpeed: 2.2, acceleration: 16, deceleration: 14,
      airAcceleration: 4, airDeceleration: 1, jumpSpeed: 3.2, ...config,
    };
    this.spawn = new CANNON.Vec3(position.x, position.y, position.z);
    this.material = new CANNON.Material('player');
    this.contactMaterial = new CANNON.ContactMaterial(
      this.material, physics.groundMaterial, { friction: 0, restitution: 0 },
    );
    physics.world.addContactMaterial(this.contactMaterial);
    this.body = new CANNON.Body({
      mass: 1, shape: new CANNON.Sphere(radius), material: this.material,
      position: this.spawn.clone(), fixedRotation: true,
      linearDamping: 0, allowSleep: false,
    });
    this.body.updateMassProperties();
    physics.world.addBody(this.body);
    this.grounded = false;
    this.jumpCount = 0;
    this.force = new CANNON.Vec3();
    this.onPreStep = () => this.fixedUpdate();
    physics.world.addEventListener('preStep', this.onPreStep);
    this.syncVisual();
  }

  fixedUpdate() {
    const jump = this.input.consumeJump();
    if (this.input.consumeReset()) {
      this.reset();
      return;
    }
    const ground = this.collisions.getGround(this.body, this.radius);
    this.grounded = Boolean(ground) && Math.abs(this.body.velocity.y) < 0.2;
    if (jump && this.grounded) {
      this.body.applyImpulse(new CANNON.Vec3(
        0, this.body.mass * (this.config.jumpSpeed - this.body.velocity.y), 0,
      ));
      this.grounded = false;
      this.jumpCount++;
    }

    const direction = this.input.getMovement();
    const moving = Math.hypot(direction.x, direction.z) > 0;
    const limit = this.grounded
      ? (moving ? this.config.acceleration : this.config.deceleration)
      : (moving ? this.config.airAcceleration : this.config.airDeceleration);
    const dt = this.physics.fixedTimeStep;
    let ax = (direction.x * this.config.maxSpeed - this.body.velocity.x) / dt;
    let az = (direction.z * this.config.maxSpeed - this.body.velocity.z) / dt;
    const magnitude = Math.hypot(ax, az);
    if (magnitude > limit) { ax *= limit / magnitude; az *= limit / magnitude; }
    this.force.set(ax * this.body.mass, 0, az * this.body.mass);
    this.body.applyForce(this.force);
  }

  syncVisual() {
    // Both the model pivot and debug body use this exact physical pose.
    if (this.visual) {
      this.visual.position.copy(this.body.position);
      this.visual.updateMatrixWorld(true);
    }
  }

  reset() {
    this.body.position.copy(this.spawn);
    this.body.previousPosition.copy(this.spawn);
    this.body.interpolatedPosition.copy(this.spawn);
    this.body.velocity.setZero();
    this.body.angularVelocity.setZero();
    this.body.force.setZero();
    this.body.torque.setZero();
    this.body.aabbNeedsUpdate = true;
    this.grounded = false;
    this.body.wakeUp();
    this.syncVisual();
  }

  dispose() {
    this.physics.world.removeEventListener('preStep', this.onPreStep);
    this.physics.world.removeBody(this.body);
    this.physics.world.removeContactMaterial(this.contactMaterial);
  }
}

