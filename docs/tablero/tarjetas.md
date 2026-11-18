# Tarjetas del tablero «Invernadero Encantado»

Archivo de carga para la skill `/tablero`. Cada tarjeta empieza con `## ` y una línea `Lista:`. En «Por hacer», el orden es la prioridad.

## Spec 04 · Validar la planta en el dominio
Lista: Hecho

- **Historia:** HU-1.1 · Registrar una planta. **Deuda:** T-02 (backlog de E1, sección «Deuda técnica»).
- **Objetivo:** las reglas de una planta nueva se comprueban en una función pura de `src/dominio/`, que la ruta usa antes de tocar la base de datos.

### Reglas

- **DEBE** crear `src/dominio/validaciones.js` con `validarPlanta(datos)`, que devuelve una lista de `{ campo, mensaje }`, vacía si la planta es válida.
- **DEBE** usar los mismos mensajes que el modelo `Planta` y devolverlos en el orden nombre, especie, ubicación e intervalo.
- **DEBE** tratar como vacío un texto con solo espacios.
- **DEBE** aceptar como intervalo solo números enteros mayores o iguales a 1.
- **DEBE** hacer que `POST /api/plantas` responda 400 con `{ "error": "Datos no válidos", "detalles": [...] }` si `validarPlanta` devuelve algo, sin llamar a `Planta.create`.
- **NO DEBE** quitar las validaciones del modelo: siguen como segunda barrera.
- **NO DEBE** cambiar los mensajes ni tocar `client/`.

### Criterios de aceptación

- **CA-04.1:** DADO nombre, especie, ubicación e intervalo 3, CUANDO se valida, ENTONCES la lista está vacía.
- **CA-04.2:** DADO una planta sin especie y con intervalo 0, CUANDO se valida, ENTONCES hay dos detalles: «La especie es obligatoria» y «El intervalo de riego debe ser de al menos 1 día», en ese orden.
- **CA-04.3:** DADO un nombre con solo espacios, CUANDO se valida, ENTONCES aparece «El nombre es obligatorio».
- **CA-04.4:** DADO un intervalo de 2.5 o «tres», CUANDO se valida, ENTONCES aparece «El intervalo de riego debe ser un número entero de días».
- **CA-04.5:** DADO un cuerpo sin especie, CUANDO se envía a `POST /api/plantas`, ENTONCES responde 400 con el detalle y no se crea ninguna planta.

### Verificación

| Criterio | Cómo se comprueba |
| --- | --- |
| CA-04.1 a CA-04.4 | Tests en `test/dominio/validaciones.test.js` |
| CA-04.5 | curl a la API y revisión del diff: la ruta llama a `validarPlanta` antes de `Planta.create` |

### Archivos

`src/dominio/validaciones.js` (nuevo) · `test/dominio/validaciones.test.js` (nuevo) · `src/routes/plantas.js`

## Spec 05 · Validar el riego en el dominio
Lista: Por hacer

- **Historia:** HU-1.2 · Registrar un riego. **Deuda:** T-05.
- **Objetivo:** las reglas de formato de un riego se comprueban en una función pura de `src/dominio/`, antes de buscar la planta en la base de datos.

### Reglas

- **DEBE** agregar a `src/dominio/validaciones.js` la función `validarRiego(datos, ahora)`, que devuelve una lista de `{ campo, mensaje }`.
- **DEBE** exigir `planta` con un identificador de 24 caracteres hexadecimales: «La planta es obligatoria» o «La planta no tiene un identificador válido».
- **DEBE** exigir `cantidadMl` entera y mayor que 0, con los mensajes del modelo `Riego`.
- **DEBE** aceptar `fecha` vacía (será hoy). Si viene, debe ser una fecha válida y no futura, usando `interpretarFecha` y `esFechaFutura` de `src/dominio/fechas.js`.
- **DEBE** hacer que `POST /api/riegos` responda 400 con el formato de error de la API si `validarRiego` devuelve algo, antes de buscar la planta.
- **NO DEBE** mover a esta función la regla de «no anterior al registro de la planta»: necesita la base de datos y sigue en la ruta.
- **NO DEBE** importar Mongoose en `src/dominio/`.

