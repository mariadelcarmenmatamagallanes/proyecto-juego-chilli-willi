# Proyecto Final: Chilli Willi — Videojuego 3D Web

**Especificación de Requisitos de Software (SRS)**

**Versión:** 0.3  
**Fecha:** 13 de noviembre de 2026  
**Materia:** Programación 4  
**Tecnologías:** Three.js, JavaScript, WebGL, Vite y Cannon-es (base integrada en Fase 1)  
**Equipo:** Creatividad Digital + Ingeniería de Software (IA)  
**Semestre:** 2026  
**Estándar:** Basado en IEEE 830  
**Estado:** Fase 1 aplicada al proyecto real. Fase 2 implementada y validada en copia de trabajo, pendiente de copiar al proyecto real. Diez pruebas automatizadas aprobadas en la copia. Mecánicas completas pendientes.

**Alcance de esta actualización:** registrar la Fase 1 aplicada y la Fase 2 entregada: controlador físico, teclado, suelo, plataformas y sincronización del personaje. Cannon-es ya estaba instalado. No se cambiaron dependencias ni recursos visuales.

**Procedencia:** SRS v0.3 de la conversación «Diagnóstico proyecto Chilli Willi», README original leído en el proyecto y verificación de la Fase 1. Los apartados siguientes conservan los requisitos objetivo; el registro de avance distingue lo implementado.

---

## 1. Introducción

### 1.1 Propósito

Este documento establece los requisitos funcionales, técnicos y arquitectónicos del videojuego **Chilli Willi**, desarrollado como proyecto final de Programación 4.

El objetivo es crear un videojuego de plataformas 3D ejecutable en un navegador web, donde el jugador controle a un pingüino que debe atravesar un entorno ártico hasta llegar a un iglú.

Durante el recorrido, el personaje deberá evitar caídas y podrá utilizar cobijas y fogatas para recuperar su nivel de vida.

### 1.2 Alcance

El sistema consiste en una aplicación web 3D desarrollada mediante Three.js y JavaScript, utilizando Vite como herramienta de desarrollo.

El videojuego incluirá:

- Personaje principal controlable.
- Escenario ártico tridimensional.
- Movimiento, saltos y gravedad.
- Detección y resolución de colisiones.
- Tres oportunidades de caída antes de la eliminación.
- Recuperación de vida mediante cobijas y fogatas.
- Iglú como objetivo final.
- Condiciones de victoria y derrota.
- Interfaz de usuario para visualizar el estado del jugador.

**Restricción:** se conservarán los modelos, escenarios, materiales y demás elementos visuales diseñados por el equipo de Creatividad Digital. Esta especificación no solicita cambios visuales.

---

## 2. Descripción general

### 2.1 Concepto del videojuego

Chilli Willi es un videojuego de plataformas 3D ambientado en un entorno ártico.

El jugador deberá guiar al pingüino a través de plataformas y superficies heladas hasta alcanzar un iglú.

Durante el recorrido, deberá administrar sus oportunidades de supervivencia y aprovechar los recursos de recuperación disponibles.

### 2.2 Objetivo principal

**Llegar al iglú sin ser eliminado.**

El iglú constituye la meta del recorrido. Cuando el personaje alcance la zona de activación correspondiente, el sistema deberá reconocer la condición de victoria.

### 2.3 Personaje principal

**Nombre:** Chilli Willi  
**Tipo:** Pingüino  
**Función:** Personaje controlable.

Capacidades:

- Desplazamiento horizontal.
- Salto.
- Aterrizaje sobre plataformas.
- Interacción con recursos.
- Reaparición después de caídas no definitivas.
- Llegada al iglú.

### 2.4 Sistema de supervivencia

El personaje inicia con tres oportunidades de caída.

Cada caída contabilizada consume una oportunidad. La tercera caída provoca la eliminación.

Adicionalmente, el personaje dispone de un nivel de vida que puede recuperarse mediante cobijas y fogatas.

