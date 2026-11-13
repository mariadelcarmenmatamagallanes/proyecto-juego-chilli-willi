# Chilli Willi — Videojuego 3D Web

**Documentación v0.3 · Avance de Fases 1 y 2 · 13 de noviembre de 2026**  
**Materia:** Programación 4 · **Equipo:** Creatividad Digital + IA · **Semestre:** 2026

Chilli Willi es un videojuego de plataformas 3D para navegador. El jugador guía al pingüino por un entorno ártico para **llegar al iglú sin ser eliminado**.

> **Estado de esta entrega:** Fase 1 aplicada y probada en el proyecto real. Fase 2 implementada, probada y compilada en una copia de trabajo; pendiente de copiar al proyecto del Escritorio y comprobar allí. El ZIP incluye código, pruebas y documentación. No se alteraron modelos ni dependencias.

## 1. Reglas del juego objetivo

- La partida comienza con tres oportunidades de caída.
- La primera y segunda caída consumen una oportunidad y permiten reaparecer.
- La tercera caída elimina al personaje.
- Cobijas y fogatas permiten recuperar el nivel de vida.
- Nivel de vida y oportunidades de caída son indicadores distintos. Su relación y las cantidades de recuperación siguen pendientes de definición.
- Llegar a la zona del iglú activa la victoria.
- Las plataformas deben permitir aterrizar y sostener al personaje.

El iglú sustituye al pergamino. Cerillos, premios especiales e hielo que se rompe no son mecánicas confirmadas de esta versión.

## 2. Qué hicimos

### Fase 1 — Cimientos y arquitectura

| Tarea | Archivo | Resultado |
|---|---|---|
| 1.1 — RT-04 | src/physics/PhysicsWorld.js | Mundo físico, gravedad -9.81, materiales y paso fijo. |
| 1.2 — RT-08 | src/game/Game.js | Orquestador de escena, cámara, renderizado y física. |
| 1.3 — RT-08 | src/main.js | Entrada de 10 líneas y limpieza durante recarga de módulos. |

Tres pruebas físicas pasaron en el proyecto real después de aplicar la Fase 1.

### Fase 2 — El protagonista confiable

| Tarea | Archivo | Resultado en la copia de trabajo |
|---|---|---|
| 2.1 — RF-01 / RT-04 | src/player/PlayerController.js | Esfera dinámica, rotación física bloqueada y sincronización exacta del modelo con el cuerpo. |
| 2.2 — RF-01 | src/player/InputHandler.js | WASD/flechas normalizadas, aceleración y frenado con fuerzas físicas, manejo de foco y repetición de teclas. |
| 2.3 — CP-03 / RF-01 | src/physics/CollisionSystem.js | Raycast vertical menor de 0.6 unidades; salto solo desde suelo, sin salto adicional en el aire. |

El GLB cargado contiene la escena completa. Se separa únicamente el objeto Pinguino para moverlo, preservando su aspecto, escala y orientación. El resto del escenario permanece fijo.

Se incorporaron cuerpos estáticos triangulados a las tres plataformas existentes (1418 triángulos en total) para dar soporte al personaje y probar el salto en el escenario real. No se añadió un suelo infinito que oculte los huecos.

La cámara enfoca al pingüino y lo sigue; se conserva el control con mouse. Este ajuste del encuadre no modifica los modelos.

## 3. Cómo jugar en esta fase

| Control | Acción |
|---|---|
| W / flecha arriba | Mover hacia -Z del escenario. |
| S / flecha abajo | Mover hacia +Z del escenario. |
| A / flecha izquierda | Mover hacia -X. |
| D / flecha derecha | Mover hacia +X. |
| Espacio | Saltar desde el suelo. Hay que soltar y pulsar de nuevo para otro salto. |
| R | Volver al punto inicial de prueba. |
| Mouse | Orbitar la cámara con los controles existentes. |

Las direcciones usan los ejes del escenario; no cambian al orbitar la cámara. Al perder el foco se limpian las entradas para evitar movimiento atascado. Las combinaciones con Ctrl, Alt o Meta se reservan para el navegador.