### Criterios de aceptación

- **CA-05.1:** DADO una planta válida y 500 ml sin fecha, CUANDO se valida, ENTONCES la lista está vacía.
- **CA-05.2:** DADO una cantidad de 0, -5 o 2.5, CUANDO se valida, ENTONCES aparece el mensaje de cantidad que corresponde.
- **CA-05.3:** DADO la fecha de mañana, CUANDO se valida, ENTONCES aparece «Un riego no puede tener fecha futura».
- **CA-05.4:** DADO hoy a las 23:59 con `ahora` a las 00:01 del mismo día, CUANDO se valida, ENTONCES no hay error de fecha.
- **CA-05.5:** DADO `planta: "123"`, CUANDO se valida, ENTONCES aparece «La planta no tiene un identificador válido».

### Verificación

| Criterio | Cómo se comprueba |
| --- | --- |
| CA-05.1 a CA-05.5 | Tests en `test/dominio/validaciones.test.js`, con `ahora` fijo |
| Uso en la ruta | Revisión del diff: `validarRiego` va antes de `Planta.findById` |

### Archivos

`src/dominio/validaciones.js` · `test/dominio/validaciones.test.js` · `src/routes/riegos.js`

## Spec 06 · Consultar una planta por su identificador
Lista: Por hacer

- **Historia:** HU-1.4 · Historial de riegos (apoyo). Hoy el frontend recibe los datos de la planta desde la lista; con este endpoint, el detalle puede pedirlos solo.
- **Objetivo:** `GET /api/plantas/:id` devuelve una planta, con los mismos errores que el historial de riegos.

### Reglas

- **DEBE** agregar `esIdValido(valor)` a `src/dominio/validaciones.js`: verdadero solo para 24 caracteres hexadecimales.
- **DEBE** crear `GET /api/plantas/:id`: 400 con `{ campo: "id", mensaje: "La planta no tiene un identificador válido" }` si el id no es válido, 404 con `{ "error": "Planta no encontrada" }` si no existe y 200 con la planta si existe.
- **DEBE** usar `esIdValido` también en `GET /api/plantas/:id/riegos`, en lugar de la comprobación actual.
- **NO DEBE** cambiar el frontend en esta spec.

### Criterios de aceptación

- **CA-06.1:** DADO `"665f1c2a9b1e8a0012345678"`, CUANDO se comprueba, ENTONCES `esIdValido` es verdadero; con `"123"`, `""` o `null`, falso.
- **CA-06.2:** DADO una planta registrada, CUANDO se pide por su id, ENTONCES responde 200 con sus datos.
- **CA-06.3:** DADO un id con formato válido que no existe, CUANDO se pide, ENTONCES responde 404.
- **CA-06.4:** DADO el id `abc`, CUANDO se pide la planta o su historial, ENTONCES los dos responden 400 con el mismo detalle.

### Verificación

| Criterio | Cómo se comprueba |
| --- | --- |
| CA-06.1 | Tests en `test/dominio/validaciones.test.js` |
| CA-06.2 a CA-06.4 | curl a la API |

### Archivos

`src/dominio/validaciones.js` · `test/dominio/validaciones.test.js` · `src/routes/plantas.js`

## HU-2.1 · Ver las plantas que necesitan agua
Lista: Backlog

Como cuidador, quiero ver qué plantas necesitan agua hoy, para regarlas sin revisar el historial de cada una.

- **Alcance:** PRD §4.3, épica E2.
- **Estado:** sin spec. Falta definir la regla de «sedienta» con el cliente y escribir sus criterios. **No se implementa hasta tener spec.**

## HU-2.2 · Poner una planta en reposo
Lista: Backlog

Como cuidador, quiero marcar una planta en reposo, para que no aparezca como sedienta mientras no necesita riego.

- **Alcance:** épica E2.
- **Estado:** sin spec. El PRD todavía no define qué es el reposo ni cuánto dura (pregunta abierta). **No se implementa hasta tener spec.**