La relación exacta entre el contador de caídas y el nivel de vida permanece pendiente de definición. No se consideran automáticamente equivalentes.

### 2.5 Recursos de recuperación

**Cobijas:** objetos coleccionables que incrementan el nivel de vida.

**Fogatas:** elementos del escenario que permiten recuperar vida mediante interacción.

Los modelos 3D de estos recursos ya fueron diseñados por el equipo.

---

## 3. Requisitos funcionales (RF)

| ID | Requisito | Descripción | Prioridad |
|---|---|---|---|
| RF-01 | Movimiento | Permitir desplazamiento horizontal y salto mediante controles de teclado. | Alta |
| RF-02 | Sistema de caídas | Registrar hasta tres caídas; la tercera provoca eliminación. | Alta |
| RF-03 | Plataformas y colisiones | Permitir aterrizajes válidos e impedir atravesar superficies sólidas. | Alta |
| RF-04 | Cobijas | Detectar su recolección y aplicar recuperación de vida. | Alta |
| RF-05 | Fogatas | Detectar interacción y aplicar recuperación de vida. | Alta |
| RF-06 | Victoria | Activar la victoria al alcanzar el iglú. | Alta |
| RF-07 | Derrota | Finalizar la partida cuando se contabilicen tres caídas. | Alta |
| RF-08 | HUD | Mostrar oportunidades restantes, nivel de vida y estado de la partida. | Alta |
| RF-09 | Reaparición | Reubicar al personaje en una posición válida después de una caída no definitiva. | Alta |

### 3.1 Criterios generales de comportamiento

**Movimiento:** el personaje responderá a las entradas del jugador utilizando el controlador de movimiento y el sistema de física.

**Colisiones:** las plataformas deberán impedir que el personaje atraviese las superficies consideradas sólidas.

**Caídas:** el sistema deberá identificar cuándo el personaje abandona el área jugable y registrar la caída correspondiente.

**Recuperación:** las cobijas y fogatas modificarán el nivel de vida conforme a parámetros configurables.

**Victoria:** alcanzar la zona de activación del iglú cambiará el estado de la partida a victoria.

**Derrota:** alcanzar la tercera caída cambiará el estado de la partida a derrota.

---

## 4. Reglas del videojuego

| ID | Regla |
|---|---|
| RN-01 | Cada partida inicia con tres oportunidades de caída. |
| RN-02 | Cada caída contabilizada consume una oportunidad. |
| RN-03 | La tercera caída provoca la eliminación. |
| RN-04 | Las cobijas permiten recuperar nivel de vida. |
| RN-05 | Las fogatas permiten recuperar nivel de vida. |
| RN-06 | El iglú constituye la meta final. |
| RN-07 | Alcanzar la zona de victoria del iglú completa el nivel. |
| RN-08 | Las plataformas deben funcionar como superficies sólidas. |
| RN-09 | Una caída no definitiva permite continuar la partida. |

### 4.1 Parámetros pendientes de definición

**Parámetros de supervivencia**

- Cantidad de vida recuperada por cobija.
- Cantidad de vida recuperada mediante fogata.
- Nivel máximo de vida.
- Relación entre nivel de vida y oportunidades de caída.
- Condiciones de activación y reutilización de las fogatas.
- Posición de reaparición.
- Comportamiento de cerillos y premios especiales de la versión anterior.

**Constantes de física**

Los siguientes parámetros serán configurables y se ajustarán empíricamente durante el desarrollo:

| Parámetro | Valor inicial o estado |
|---|---|
| Gravedad vertical | `-9.81` unidades/s², sujeto a escala del escenario |
| Fuerza o velocidad de salto | Pendiente de calibración |
| Velocidad máxima horizontal | Pendiente de calibración |
| Fricción del suelo | Pendiente de calibración |
| Distancia máxima de raycast para suelo | Referencia inicial: `0.6` unidades |
| Dimensiones del cuerpo físico | Pendiente de ajuste al modelo |
| Frecuencia de actualización física | Por definir |