**R es una ayuda de prueba:** aún no aplica vidas, contador de caídas ni reglas de reaparición. Si caes fuera de las plataformas, pulsa R.

El personaje conserva la orientación visual original; todavía no tiene animaciones de marcha ni giro según la dirección.

## 4. Tecnologías y configuración inicial

| Elemento | Estado o valor |
|---|---|
| Three.js | Dependencia declarada ^0.187.0; renderizado y carga del modelo. |
| Vite | Dependencia declarada ^8.3.5; compilación con 8.3.5. |
| Cannon-es | 0.20.0 ya instalado; simulación física integrada. |
| Gravedad | -9.81 unidades/s². |
| Paso físico | 1/60 s; hasta seis subpasos, recuperación temporal limitada a 0.1 s. |
| Radio del personaje | Calculado a partir de media altura del modelo: aproximadamente 0.259908 unidades. |
| Raycast | Desde el centro del cuerpo hasta radio + 0.025: aproximadamente 0.284908 unidades, menor de 0.6. |
| Normal de suelo | Componente vertical mínima 0.6; solo superficies registradas. |
| Salto | Velocidad inicial 3.2 unidades/s, aplicada como impulso. |
| Velocidad horizontal objetivo | Máximo 2.2 unidades/s con entradas normalizadas. |
| Aceleración / frenado en suelo | 16 / 14 unidades/s². |
| Aceleración / frenado en aire | 4 / 1 unidades/s². |
| Contacto del personaje con suelo | Fricción 0 y restitución 0; el controlador gestiona el frenado. |

Son parámetros iniciales configurables y pendientes de ajuste con el equipo. La simulación no depende de modificar directamente las coordenadas visuales para caminar: aplica fuerzas horizontales e impulso de salto al cuerpo físico.

La esfera es una aproximación del personaje y puede requerir calibración para bordes y pendientes. No se añadieron colisiones a la casa, pinos, cobijas ni fogatas en esta fase.

No se modificaron package.json ni package-lock.json, y no hace falta reinstalar Cannon-es.

## 5. Arquitectura y trazabilidad

| Archivo | Función | Estado |
|---|---|---|
| src/main.js | Entrada de la aplicación — RT-08. | Fase 1; sin cambio en Fase 2. |
| src/game/Game.js | Orquestación — RT-01, RT-08. | Actualizado para integrar al personaje y seguirlo con la cámara. |
| src/physics/PhysicsWorld.js | Mundo físico — RT-04. | Fase 1; sin cambio en Fase 2. |
| src/player/PlayerController.js | Movimiento, salto y sincronización — RF-01, RT-04. | Entregado en Fase 2. |
| src/player/InputHandler.js | Entradas de teclado — RF-01. | Entregado en Fase 2. |
| src/physics/CollisionSystem.js | Plataformas y suelo — RF-03, CP-03. | Entregado parcialmente; detección de caídas pendiente. |
| src/objects/Collectibles.js | Cobijas y fogatas — RF-04, RF-05. | Propuesto. |
| src/game/GameState.js | Caídas, vida, victoria y derrota — RF-02, RF-06, RF-07. | Propuesto. |
| src/ui/HUD.js | Vida, oportunidades y estado — RF-08. | Propuesto. |

RF-09 requiere la reaparición según reglas de partida; el reinicio manual R no la da por completada. Los estados objetivo siguen siendo jugando, pausa, victoria y derrota.

## 6. Recursos visuales

| Recurso | Formato | Estado |
|---|---|---|
| Escena cargada | public/assets/modelos/chilli_willi.glb | Archivo intacto; contiene personaje y escenario. |
| Pingüino | Nodo Pinguino dentro del GLB. | Sigue al cuerpo esférico sin alterar su geometría. |
| Plataformas | Nodos plataforma_extra, Pltaforma_de_la_casita y paltaformas_de_hielito. | Geometría intacta; copiada a cuerpos físicos estáticos. |
| Iglú, cobijas y fogatas | Modelos existentes del equipo. | Apariencia conservada; sus reglas de interacción siguen pendientes. |

