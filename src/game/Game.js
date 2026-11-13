import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PhysicsWorld } from '../physics/PhysicsWorld.js';

export class Game {
  constructor({ physicsDebug = false } = {}) {
    this.disposed = false;
    this.previousTime = null;
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
    if (physicsDebug) this.enablePhysicsDebug();
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
      console.info('Modelo cargado correctamente');
    }, undefined, (error) => {
      if (!this.disposed) console.error('Error al cargar el modelo 3D:', modelPath, error);
    });
  }

  enablePhysicsDebug() {
    this.debugBodies = this.physics.createTestBodies();
    this.debugMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true }),
    );
    this.debugMesh.position.copy(this.debugBodies.cube.position);
    this.scene.add(this.debugMesh);
    const floor = new THREE.GridHelper(10, 10);
    this.scene.add(floor);
    console.info('[Fisica] Prueba activa: cubo desde y=3, suelo y=0, gravedad -9.81.');
    let reported = false;
    this.debugBodies.cube.addEventListener('collide', (event) => {
      if (!reported && event.body === this.debugBodies.floor) {
        reported = true;
        console.info('[Fisica] Contacto cubo/suelo detectado.');
      }
    });
  }

  update(time) {
    if (this.disposed) return;
    const delta = this.previousTime === null ? 0 : (time - this.previousTime) / 1000;
    this.previousTime = time;
    this.physics.step(delta);
    if (this.debugMesh) {
      this.debugMesh.position.copy(this.debugBodies.cube.interpolatedPosition);
      this.debugMesh.quaternion.copy(this.debugBodies.cube.interpolatedQuaternion);
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
    this.physics.dispose();
    this.disposeObjects(this.scene);
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

