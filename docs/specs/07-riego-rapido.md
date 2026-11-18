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

### Comparación con los wireframes

Capturas en `docs/specs/07-riego-rapido/capturas/`, tomadas el 2026-11-18 con la API y el cliente en marcha. Las de lista, panel abierto, error de validación y éxito salen de `npm run captura`. Las de guardando, error de conexión y planta no encontrada se tomaron con un script de Playwright de un solo uso que intercepta `POST /api/riegos` (respuesta lenta, red cortada y 404), sin parar la API ni borrar datos.

| Estado | Captura | Estructura, orden y textos |
| --- | --- | --- |
| Lista | `lista-movil.png` · `lista-escritorio.png` | Coinciden |
| Panel abierto | `panel-abierto-movil.png` · `panel-abierto-escritorio.png` | Coinciden. Foco en «Cantidad (ml)» con 500 |
| Guardando | `guardando-movil.png` | Coinciden. Con doble clic se envía un solo riego, y el cuerpo lleva solo `planta` y `cantidadMl` |
| Éxito | `exito-movil.png` | Coinciden. El historial de la planta tiene el riego de hoy, de 500 ml y sin cuidador |
| Error de validación | `error-validacion-movil.png` (0) · `error-validacion-vacio-movil.png` · `error-validacion-decimal-movil.png` (2,5) | Coinciden, salvo el orden de la ayuda y el error (ver abajo) |
| Error de conexión | `error-conexion-movil.png` | Coinciden. Se conservan los 500 ml y «Guardar riego» vuelve a estar activo |
| Planta no encontrada | `planta-no-encontrada-movil.png` | Coinciden. Sin «Guardar riego» |

En todas las capturas a 390 px, `scrollWidth` es 390 (sin desplazamiento horizontal) y los botones miden 44 px de alto o más.

**Diferencia que queda:** en el wireframe, el error del campo va antes de la ayuda «Se anota con la fecha de hoy.». El componente `Campo` pinta primero la ayuda y después el error. Cambiar ese orden afectaría también al formulario «Registrar una planta», que esta spec no debe tocar.

### Pendientes

- **Nombre roto en la base de desarrollo:** la planta «Mandrágora» aparece como «Mandr�gora». El dato ya está mal guardado; no es un problema de esta spec.
- **Ejemplo desactualizado en `scripts/captura.js`:** el comentario usa `--clic "Regar Mandrágora"`, pero el botón se llama «Registrar riego para <nombre>».
- **Las capturas de specs quedan ignoradas por git:** el patrón `capturas/` de `.gitignore` también excluye `docs/specs/*/capturas/`, así que las de esta spec se añadieron con `git add -f`. Convendría cambiar el patrón a `/capturas/`.
- **Datos de prueba en la base de desarrollo:** quedan la planta «Helecho Lunar» y un riego suyo de 500 ml, del 2026-11-18.
- **Mensaje de éxito en escritorio:** no hay wireframe de escritorio para el éxito. El mensaje se muestra en la celda de acción, encima del botón, igual que en el móvil.
- **«2,5» se envía como 2.5** para que la API responda con su mensaje de «entero». El campo es de texto con `inputMode="numeric"` porque, con `type="number"`, «2,5» llegaría vacío.
