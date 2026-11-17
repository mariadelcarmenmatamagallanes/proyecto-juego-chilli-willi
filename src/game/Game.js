
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PhysicsWorld } from '../physics/PhysicsWorld.js';
import { CollisionSystem } from '../physics/CollisionSystem.js';
import { InputHandler } from '../player/InputHandler.js';
import { PlayerController } from '../player/PlayerController.js';
import { GameState, PLAYING } from './GameState.js';
import { GameView } from './GameView.js';

const GOAL_RADIUS = 0.55;

export class Game {
  constructor({ physicsDebug = false } = {}) {
    this.disposed = false;
    this.previousTime = null;
    this.physicsDebug = physicsDebug;

    this.state = new GameState();
    this.started = false;

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
    this.renderer.domElement.tabIndex = -1;
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
    this.input = new InputHandler(window, { allowReset: false });
    this.input.setEnabled(false);
    this.controls.enabled = false;
    this.view = new GameView(() => this.startGame());

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
      if (!this.disposed) this.view.loadFailed();
      return;
    }

    const root = level.value.scene;
    const template = ice.value.scene;
    this.scene.add(root);

    try {
      this.collisions.addPlatformsFromScene(root);
      const igloo = root.getObjectByName('Casa');
      if (!igloo) throw new Error('El GLB no contiene la entrada del iglú.');
      this.goalPosition = igloo.getWorldPosition(new THREE.Vector3());

      const { path, start } = this.createIcePath(root, template);
      this.setupPlayer(root, start);
      this.scene.add(path);
      this.view.ready();
    } catch (error) {
      this.collisions.dispose();
      root.removeFromParent();
      this.disposeObjects(root);
      this.disposeObjects(template);
      this.view.loadFailed();
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
    // Dejar huecos que requieran saltar entre plataformas.
    const spacing = 1.45;
    const bridgeX = (housePlatform.max.x + originalIce.min.x) / 2;
    const positions = [x + 4 * spacing, x + 3 * spacing, x + 2 * spacing, x + spacing, bridgeX];
    const path = new THREE.Group();
    path.name = 'CaminoDeHielo';

    const surfaces = positions.map((platformX, index) => {
      const platform = new THREE.Group();
      platform.name = index === 0 ? 'HieloInicio' : `HieloCamino${index}`;
      // La pieza junto al iglú es más estrecha para mantener un hueco a cada lado.
      const widthScale = platformX === bridgeX ? 0.5 : 1;
      platform.scale.x = widthScale;
      platform.position.set(platformX - center.x * widthScale, top - bounds.max.y, z - center.z);
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

    this.collisions.onFall(() => this.handleFall());

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

  startGame() {
    if (this.disposed || !this.player || this.isPlaying()) return;

    this.state.restart();
    this.player.reset();
    this.input.setEnabled(true);
    this.controls.enabled = true;
    this.previousTime = null;
    this.started = true;
    this.view.showPlaying(this.state.lives);
    this.renderer.domElement.focus({ preventScroll: true });
  }

  isPlaying() {
    return this.started && this.state.status === PLAYING;
  }

  handleFall() {
    if (!this.isPlaying() || !this.collisions.checkFall(this.player.body)) return;
    if (!this.state.registerFall()) return;

    this.view.updateLives(this.state.lives);
    this.input.clear();
    if (this.state.status === PLAYING) {
      this.player.reset();
    } else {
      this.finishGame();
    }
  }

  isAtGoal() {
    const { body, radius } = this.player;
    if (this.goalPosition.distanceToSquared(body.position) > GOAL_RADIUS ** 2) return false;
    const ground = this.collisions.getGround(body, radius);
    return ground?.body.userData.platform === 'Pltaforma_de_la_casita';
  }

  reachGoal() {
    if (!this.isPlaying() || !this.state.declareVictory()) return false;

    this.finishGame();
    return true;
  }

  finishGame() {
    this.input.setEnabled(false);
    this.controls.enabled = false;
    this.view.showResult(this.state.status);
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

    if (this.isPlaying()) {
      this.physics.step(delta);
      if (this.collisions.checkFall(this.player.body)) {
        this.collisions.notifyFall(this.player.body.position);
      } else if (this.isAtGoal()) {
        this.reachGoal();
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

    this.view.dispose();

    this.physics.dispose();

    this.disposeObjects(this.scene);
    this.scene.clear();

    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
