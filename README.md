# Chilli Willi — Videojuego 3D Web

**Documentación v0.3 · Avance de Fase 1 · 13 de noviembre de 2026**  
**Materia:** Programación 4 · **Equipo:** Creatividad Digital + IA · **Semestre:** 2026

Chilli Willi es un videojuego de plataformas 3D para navegador. El jugador deberá guiar al pingüino por un entorno ártico hasta **llegar al iglú sin ser eliminado**.

## 1. Reglas del videojuego

- Cada partida inicia con tres oportunidades de caída.
- La primera caída deja dos oportunidades y la segunda deja una; ambas permiten reaparecer en una posición válida.
- La tercera caída elimina al personaje y termina la partida.
- Las cobijas y las fogatas permiten recuperar el nivel de vida.
- El nivel de vida y las oportunidades de caída son indicadores distintos; su relación sigue pendiente de definición. Recuperar vida no se interpreta como recuperar oportunidades.
- Alcanzar la zona de llegada del iglú activa la victoria.
- Las plataformas deberán ser superficies sólidas para el personaje.

El iglú sustituye al pergamino como meta. Cerillos, premios especiales y hielo que se rompe permanecen pendientes de definición.

Estas reglas describen el juego objetivo; la Fase 1 todavía no implementa sus mecánicas completas.

## 2. Tecnologías

| Tecnología | Estado verificado |
|---|---|
| Three.js | Renderizado y carga del modelo. Dependencia declarada: ^0.187.0. |
| JavaScript ES6 | Arranque, orquestador y física separados en módulos. |
| Vite | Declarado como ^8.3.5; compilación verificada con 8.3.5. |
| Cannon-es | **Ya instalado: 0.20.0; base física integrada en Fase 1.** |
| WebGL 2.0 | Compatibilidad requerida del navegador. |
| HTML y CSS | Base prevista para el HUD futuro. |

La implementación de Fase 1 no modificó package.json ni package-lock.json. No necesitas instalar Cannon-es otra vez para esta fase.

## 3. Fase 1: cimientos y arquitectura

| Tarea | Archivo | Resultado |
|---|---|---|
| 1.1 — RT-04 | src/physics/PhysicsWorld.js | Mundo físico, gravedad -9.81, materiales, paso fijo y prueba de cubo/suelo. |
| 1.2 — RT-08 | src/game/Game.js | Coordina escena, cámara, renderizador, luces, controles de cámara, modelo, física y bucle. |
| 1.3 — RT-08 | src/main.js | Punto de entrada de 10 líneas y limpieza durante recarga de módulos. |

La física usa un paso de 1/60 s, hasta seis subpasos y un límite de recuperación temporal de 0.1 s tras una pausa. Los materiales de prueba usan fricción 0.3 y restitución 0.35. Son valores iniciales sujetos a calibración.

El cubo y el suelo de prueba solo aparecen al activar el modo de depuración. No representan todavía las colisiones reales del escenario. El modelo visual no está vinculado a un controlador físico.

Se conservaron los modelos, texturas, escala, luces y encuadre de la presentación normal.

## 4. Arquitectura y trazabilidad

| Módulo | Responsabilidad | Requisitos | Avance |
|---|---|---|---|
| src/main.js | Inicio de la aplicación. | RT-08 | Aplicado. |
| src/game/Game.js | Escena, cámara, renderizador y bucle principal. | RT-01, RT-08 | Aplicado. |
| src/physics/PhysicsWorld.js | Mundo Cannon-es, materiales y simulación. | RT-04 | Aplicado. |
| src/player/PlayerController.js | Teclado, desplazamiento y salto. | RF-01, RT-04 | Propuesto. |
| src/physics/CollisionSystem.js | Suelo, raycasting, contactos y caídas. | RF-02, RF-03 | Propuesto. |
| src/objects/Collectibles.js | Cobijas y fogatas. | RF-04, RF-05 | Propuesto. |
| src/game/GameState.js | Oportunidades, vida y estados de partida. | RF-02, RF-06, RF-07 | Propuesto. |
| src/ui/HUD.js | Oportunidades restantes, vida y estado. | RF-08 | Propuesto. |

RF-09 requiere reaparición coordinada entre controlador, colisiones y estado de partida. Los estados objetivo son jugando, pausa, victoria y derrota.

La existencia de carpetas o archivos adicionales no acredita que sus funcionalidades estén implementadas.

## 5. Recursos visuales

