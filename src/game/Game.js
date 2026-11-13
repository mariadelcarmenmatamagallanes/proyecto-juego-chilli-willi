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
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#101827');
    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000,
    );
    this.camera.position.z = 5;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.resize();
    document.body.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    this.scene.add(light);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
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
    window.addEventListener('resize', this.onResize);
    this.renderer.setAnimationLoop((time) => this.update(time));
  }

  loadModel() {
    const modelPath = '/assets/modelos/chilli_willi.glb';
    new GLTFLoader().load(modelPath, (gltf) => {
      if (this.disposed) {
        this.disposeObjects(gltf.scene);
        return;
      }
      this.scene.add(gltf.scene);
      try {
        this.setupPlayer(gltf.scene);
      } catch (error) {
        console.error('No se pudo preparar al personaje:', error);
      }
      console.info('Modelo cargado correctamente');
    }, undefined, (error) => {
      if (!this.disposed) console.error('Error al cargar el modelo 3D:', modelPath, error);
    });
  }

  setupPlayer(root) {
    const penguin = root.getObjectByName('Pinguino');
    if (!penguin) throw new Error('El GLB no contiene el objeto Pinguino.');
    const surfaces = this.collisions.addPlatformsFromScene(root);
    const bounds = new THREE.Box3().setFromObject(penguin);
    const center = bounds.getCenter(new THREE.Vector3());
    const radius = bounds.getSize(new THREE.Vector3()).y / 2;
    this.playerPivot = new THREE.Group();
    this.playerPivot.position.copy(center);
    this.scene.add(this.playerPivot);
    // Reparent only the character, preserving its world pose and original materials.
    this.playerPivot.attach(penguin);
    this.player = new PlayerController({
      physics: this.physics, collisions: this.collisions, input: this.input,
      visual: this.playerPivot, position: center, radius,
    });
    this.camera.position.copy(center).add(new THREE.Vector3(0, 1.5, 3));
    this.controls.target.copy(center);
    this.controls.update();
    this.lastPlayerPosition = center.clone();
    if (this.physicsDebug) this.enablePhysicsDebug();
    console.info('[Jugador] Listo. Plataformas:', surfaces.platforms, 'Radio:', radius);
  }

  addControlHint() {
    this.hint = document.createElement('div');
    this.hint.textContent = 'Mover: WASD / flechas · Saltar: espacio · Volver al inicio: R · Camara: mouse';
    Object.assign(this.hint.style, {
      position: 'fixed', bottom: '12px', left: '12px', color: 'white',
      background: '#101827cc', padding: '8px 12px', borderRadius: '6px',
      font: '14px system-ui', pointerEvents: 'none', maxWidth: 'calc(100% - 48px)',
    });
    document.body.appendChild(this.hint);
  }

  enablePhysicsDebug() {
    this.debugMesh = new THREE.Mesh(
      new THREE.SphereGeometry(this.player.radius, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true }),
    );
    this.debugMesh.position.copy(this.player.body.position);
    this.scene.add(this.debugMesh);
    this.groundLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
      new THREE.LineBasicMaterial({ color: 0xffff00 }),
    );
    this.scene.add(this.groundLine);
  }

  update(time) {
    if (this.disposed) return;
    const delta = this.previousTime === null ? 0 : (time - this.previousTime) / 1000;
    this.previousTime = time;
    this.physics.step(delta);
    if (this.player) {
      this.player.syncVisual();
      const position = this.playerPivot.position;
      const movement = position.clone().sub(this.lastPlayerPosition);
      this.camera.position.add(movement);
      this.controls.target.copy(position);
      this.lastPlayerPosition.copy(position);
      if (this.debugMesh) {
        this.debugMesh.position.copy(this.player.body.position);
        const points = this.groundLine.geometry.attributes.position;
        points.setXYZ(0, position.x, position.y, position.z);
        points.setXYZ(1, position.x, position.y - this.player.radius - 0.025, position.z);
        points.needsUpdate = true;
        this.groundLine.geometry.computeBoundingSphere();
      }
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  disposeObjects(root) {
    root.traverse((object) => {
      object.geometry?.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (!material) continue;
        for (const value of Object.values(material)) {
          if (value?.isTexture) value.dispose();
        }
        material.dispose();
      }
    });
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
    window.removeEventListener('resize', this.onResize);
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

