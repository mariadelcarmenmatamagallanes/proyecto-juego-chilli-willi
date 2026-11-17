import * as CANNON from 'cannon-es';
import { Vector3 } from 'three';

export class CollisionSystem {
  constructor(physics) {
    this.physics = physics;
    this.surfaces = new Set();
    this.from = new CANNON.Vec3();
    this.to = new CANNON.Vec3();
    this.fallListeners = new Set();
  }

  addSurface(body) {
    // A rotated body may still carry the bounds calculated by its constructor.
    body.aabbNeedsUpdate = true;
    this.surfaces.add(body);
    this.physics.world.addBody(body);
    return body;
  }

  addPlatformsFromScene(root) {
    // These are the platform nodes in the team's existing combined GLB.
    const names = ['plataforma_extra', 'Pltaforma_de_la_casita', 'paltaformas_de_hielito'];
    const bodies = names.map((name) => {
      const platform = root.getObjectByName(name);
      if (!platform) throw new Error('No se encontro la plataforma: ' + name);
      return this.createPlatformBody(platform);
    });

    for (const body of bodies) this.addSurface(body);
    const triangles = bodies.reduce((total, body) => total + body.shapes[0].indices.length / 3, 0);
    return { platforms: names.length, triangles };
  }

  createPlatformBody(platform) {
    platform.updateWorldMatrix(true, true);
    const vertices = [];
    const indices = [];
    const point = new Vector3();

    platform.traverse((mesh) => {
      if (!mesh.isMesh) return;
      const positions = mesh.geometry.getAttribute('position');
      const offset = vertices.length / 3;
      for (let i = 0; i < positions.count; i++) {
        point.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld);
        vertices.push(point.x, point.y, point.z);
      }
      const index = mesh.geometry.getIndex();
      const count = index ? index.count : positions.count;
      for (let i = 0; i < count; i++) indices.push(offset + (index ? index.getX(i) : i));
    });

    if (!indices.length || vertices.length / 3 > 32767) {
      throw new Error('Geometria de plataforma no compatible: ' + platform.name);
    }
    const body = new CANNON.Body({
      mass: 0, material: this.physics.groundMaterial,
      shape: new CANNON.Trimesh(vertices, indices),
    });
    body.userData = { platform: platform.name };
    return body;
  }

  getSurfaceHeight(surface, x, z, minY, maxY) {
    this.from.set(x, maxY + 0.01, z);
    this.to.set(x, minY - 0.01, z);
    const hit = this.raycastGround(surface);
    return hit ? this.from.y - hit.distance : null;
  }

  getGround(body, radius, tolerance = 0.025) {
    const distance = radius + tolerance;
    if (distance >= 0.6) throw new Error('El raycast de suelo debe medir menos de 0.6 unidades.');
    this.from.copy(body.position);
    this.to.set(body.position.x, body.position.y - distance, body.position.z);
    return this.raycastGround();
  }

  raycastGround(surface) {
    let nearest = null;
    this.physics.world.raycastAll(this.from, this.to, { skipBackfaces: true }, (hit) => {
      if (!this.surfaces.has(hit.body) || hit.hitNormalWorld.y < 0.6) return;
      if (surface && hit.body !== surface) return;
      if (!nearest || hit.distance < nearest.distance) {
        nearest = { body: hit.body, distance: hit.distance };
      }
    });
    return nearest;
  }


  /**
   * Detecta si el cuerpo físico ha superado
   * el límite inferior del escenario.
   *
   * @param {CANNON.Body} playerBody
   * @returns {boolean}
   */
  checkFall(playerBody) {
    return playerBody.position.y < -10;
  }

  /**
   * Registra un observador de caídas.
   * Devuelve una función para cancelar la suscripción.
   *
   * @param {Function} callback
   * @returns {Function}
   */
  onFall(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('onFall requiere una función.');
    }

    this.fallListeners.add(callback);

    return () => {
      this.fallListeners.delete(callback);
    };
  }

  /**
   * Notifica a los observadores registrados.
   *
   * @param {CANNON.Vec3} position
   */
  notifyFall(position) {
    const snapshot = position.clone();

    for (const callback of [...this.fallListeners]) {
      callback(snapshot.clone());
    }
  }

  
  dispose() {
    for (const body of this.surfaces) {
      this.physics.world.removeBody(body);
    }

    this.surfaces.clear();
    this.fallListeners.clear();
  }
}