| Recurso | Función | Formato previsto | Estado |
|---|---|---|---|
| Chilli Willi y escena base | Presentación del juego. | GLB / glTF 2.0. | El archivo public/assets/modelos/chilli_willi.glb carga correctamente. |
| Escenario y plataformas | Recorrido y superficies sólidas. | GLB y cuerpos físicos asociados. | Representación visual disponible; colisiones reales pendientes. |
| Iglú | Meta. | GLB. | Trigger de victoria pendiente. |
| Cobijas | Recuperación de vida. | GLB. | Diseño del equipo; lógica pendiente. |
| Fogatas | Recuperación de vida. | GLB. | Diseño del equipo; lógica pendiente. |

Los formatos previstos de cada recurso deben contrastarse con sus archivos reales. No se renombraron ni rediseñaron recursos. Se compararon por hash 16 archivos visuales de src/assets y public sin diferencias en la implementación entregada.

## 6. Ejecutar y comprobar

Desde la raíz del proyecto, donde está package.json:

    npm install
    npm run dev

npm install corresponde a la preparación de una copia nueva. Si las dependencias ya están instaladas, inicia directamente con npm run dev.

Abre la dirección que indique Vite. Para activar la prueba física, añade ?physicsDebug:

    http://localhost:5173/?physicsDebug

El puerto puede variar; usa el indicado en tu terminal. Sin el parámetro se conserva la presentación normal.

Para ejecutar las pruebas:

    node --test tests/physics-world.test.js

Para compilar:

    npm run build

Usa Node.js compatible con la versión de Vite del proyecto. La copia de trabajo se validó con Node.js 24.22.2. Consulta la [guía oficial de Vite](https://vite.dev/guide/) para compatibilidad.

Repositorio indicado en la documentación original: [proyecto-juego-chilli-willi](https://github.com/mariadelcarmenmatamagallanes/proyecto-juego-chilli-willi). Su acceso remoto no se verificó.

## 7. Validación realizada

- **En el proyecto real:** archivos main.js, Game.js y PhysicsWorld.js comparados con los entregados; tres pruebas automatizadas de física aprobadas después de la copia manual.
- **Prueba 1:** caída, contacto con suelo, rebote y reposo estable.
- **Prueba 2:** caída equivalente a 30, 60 y 120 FPS.
- **Prueba 3:** ignorar tiempos inválidos y limitar recuperación tras pausas largas.
- **En la copia de trabajo:** compilación correcta; modelo cargado y contacto cubo/suelo registrado en navegador, sin errores ni advertencias de consola.
- **Advertencia de compilación:** paquete JavaScript de 722.71 kB, superior a la referencia de 500 kB. No bloqueó la compilación.

La compilación y la revisión visual aún no se han repetido en el proyecto real después de la copia manual. Las pruebas físicas no validan por sí solas las mecánicas del personaje.

## 8. Pendientes de las siguientes fases

- Control del personaje, salto, cuerpo dinámico y detección de suelo sin doble salto.
- Cuerpos estáticos para plataformas reales y sincronización del personaje con su cuerpo físico.
- Contador de tres caídas, reaparición y derrota.
- Nivel de vida, cobijas, fogatas y parámetros de recuperación.
- Máquina de estados, pausa, HUD y trigger de victoria del iglú.
- Calibrar velocidad, salto, fricción, dimensiones y límites de caída.
- Calibrar raycasting: 0.6 unidades es solo una referencia inicial.
- Definir dispositivos de prueba y medir el objetivo de al menos 30 FPS.

Los presupuestos de referencia de la SRS (100,000–500,000 polígonos, 512 MB de RAM y texturas de hasta 2048 × 2048) requieren medición; no implican modificar los diseños.

## 9. Historial y documentación

| Versión | Fecha | Cambio |
|---|---|---|
| 0.1 | Noviembre de 2026 | Idea inicial con pergamino y coleccionables. |
| 0.2 | 13/11/2026 | Iglú como meta, tres caídas y recuperación con cobijas y fogatas. |
| 0.3 | 13/11/2026 | Arquitectura modular y especificación de física. Registro actualizado con Fase 1 aplicada y pruebas aprobadas. |

- [SRS v0.3 — requisitos y avance de implementación](SRS_v0.3.md).
- [Cannon-es — repositorio oficial](https://github.com/pmndrs/cannon-es).
- Base documental: README original del proyecto y acuerdos de la conversación «Diagnóstico proyecto Chilli Willi».