## Spec 01 · Registrar plantas y riegos
Lista: Hecho

Backend de la épica E1. Ver `docs/specs/01-plantas-y-riegos.md`.

## Spec 02 · Frontend de la épica E1
Lista: Hecho

Pantallas «Plantas» y «Detalle de planta». Ver `docs/specs/02-frontend-e1.md` y `docs/AUDITORIA-frontend.md`.

## Spec 07 · Registrar un riego rápido desde la lista
Lista: Por hacer

- **Historia:** HU-1.8 · Registrar un riego rápido desde la lista (backlog de E1, CA-1.8.1 a CA-1.8.7).
- **Objetivo:** desde la lista de plantas, el cuidador anota un riego de hoy en un panel dentro de la fila, sin abrir el detalle.

### Reglas

- **DEBE** añadir a cada fila (tarjeta en el móvil) un botón secundario «Registrar riego», con nombre accesible «Registrar riego para <nombre>».
- **DEBE** abrir el panel dentro de la fila: en escritorio, como una franja bajo la fila; en el móvil, dentro de la tarjeta. Mientras el panel está abierto, el panel sustituye al botón de esa fila.
- **DEBE** mostrar en el panel el título «Riego para <nombre>», el campo «Cantidad (ml)» con 500 y el foco puesto, la ayuda «Se anota con la fecha de hoy.», el botón secundario «Guardar riego» y el enlace «Cancelar».
- **DEBE** permitir un solo panel abierto: abrir otro cierra el anterior sin guardar.
- **DEBE** registrar con `registrarRiego` de `client/src/api.js` (`POST /api/riegos`), enviando solo `planta` y `cantidadMl`.
- **DEBE** tratar las respuestas así: un 400 se muestra junto al campo con `repartirErrores`; un 404 muestra «No encontramos esa planta. Puede que se haya borrado.» y oculta «Guardar riego»; cualquier otro fallo, «No pudimos guardar el riego. Revisa tu conexión y vuelve a intentarlo.»
- **DEBE** usar los componentes `Campo` y `Mensaje` que ya existen, y solo variables de `tokens.css`.
- **NO DEBE** enviar `fecha` ni `cuidador`.
- **NO DEBE** cambiar el backend.
- **NO DEBE** cambiar el formulario «Registrar una planta». Su botón «Registrar planta» sigue siendo el único botón primario de la pantalla.
- **NO DEBE** volver a pedir la lista de plantas después de guardar un riego.

### Criterios de aceptación

- **CA-07.1 · Panel abierto** (CA-1.8.1): DADO la lista con «Helecho Lunar» y «Mandrágora», CUANDO pulsa «Registrar riego» en «Helecho Lunar», ENTONCES se abre el panel de esa fila con 500 ml, el foco en el campo, la ayuda, «Guardar riego» y «Cancelar», sin campos de fecha ni de cuidador. Abrir el panel de «Mandrágora» cierra el de «Helecho Lunar», y «Cancelar» cierra el panel sin registrar nada.
- **CA-07.2 · Guardando** (CA-1.8.2): DADO el panel con 500 ml, CUANDO pulsa «Guardar riego» y la respuesta no ha llegado, ENTONCES el botón dice «Guardando…» y está desactivado, el campo y «Cancelar» también, y otra pulsación no envía un segundo riego.
- **CA-07.3 · Éxito** (CA-1.8.3): DADO el panel con 500 ml, CUANDO el riego se registra, ENTONCES el panel se cierra, la fila muestra «Riego guardado para Helecho Lunar.», la lista no se mueve y el detalle de la planta tiene al principio un riego de hoy, de 500 ml y «sin cuidador».
- **CA-07.4 · Error de validación** (CA-1.8.4): DADO el panel, CUANDO guarda con 0, con el campo vacío o con 2,5, ENTONCES el panel sigue abierto con lo escrito, el campo tiene borde de error y debajo el mensaje de la API con icono, y no se registra ningún riego.
- **CA-07.5 · Error de conexión** (CA-1.8.5): DADO el panel con 500 ml y la API apagada, CUANDO pulsa «Guardar riego», ENTONCES el panel sigue abierto con 500 ml, muestra el mensaje de conexión y «Guardar riego» vuelve a estar activo.
- **CA-07.6 · Planta no encontrada** (CA-1.8.6): DADO el panel de una planta borrada después de cargar la lista, CUANDO pulsa «Guardar riego», ENTONCES el panel muestra «No encontramos esa planta. Puede que se haya borrado.», sin «Guardar riego», y no se registra nada.
- **CA-07.7 · Móvil a 390 px** (CA-1.8.7): DADO una pantalla de 390 px, CUANDO pasa por los estados de CA-07.1 a CA-07.6, ENTONCES el panel queda dentro de la tarjeta, el campo ocupa todo el ancho y abre el teclado numérico, botones y enlaces miden al menos 44 px de alto, y no hay desplazamiento horizontal.