**Umbrales y zonas de colisión**

- Distancia máxima para considerar al personaje en contacto con el suelo.
- Altura o límites del escenario que constituyen una caída.
- Dimensiones de los cuerpos físicos de plataformas.
- Dimensiones de la zona de activación del iglú.
- Dimensiones de las zonas de interacción con cobijas y fogatas.

La zona de victoria del iglú deberá funcionar como un **trigger**, sin necesidad de bloquear físicamente el movimiento del personaje.

Los valores propuestos no se consideran definitivos hasta completar las pruebas de movimiento y colisión.

---

## 5. Requisitos técnicos y no funcionales (RT)

### RT-01. Tecnología principal

El videojuego utilizará Three.js como biblioteca principal para el renderizado tridimensional.

Tecnologías previstas:

- JavaScript con módulos ES6.
- Three.js.
- WebGL 2.0.
- Vite.
- HTML y CSS.
- Cannon-es para la simulación física, sujeto a integración.

### RT-02. Ejecución web

El videojuego deberá ejecutarse en navegadores modernos compatibles con WebGL 2.0.

No requerirá instalar una aplicación de escritorio.

### RT-03. Gestión de modelos 3D

Los modelos tridimensionales se gestionarán preferentemente mediante archivos `.glb` compatibles con glTF 2.0.

Three.js utilizará `GLTFLoader` para cargar los modelos cuando corresponda.

Los archivos visuales existentes deberán conservarse sin alteraciones innecesarias.

### RT-04. Motor de física y movimiento

Se utilizará **Cannon-es** como motor de física para gestionar gravedad, movimiento dinámico, colisiones e inercia. La Fase 1 integra su base; la entrega de Fase 2 añade cuerpo del personaje, controles y soporte físico de las plataformas reales, verificados en copia de trabajo.

**Integración**

Cannon-es se integrará con Three.js mediante un bucle de actualización que sincronice las posiciones y orientaciones de los cuerpos físicos con sus representaciones visuales.

La simulación física deberá utilizar un paso temporal controlado para reducir comportamientos inconsistentes entre dispositivos.

**Cuerpos físicos**

- El personaje utilizará un cuerpo dinámico con geometría de colisión simplificada, preferentemente esférica o una composición equivalente a una cápsula.
- Las plataformas utilizarán cuerpos estáticos.
- Los cuerpos de colisión se ajustarán a las dimensiones relevantes de los modelos visuales.

Cannon-es no proporciona directamente una primitiva de cápsula equivalente a todos los motores de física; si se requiere esa geometría, deberá construirse mediante una composición compatible o aproximación validada.

**Detección de suelo**

Se implementará una comprobación vertical de contacto con el suelo mediante raycasting o detección de contactos del motor físico.

El sistema deberá evitar saltos adicionales no intencionales mientras el personaje se encuentre en el aire.

**Control**

Las entradas del teclado se traducirán a fuerzas o velocidades del cuerpo físico.

No se utilizará la modificación directa de coordenadas del modelo visual como mecanismo principal de movimiento.

**Colisiones**

El motor de física gestionará la respuesta a contactos con superficies sólidas.

El raycasting complementará la detección de suelo, pero no sustituirá la resolución física de colisiones.

### RT-05. Rendimiento

El objetivo será mantener al menos 30 FPS durante la ejecución en los dispositivos de prueba definidos por el equipo.

Se utilizarán como referencias iniciales:

- Presupuesto geométrico: 100,000 a 500,000 polígonos.
- Memoria RAM objetivo: máximo 512 MB.
- Texturas de hasta 2048 × 2048 píxeles.
- Compresión de modelos cuando sea aplicable.

Estas referencias deberán validarse mediante mediciones reales de rendimiento.

### RT-06. Compatibilidad

El proyecto utilizará una versión de Node.js compatible con la versión de Vite declarada en `package.json` y fijada en el archivo de bloqueo. Se verificó Vite 8.3.5 durante la compilación de la copia de trabajo.

