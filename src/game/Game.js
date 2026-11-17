
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PhysicsWorld } from '../physics/PhysicsWorld.js';
import { CollisionSystem } from '../physics/CollisionSystem.js';
import { InputHandler } from '../player/InputHandler.js';
import { PlayerController } from '../player/PlayerController.js';

export class Game {
  constructor({ physicsDebug = false } = {}) {
    this.disposed = false;
    this.previousTime = null;
    this.physicsDebug = physicsDebug;

    // Estado temporal para detectar una sola vez cada caída.
    this.fallDetected = false;

    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#101827');

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    this.resize();
    document.body.appendChild(this.renderer.domElement);

    this.scene.add(
      new THREE.AmbientLight(0xffffff, 0.5),
    );

    const light = new THREE.DirectionalLight(
      0xffffff,
      1,
    );

    light.position.set(5, 5, 5);
    this.scene.add(light);

    this.controls = new OrbitControls(
      this.camera,
      this.renderer.domElement,
    );

    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    this.physics = new PhysicsWorld();
    this.collisions = new CollisionSystem(this.physics);
    this.input = new InputHandler();

    this.addControlHint();

    this.loadModel();

    this.onResize = () => this.resize();

    window.addEventListener(
      'resize',
      this.onResize,
    );

    this.renderer.setAnimationLoop(
      (time) => this.update(time),
    );
  }

  async loadModel() {
    const loader = new GLTFLoader();
    const [level, ice] = await Promise.allSettled([
      loader.loadAsync('/assets/modelos/chilli_willi.glb'),
      loader.loadAsync('/assets/modelos/Plataforma_Hielo.glb'),
    ]);

    if (this.disposed || level.status === 'rejected' || ice.status === 'rejected') {
      for (const result of [level, ice]) {
        if (result.status === 'fulfilled') this.disposeObjects(result.value.scene);
        else if (!this.disposed) console.error('Error al cargar el escenario:', result.reason);
      }
      return;
    }

    const root = level.value.scene;
    const template = ice.value.scene;
    this.scene.add(root);

    try {
      this.collisions.addPlatformsFromScene(root);
      const { path, start } = this.createIcePath(root, template);
      this.setupPlayer(root, start);
      this.scene.add(path);
    } catch (error) {
      this.collisions.dispose();
      root.removeFromParent();
      this.disposeObjects(root);
      this.disposeObjects(template);
      console.error('No se pudo preparar el recorrido:', error);
    }
  }

  createIcePath(root, template) {
    const bounds = new THREE.Box3().setFromObject(template, true);
    if (bounds.isEmpty()) throw new Error('Plataforma_Hielo.glb no contiene geometría.');

    const originalIce = new THREE.Box3().setFromObject(
      root.getObjectByName('paltaformas_de_hielito'), true,
    );
    const housePlatform = new THREE.Box3().setFromObject(
      root.getObjectByName('Pltaforma_de_la_casita'), true,
    );
    const { x, z } = originalIce.getCenter(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const top = originalIce.max.y;
    // Los huecos del tramo recto son de unos 0.55 a lo largo del eje X.
    const spacing = 1.45;
    const bridgeX = (housePlatform.max.x + originalIce.min.x) / 2;
    const positions = [x + 4 * spacing, x + 3 * spacing, x + 2 * spacing, x + spacing, bridgeX];
    const path = new THREE.Group();
    path.name = 'CaminoDeHielo';

    const surfaces = positions.map((platformX, index) => {
      const platform = new THREE.Group();
      platform.name = index === 0 ? 'HieloInicio' : `HieloCamino${index}`;
      platform.position.set(platformX - center.x, top - bounds.max.y, z - center.z);
      platform.add(template.clone());
      path.add(platform);
      return this.collisions.createPlatformBody(platform);
    });

    for (const surface of surfaces) this.collisions.addSurface(surface);
    const startX = positions[0];
    const height = this.collisions.getSurfaceHeight(
      surfaces[0], startX, z, bounds.min.y + top - bounds.max.y, top,
    );
    if (height === null) throw new Error('La plataforma inicial no tiene suelo en el punto de inicio.');
    return { path, start: new THREE.Vector3(startX, height, z) };
  }

  setupPlayer(root, start) {
    const penguin = root.getObjectByName('Pinguino');
    if (!penguin) throw new Error('El GLB no contiene el objeto Pinguino.');

    const bounds = new THREE.Box3().setFromObject(penguin);
    const center = bounds.getCenter(new THREE.Vector3());
    const radius = bounds.getSize(new THREE.Vector3()).y / 2;
    const spawn = start.clone().add(new THREE.Vector3(0, radius + 0.005, 0));

    this.playerPivot = new THREE.Group();
    this.playerPivot.position.copy(center);
    this.scene.add(this.playerPivot);

    // El modelo mira a +Z en el GLB. El camino hacia la casa sigue -X.
    this.playerPivot.attach(penguin);
    this.playerPivot.rotation.y = -Math.PI / 2;

    this.player = new PlayerController({
      physics: this.physics,
      collisions: this.collisions,
      input: this.input,
      visual: this.playerPivot,
      position: spawn,
      radius,
    });

    // Observador temporal de caídas.
    this.collisions.onFall((position) => {
      console.log(
        '[FALL DETECTED]',
        position,
      );
    });

    this.camera.position
      .copy(spawn)
      .add(new THREE.Vector3(2.8, 2, 2.1));

    this.controls.target.copy(spawn);
    this.controls.update();

    this.lastPlayerPosition = spawn.clone();

    if (this.physicsDebug) {
      this.enablePhysicsDebug();
    }
  }

  // --------------------------------------------------
  // INDICACIONES DE CONTROL
  // --------------------------------------------------

  addControlHint() {
    this.hint = document.createElement('div');

    this.hint.textContent =
      'Mover: WASD / flechas · Saltar: espacio · Volver al inicio: R · Camara: mouse';

    Object.assign(this.hint.style, {
      position: 'fixed',
      bottom: '12px',
      left: '12px',
      color: 'white',
      background: '#101827cc',
      padding: '8px 12px',
      borderRadius: '6px',
      font: '14px system-ui',
      pointerEvents: 'none',
      maxWidth: 'calc(100% - 48px)',
    });

    document.body.appendChild(this.hint);
  }

  // --------------------------------------------------
  // DEPURACIÓN FÍSICA
  // --------------------------------------------------

  enablePhysicsDebug() {
    this.debugMesh = new THREE.Mesh(
      new THREE.SphereGeometry(
        this.player.radius,
        16,
        12,
      ),
      new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
      }),
    );

