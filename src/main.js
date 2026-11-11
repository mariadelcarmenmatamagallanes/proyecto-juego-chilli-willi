
/**
 * CHILLI WILLI - Primera escena 3D
 *
 * Tecnologías:
 * - JavaScript moderno (ES6)
 * - Three.js
 * - Vite
 *
 * Objetivo:
 * Mostrar el modelo 3D de Chilli Willy
 * y permitir mover la cámara con el mouse.
 *
 * Modelo:
 * public/assets/modelos/modelos_chilli_willy (1).glb
 */

// ============================================
// 1. IMPORTACIONES
// ============================================

// Importamos las herramientas de Three.js.
import * as THREE from 'three';

// Importamos los controles de cámara.
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Importamos el cargador de modelos GLB.
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


// ============================================
// 2. CONFIGURACIÓN DE LA PÁGINA
// ============================================

// Eliminamos los márgenes predeterminados.
document.body.style.margin = '0';

// Evitamos barras de desplazamiento.
document.body.style.overflow = 'hidden';


// ============================================
// 3. CREACIÓN DE LA ESCENA
// ============================================

// Creamos el espacio tridimensional.
const scene = new THREE.Scene();

// Establecemos el fondo oscuro original.
scene.background = new THREE.Color('#101827');


// ============================================
// 4. CREACIÓN DE LA CÁMARA
// ============================================

// Creamos una cámara con perspectiva.
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Conservamos la posición original.
camera.position.z = 5;


// ============================================
// 5. CREACIÓN DEL RENDERER
// ============================================

// Creamos el motor de renderizado.
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

// Ajustamos el tamaño del canvas.
renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

// Limitamos la densidad de píxeles a 2.
renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

// Añadimos el canvas a la página.
document.body.appendChild(renderer.domElement);


// ============================================
// 6. ILUMINACIÓN AMBIENTAL
// ============================================

// Luz ambiental original.
const ambientLight = new THREE.AmbientLight(
  0xffffff,
  0.5
);

// Añadimos la luz ambiental.
scene.add(ambientLight);


// ============================================
// 7. ILUMINACIÓN DIRECCIONAL
// ============================================

// Luz direccional original.
const directionalLight = new THREE.DirectionalLight(
  0xffffff,
  1
);

// Conservamos su posición.
directionalLight.position.set(5, 5, 5);

// Añadimos la luz a la escena.
scene.add(directionalLight);


// ============================================
// 8. CONTROLES DE CÁMARA
// ============================================

// Permitimos controlar la cámara con el mouse.
const controls = new OrbitControls(
  camera,
  renderer.domElement
);

// Activamos movimientos suaves.
controls.enableDamping = true;

// Conservamos el factor original.
controls.dampingFactor = 0.05;

// La cámara observa el centro de la escena.
controls.target.set(0, 0, 0);

// Aplicamos la configuración.
controls.update();


// ============================================
// 9. CARGADOR DEL MODELO 3D
// ============================================

// Creamos una instancia de GLTFLoader.
const loader = new GLTFLoader();

// Ruta exacta del archivo dentro de public.
const modelPath =
  '/assets/modelos/modelos_chilli_willy (1).glb';


// ============================================
// 10. CARGA DEL MODELO CHILLI WILLY
// ============================================

loader.load(

  modelPath,

  // ==========================================
  // CARGA EXITOSA
  // ==========================================

  (gltf) => {

    // Obtenemos el modelo 3D.
    const model = gltf.scene;

    // Conservamos la escala original.
    //
    // Si el modelo es demasiado grande
    // o demasiado pequeño, podemos usar:
    //
    // model.scale.set(x, y, z);
    //
    // Ejemplo:
    // model.scale.set(0.5, 0.5, 0.5);
    //
    // No modificamos la escala todavía.

    // Añadimos Chilli Willy a la escena.
    scene.add(model);

    // Confirmamos la carga en consola.
    console.log("Modelo cargado correctamente");

  },

  // ==========================================
  // PROGRESO DE CARGA
  // ==========================================

  (xhr) => {

    // Mostramos el progreso cuando el navegador
    // proporciona el tamaño total del archivo.
    if (xhr.total > 0) {

      const progress =
        (xhr.loaded / xhr.total) * 100;

      console.log(
        `Cargando modelo: ${progress.toFixed(1)}%`
      );

    }

  },

  // ==========================================
  // ERROR DE CARGA
  // ==========================================

  (error) => {

    console.error(
      "Error al cargar el modelo 3D:",
      error
    );

    console.error(
      "Verifica que el archivo exista en:",
      modelPath
    );

  }

);


// ============================================
// 11. ADAPTACIÓN AL TAMAÑO DE VENTANA
// ============================================

// Detectamos cambios en el tamaño del navegador.
window.addEventListener('resize', () => {

  // Actualizamos la proporción de la cámara.
  camera.aspect =
    window.innerWidth / window.innerHeight;

  // Recalculamos la proyección.
  camera.updateProjectionMatrix();

  // Ajustamos el tamaño del renderer.
  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  // Actualizamos la densidad de píxeles.
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );

});


// ============================================
// 12. RELOJ DE ANIMACIÓN
// ============================================

// Conservamos el reloj para futuras animaciones.
const clock = new THREE.Clock();


// ============================================
// 13. BUCLE DE ANIMACIÓN
// ============================================

// Esta función se ejecuta continuamente.
function animate() {

  // Solicitamos el siguiente frame.
  requestAnimationFrame(animate);

  // Medimos el tiempo transcurrido.
  // Disponible para futuras animaciones.
  const delta = clock.getDelta();

  // El modelo conserva su orientación original.
  // No aplicamos rotación automática.

  // Actualizamos OrbitControls.
  controls.update();

  // Dibujamos la escena.
  renderer.render(scene, camera);

}


// ============================================
// 14. INICIO DEL PROGRAMA
// ============================================

// Iniciamos el bucle de renderizado.
animate();