Referencias de compatibilidad publicadas en la [guía oficial de Vite](https://vite.dev/guide/):

- Node.js 20.19 o superior dentro de la rama 20.
- Node.js 22.12 o superior.

La compatibilidad de versiones posteriores deberá comprobarse conforme a los requisitos de Vite.

### RT-07. Nomenclatura

Los archivos de recursos deberán utilizar nombres en minúsculas, sin espacios y preferentemente con guiones bajos. Los módulos JavaScript propuestos en RT-08 conservarán sus nombres en PascalCase; `main.js` será el punto de entrada.

Ejemplos:

- `chilli_willi.glb`
- `escenario_artico.glb`
- `cobija.glb`
- `fogata.glb`
- `iglu.glb`

Los nombres son ejemplos de convención y no implican renombrar archivos ya integrados.

### RT-08. Arquitectura modular del código

El código fuente seguirá el principio de separación de responsabilidades (*Single Responsibility Principle*, SRP), organizado en módulos ES6.

**Estructura propuesta**

```text
src/
├── main.js
├── game/
│   ├── Game.js
│   └── GameState.js
├── player/
│   └── PlayerController.js
├── physics/
│   ├── PhysicsWorld.js
│   └── CollisionSystem.js
├── objects/
│   └── Collectibles.js
└── ui/
    └── HUD.js
```

**Responsabilidades**

| Módulo | Responsabilidad | Trazabilidad |
|---|---|---|
| `main.js` | Punto de entrada de la aplicación. | RT-08 |
| `game/Game.js` | Inicialización de escena, cámara, renderizador y bucle principal. | RT-01, RT-08 |
| `player/PlayerController.js` | Movimiento, saltos y entradas del jugador. | RF-01, RT-04 |
| `player/InputHandler.js` | Teclado, normalización de direcciones, solicitud de salto y limpieza al perder el foco. Entregado en Fase 2. | RF-01 |
| `physics/PhysicsWorld.js` | Mundo físico, materiales, paso fijo y cuerpos de prueba. Implementado en Fase 1. | RT-04 |
| `physics/CollisionSystem.js` | Gestión de contactos, raycasting, suelo y detección de caídas. | RF-02, RF-03 |
| `objects/Collectibles.js` | Interacción con cobijas y fogatas. | RF-04, RF-05 |
| `ui/HUD.js` | Interfaz 2D superpuesta al renderizado 3D. | RF-08 |
| `game/GameState.js` | Estados de partida, oportunidades, victoria y derrota. | RF-02, RF-06, RF-07 |

**Estados previstos**

- `playing`: partida en ejecución.
- `paused`: partida suspendida temporalmente.
- `victory`: objetivo alcanzado.
- `game_over`: personaje eliminado.

La transición entre estados deberá ser controlada por `GameState.js`.

La reaparición del personaje se coordinará entre el controlador, el sistema de colisiones y el estado de la partida, conforme a RF-09.

Esta estructura constituye la arquitectura objetivo. La Fase 1 implementa main.js, game/Game.js y physics/PhysicsWorld.js. La entrega de Fase 2 añade player/PlayerController.js, player/InputHandler.js y física de plataformas/detección de suelo en physics/CollisionSystem.js, con validación en copia de trabajo. Caídas, coleccionables, estados y HUD siguen pendientes.

---

## 6. Inventario de recursos tridimensionales

| Recurso | Función | Formato técnico previsto | Estado |
|---|---|---|---|
| Chilli Willi | Personaje principal | `.glb` (glTF 2.0 binario) | Integración reportada en escena base |
| Escenario ártico | Entorno del juego | `.glb` y texturas `.png`, cuando corresponda | Escenario visible; carga dinámica por verificar |
| Iglú | Meta y condición de victoria | `.glb` | Pendiente de implementar trigger de victoria |
| Cobijas | Recuperación de vida | `.glb` | Modelo diseñado según el equipo; lógica pendiente según la planificación, no auditada |
| Fogatas | Recuperación de vida | `.glb` | Modelo diseñado según el equipo; lógica pendiente según la planificación, no auditada |
| Plataformas | Superficies de desplazamiento | Geometría 3D existente y cuerpos físicos asociados | Colisiones pendientes de verificar |

**Observaciones**

1. Los formatos indicados son los formatos previstos; deberán confirmarse mediante inspección de los archivos reales.
2. Los modelos visuales existentes no requieren rediseño.
3. El estado de diseño de un modelo no implica que su funcionalidad esté implementada.
4. La integración con Cannon-es deberá utilizar representaciones físicas compatibles con los modelos existentes.

---

## 7. Criterios de aceptación y pruebas

| ID | Prueba | Resultado esperado | Requisito |
|---|---|---|---|
| CP-01 | Movimiento horizontal | El pingüino responde al teclado. | RF-01 |
| CP-02 | Salto | El personaje puede saltar correctamente. | RF-01 |
| CP-03 | Doble salto | No se produce un salto adicional no permitido en el aire. | RF-01 |
| CP-04 | Aterrizaje | El personaje aterriza sin atravesar plataformas. | RF-03 |
| CP-05 | Primera caída | Las oportunidades pasan de 3 a 2. | RF-02 |
| CP-06 | Segunda caída | Las oportunidades pasan de 2 a 1. | RF-02 |
| CP-07 | Tercera caída | Se activa la eliminación. | RF-07 |
| CP-08 | Cobija | Se aplica recuperación de vida. | RF-04 |
| CP-09 | Fogata | Se aplica recuperación de vida. | RF-05 |
| CP-10 | Llegada al iglú | Se activa el estado de victoria. | RF-06 |
| CP-11 | HUD | Los indicadores muestran los valores correctos. | RF-08 |
| CP-12 | Reaparición | El personaje reaparece en una posición válida. | RF-09 |
| CP-13 | Sincronización física | El modelo visual sigue correctamente al cuerpo físico. | RT-04 |
| CP-14 | Rendimiento | Se alcanza el objetivo de FPS en el entorno de prueba. | RT-05 |

Los resultados deberán registrarse después de ejecutar las pruebas correspondientes.

---

## 8. Instalación y ejecución

### 8.1 Prerrequisitos

- Node.js compatible con Vite 8.
- Git.
- Navegador compatible con WebGL 2.0.
- Visual Studio Code u otro editor de código.

### 8.2 Clonar repositorio

```bash
git clone https://github.com/mariadelcarmenmatamagallanes/proyecto-juego-chilli-willi.git
cd proyecto-juego-chilli-willi
```

### 8.3 Instalar dependencias existentes

```bash
npm install
```

### 8.4 Dependencia física: estado actualizado

Cannon-es ya está instalado. El comando siguiente se conserva como referencia para incorporarlo a un proyecto que todavía no tenga la dependencia; no debe repetirse para la Fase 1 actual:

```bash
npm install cannon-es
```

**Estado actualizado:** Cannon-es 0.20.0 ya está instalado e integrado en la base física. No es necesario ejecutar el comando anterior otra vez para la Fase 1. No se modificaron `package.json` ni el archivo de bloqueo.

### 8.5 Ejecutar servidor de desarrollo

```bash
npm run dev
```

### 8.6 Generar versión de producción

```bash
npm run build
```

---

## 9. Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| 0.1 | Noviembre de 2026 | Especificación inicial con sistema de vidas, coleccionables y pergamino final. |
| 0.2 | 13/11/2026 | Cambio del objetivo al iglú; tres caídas; recuperación mediante cobijas y fogatas; actualización de requisitos. |
| 0.3 | 13/11/2026 | Incorporación de arquitectura modular, motor físico propuesto Cannon-es, parámetros de física, triggers, formatos técnicos y trazabilidad entre módulos y requisitos. |

---

## 10. Consideraciones finales

La versión 0.3 establece una especificación técnica más detallada para transformar el escenario 3D existente en un videojuego funcional.

Se mantienen como elementos fundamentales:

- Three.js como tecnología principal de renderizado.
- El iglú como objetivo final.
- Tres oportunidades de caída.
- Cobijas y fogatas como recursos de recuperación.
- Conservación de los diseños tridimensionales existentes.

La arquitectura modular y la integración propuesta con Cannon-es permitirán organizar el desarrollo y establecer responsabilidades técnicas entre los integrantes del equipo.

**La presente versión documenta requisitos y decisiones arquitectónicas propuestas; no certifica que las funcionalidades estén implementadas.**

La validación final deberá realizarse mediante revisión del código y ejecución de las pruebas definidas.

## 11. Referencias y notas de consolidación

- [Conversación de origen: Diagnóstico proyecto Chilli Willi](chatgpt-conversation://6af76ef3-7708-83e8-9aa1-a5b3d4587ab0).
- [Guía oficial de Vite](https://vite.dev/guide/): compatibilidad del entorno y comandos de desarrollo.
- [Repositorio oficial de Cannon-es](https://github.com/pmndrs/cannon-es): motor físico integrado en la base de Fase 1.

Esta actualización registra el avance de Fase 1 sin cambiar las reglas ni la numeración de requisitos de la v0.3. Los casos CP-01 a CP-14 son criterios de aceptación del juego completo y siguen pendientes de validación; las pruebas de cubo/suelo no acreditan por sí mismas el comportamiento del personaje.

## 12. Registro histórico de cierre — Fase 1

| Tarea | Resultado | Validación |
|---|---|---|
| 1.1 — RT-04 | PhysicsWorld.js: gravedad -9.81, materiales, paso fijo 1/60 s y prueba cubo/suelo. | Caída, contacto, rebote y reposo aprobados. |
| 1.2 — RT-08 | Game.js coordina escena, cámara, renderizador, controles de cámara, modelo y física. | Compilación y navegador verificados en la copia de trabajo. |
| 1.3 — RT-08 | main.js inicia Game; 10 líneas y limpieza al recargar módulos. | Aplicado y comparado por hash en el proyecto real. |

También se aprobaron pruebas de equivalencia a 30/60/120 FPS y de tiempos inválidos/pausas largas. Las tres pruebas automatizadas se ejecutaron con éxito en el proyecto real después de copiar los archivos.

La compilación y la revisión visual se realizaron en la copia de trabajo; no se han repetido después de la copia manual en el proyecto real. Se registró carga correcta del modelo y contacto cubo/suelo sin errores de consola. La compilación dejó una advertencia por paquete JavaScript de 722.71 kB.

Se verificaron 16 recursos visuales y los archivos de dependencias sin cambios en la implementación entregada. Cannon-es 0.20.0 ya estaba instalado y no se instaló de nuevo.

Al cierre de Fase 1, ?physicsDebug activaba el cubo y suelo de prueba y el resto de mecánicas seguía pendiente. La sección 13 registra el avance posterior; en Fase 2 ese parámetro muestra la esfera del personaje y su raycast.

Pruebas: ejecutar `node --test tests/physics-world.test.js` desde la raíz del proyecto.

## 13. Entrega de Fase 2 — El protagonista confiable

**Fecha:** 13 de noviembre de 2026. **Estado:** implementada y verificada en copia de trabajo; todavía no aplicada al proyecto del Escritorio. Se conserva la versión de requisitos 0.3.

### 13.1 Alcance y trazabilidad

| Tarea del plan | Entrega | Requisito / criterio | Validación en copia |
|---|---|---|---|
| 2.1 | PlayerController.js: esfera dinámica, rotación física bloqueada, pivot del modelo sincronizado con el cuerpo. | RF-01, RT-04, CP-13 (personaje) | El GLB real conserva la transformación del pingüino y el resto de la escena permanece fijo. |
| 2.2 | InputHandler.js: WASD/flechas, dirección diagonal normalizada, fuerzas de aceleración/frenado. | RF-01, CP-01 | Pruebas de velocidad y equivalencia a 30/60/120 FPS aprobadas; desplazamiento revisado en navegador. |
| 2.3 | CollisionSystem.js: raycast vertical de menos de 0.6 unidades y salto con impulso solo desde suelo. | RF-01, CP-02, CP-03 | Salto aprobado en suelo; se rechazan pulsaciones en el aire y repetición por mantener espacio. |
| Soporte de integración | Tres cuerpos estáticos triangulados a partir de las plataformas originales. | RF-03, RT-04 | Aterrizaje y soporte en plataforma de inicio del GLB real verificados. Falta revisar todo el recorrido. |

Se usa el nodo Pinguino del archivo public/assets/modelos/chilli_willi.glb, que contiene la escena completa. Solo ese objeto pasa a un grupo móvil; sus materiales, geometría, escala y orientación se conservan. Se ajusta la cámara para enfocarlo y seguirlo sin editar los modelos.

Se registran las plataformas plataforma_extra, Pltaforma_de_la_casita y paltaformas_de_hielito, con 1418 triángulos en total. Sus geometrías originales se copian a cuerpos Trimesh estáticos; no se introduce un plano infinito que cubra huecos. La casa y demás decoraciones no reciben colisiones en esta fase.

### 13.2 Parámetros iniciales implementados

| Parámetro | Valor inicial |
|---|---|
| Masa del personaje | 1 unidad |
| Radio esférico | Media altura del modelo; aproximadamente 0.259908 unidades |
| Longitud del raycast | Radio + 0.025; aproximadamente 0.284908 unidades, menor de 0.6 |
| Superficie válida | Cuerpo registrado y normal vertical de al menos 0.6 |
| Validación para saltar | Superficie cercana y velocidad vertical absoluta menor de 0.2 unidades/s |
| Velocidad horizontal objetivo | 2.2 unidades/s |
| Aceleración / frenado en suelo | 16 / 14 unidades/s² |
| Aceleración / frenado en aire | 4 / 1 unidades/s² |
| Velocidad de salto | 3.2 unidades/s, aplicada mediante impulso |
| Contacto personaje/suelo | Fricción 0, restitución 0; frenado controlado mediante fuerzas |
| Simulación | Gravedad -9.81; paso fijo 1/60 s, seis subpasos y límite temporal de recuperación de 0.1 s |

Son valores iniciales ajustables y no reglas definitivas de dificultad. La esfera simplificada requiere revisión en bordes y pendientes.

WASD/flechas usan los ejes X/Z del escenario, sin cambiar de dirección al orbitar la cámara. Espacio requiere una nueva pulsación después de aterrizar. Se limpian las teclas al perder foco o cambiar la visibilidad. Se respetan campos de texto y combinaciones Ctrl/Alt/Meta.

R devuelve manualmente al inicio de prueba y limpia velocidades. Esta ayuda no implementa RF-02, RF-07 ni RF-09: no cuenta caídas, no consume vidas y no reemplaza la reaparición automática prevista.

### 13.3 Evidencia y límites

- Diez pruebas aprobadas en la copia de trabajo: tres de Fase 1 y siete de Fase 2, incluida integración con el GLB real.
- Compilación aprobada con Vite 8.3.5; advertencia de paquete JavaScript de aproximadamente 736.75 kB.
- Navegador: carga, movimiento con flechas, salto y reinicio revisados sin errores ni advertencias de consola.
- Los 16 recursos visuales y archivos de dependencias coinciden por hash con el proyecto inspeccionado.
- Falta copiar esta entrega al proyecto real y repetir allí las pruebas y la compilación.

Pruebas completas: `node --test tests/physics-world.test.js tests/player-controller.test.js`.

Permanecen pendientes las tres caídas y derrota, reaparición automática, nivel de vida, cobijas, fogatas, victoria en el iglú, estados y HUD. La validación del recorrido completo y de FPS en los dispositivos del equipo sigue pendiente. La apariencia del personaje no incorpora todavía marcha ni giro direccional.