    this.debugMesh.position.copy(
      this.player.body.position,
    );

    this.scene.add(this.debugMesh);

    this.groundLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
      new THREE.LineBasicMaterial({
        color: 0xffff00,
      }),
    );

    this.scene.add(this.groundLine);
  }

  // --------------------------------------------------
  // ACTUALIZACIÓN DEL JUEGO
  // --------------------------------------------------

  update(time) {
    if (this.disposed) return;

    const delta = this.previousTime === null
      ? 0
      : (time - this.previousTime) / 1000;

    this.previousTime = time;

    // Simulación física.
    this.physics.step(delta);

    // Detectar una caída una sola vez.
    if (this.player) {
      const isFalling =
        this.collisions.checkFall(this.player.body);

      if (isFalling && !this.fallDetected) {
        this.fallDetected = true;

        this.collisions.notifyFall(
          this.player.body.position,
        );
      }

      // Permitir detectar otra caída después de un reset.
      if (!isFalling && this.fallDetected) {
        this.fallDetected = false;
      }
    }

    // Sincronización visual.
    if (this.player) {
      this.player.syncVisual();

      const position = this.playerPivot.position;

      const movement = position
        .clone()
        .sub(this.lastPlayerPosition);

      this.camera.position.add(movement);

      this.controls.target.copy(position);

      this.lastPlayerPosition.copy(position);

      if (this.debugMesh) {
        this.debugMesh.position.copy(
          this.player.body.position,
        );

        const points =
          this.groundLine.geometry.attributes.position;

        points.setXYZ(
          0,
          position.x,
          position.y,
          position.z,
        );

        points.setXYZ(
          1,
          position.x,
          position.y - this.player.radius - 0.025,
          position.z,
        );

        points.needsUpdate = true;

        this.groundLine.geometry
          .computeBoundingSphere();
      }
    }

    this.controls.update();

    this.renderer.render(
      this.scene,
      this.camera,
    );
  }

  // --------------------------------------------------
  // AJUSTE DE VENTANA
  // --------------------------------------------------

  resize() {
    this.camera.aspect =
      window.innerWidth / window.innerHeight;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight,
    );

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2),
    );
  }

  // --------------------------------------------------
  // LIBERACIÓN DE RECURSOS
  // --------------------------------------------------

  disposeObjects(root) {
    root.traverse((object) => {
      object.geometry?.dispose();

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      for (const material of materials) {
        if (!material) continue;

        for (const value of Object.values(material)) {
          if (value?.isTexture) {
            value.dispose();
          }
        }

        material.dispose();
      }
    });
  }

  dispose() {
    if (this.disposed) return;

    this.disposed = true;

    this.renderer.setAnimationLoop(null);

    window.removeEventListener(
      'resize',
      this.onResize,
    );

    this.controls.dispose();
    this.input.dispose();

    this.player?.dispose();
    this.collisions.dispose();

    this.hint.remove();

    this.physics.dispose();

    this.disposeObjects(this.scene);
    this.scene.clear();

    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