### Pantallas

La estructura sale del wireframe (qué hay, en qué orden y con qué textos), el estilo de `DESIGN.md` y el comportamiento de los criterios. Los grises y las cajas de los wireframes no son el estilo final.

| Estado | Wireframe | Criterio |
| --- | --- | --- |
| Lista | `docs/specs/07-riego-rapido/wireframes/lista-movil.svg` · `lista-escritorio.svg` | CA-07.1 |
| Panel abierto | `docs/specs/07-riego-rapido/wireframes/panel-abierto-movil.svg` · `panel-abierto-escritorio.svg` | CA-07.1 |
| Guardando | `docs/specs/07-riego-rapido/wireframes/guardando-movil.svg` | CA-07.2 |
| Éxito | `docs/specs/07-riego-rapido/wireframes/exito-movil.svg` | CA-07.3 |
| Error de validación | `docs/specs/07-riego-rapido/wireframes/error-validacion-movil.svg` | CA-07.4 |
| Error de conexión | `docs/specs/07-riego-rapido/wireframes/error-conexion-movil.svg` | CA-07.5 |
| Planta no encontrada | `docs/specs/07-riego-rapido/wireframes/planta-no-encontrada-movil.svg` | CA-07.6 |

Las decisiones que toman los wireframes están en `docs/specs/07-riego-rapido/wireframes/README.md`.

### Verificación

El frontend no tiene tests automáticos (como en la spec 02). Cada criterio se comprueba con una captura de `npm run captura` a 390 px (y a 1280 px si hay wireframe de escritorio), comparada con su wireframe, y a mano en el navegador.

| Criterio | Cómo se comprueba |
| --- | --- |
| CA-07.1 | Capturas a 390 y 1280 px tras `--clic "Registrar riego para Helecho Lunar"`, comparadas con `lista-*` y `panel-abierto-*`. En el navegador: el foco, «Cancelar» y abrir otra fila |
| CA-07.2 | En el navegador con la red ralentizada (DevTools): el botón desactivado; con doble clic, el historial gana un solo riego |
| CA-07.3 | Captura a 390 px tras guardar, comparada con `exito-movil.svg`, y luego el detalle de la planta en el navegador |
| CA-07.4 | Capturas a 390 px con `--rellenar "Cantidad (ml)=0"`, con el campo vacío y con 2,5, comparadas con `error-validacion-movil.svg` |
| CA-07.5 | API apagada después de cargar la lista; captura del panel comparada con `error-conexion-movil.svg` |
| CA-07.6 | Planta borrada en MongoDB después de cargar la lista; captura comparada con `planta-no-encontrada-movil.svg` |
| CA-07.7 | Todas las capturas a 390 px sin desplazamiento horizontal; en el navegador, el teclado numérico (modo móvil de DevTools) y las zonas de 44 px |
| Sin regresiones | `npm test` sigue pasando y el diff no toca `src/` ni el formulario «Registrar una planta» |

### Archivos

`client/src/componentes/RiegoRapido.jsx` (nuevo) · `client/src/pantallas/Plantas.jsx` · `client/src/styles/app.css`