Se compararon por hash los 16 recursos de src/assets y public: sin diferencias respecto al proyecto inspeccionado.

## 7. Instalar, ejecutar y probar

Usa Node.js compatible con Vite. La copia se validó con Node.js 24.22.2. Consulta la [guía oficial de Vite](https://vite.dev/guide/).

Desde la raíz del proyecto, donde está package.json:

    npm run dev

Abre la dirección indicada por Vite. Para mostrar la esfera física y la línea del raycast, añade ?physicsDebug al final:

    http://localhost:5173/?physicsDebug

Usa el puerto real que indique Vite. El parámetro de depuración ya muestra al personaje; sustituye a la antigua demostración visual del cubo de Fase 1. Sus pruebas automatizadas se conservan.

En una copia nueva sin dependencias, ejecuta primero npm install.

Pruebas de Fases 1 y 2:

    node --test tests/physics-world.test.js tests/player-controller.test.js

Compilación:

    npm run build

Repositorio indicado por el README original: [proyecto-juego-chilli-willi](https://github.com/mariadelcarmenmatamagallanes/proyecto-juego-chilli-willi). El acceso remoto no fue comprobado.

## 8. Qué comprobamos

**Diez pruebas automatizadas aprobadas en la copia de trabajo:**

1. Caída, contacto, rebote y reposo del cubo de Fase 1.
2. Caída equivalente a 30/60/120 FPS.
3. Tiempos inválidos y pausas largas.
4. Teclado, diagonales, repetición, pérdida de foco y limpieza.
5. Aceleración, velocidad, frenado y sincronización visual.
6. Salto desde suelo, rechazo en aire y siguiente salto tras aterrizar.
7. Raycast que ignora al propio personaje, objetos no registrados, paredes y suelo lejano.
8. Movimiento equivalente a 30/60/120 FPS.
9. Reinicio manual y retirada de cuerpo/listeners.
10. Integración con el GLB real: transformación visual preservada, soporte en plataforma, salto y movimiento exclusivo del pingüino.

En navegador se verificaron carga, desplazamiento con flechas, salto y reinicio, sin errores ni advertencias de consola. La compilación pasó con una advertencia de tamaño: paquete de aproximadamente 736.75 kB.

**Fase 2 aún no está aplicada al proyecto del Escritorio.** Tras copiar esta entrega hay que repetir los comandos de prueba y compilación en esa carpeta.

## 9. Qué falta

- Reglas de tres caídas, eliminación y reaparición automática.
- Nivel de vida, cantidades de recuperación y relación con oportunidades.
- Recolección de cobijas y activación/reutilización de fogatas.
- Trigger del iglú y condiciones de victoria.
- Estados de partida, pausa y HUD de vida/oportunidades.
- Revisar colisiones de obstáculos, bordes, pendientes y recorrido completo.
- Ajustar parámetros y validar el rendimiento en dispositivos del equipo.

El objetivo de rendimiento sigue siendo al menos 30 FPS. Los presupuestos geométricos, de memoria y texturas de la SRS son referencias para medir, no una solicitud de cambiar los diseños.

## 10. Historial y documentos

| Versión documental | Avance |
|---|---|
| 0.1 | Concepto inicial con pergamino. |
| 0.2 | Iglú, tres caídas, cobijas y fogatas. |
| 0.3 | Requisitos y arquitectura; registros de Fase 1 aplicada y Fase 2 entregada para aplicar. |

- [SRS v0.3 — requisitos completos y avance por fase](SRS_v0.3.md).
- [Cannon-es — repositorio oficial](https://github.com/pmndrs/cannon-es).
- LEEME.txt: pasos para copiar esta entrega al proyecto y revertirla.

La versión de requisitos se mantiene en 0.3; los registros de avance distinguen lo realizado y lo pendiente sin cambiar las reglas acordadas.

