# Wireframes · HU-1.8 · Registrar un riego rápido desde la lista

Historia y criterios: [docs/backlog/E1-plantas-y-riegos.md](../../../backlog/E1-plantas-y-riegos.md) (HU-1.8, CA-1.8.1 a CA-1.8.7).

**Estado:** aprobados por el usuario el 2026-11-18. La spec 05 todavía no está escrita.

Baja fidelidad, en escala de grises. Los textos son los de los criterios y de `DESIGN.md`. Los colores, las fuentes y los tamaños finales los decide `DESIGN.md`, no estos dibujos.

## Estados

| Estado | Archivos | Criterios |
|---|---|---|
| Lista | [lista-movil.svg](lista-movil.svg), [lista-escritorio.svg](lista-escritorio.svg) | CA-1.8.1, CA-1.8.7 |
| Panel abierto | [panel-abierto-movil.svg](panel-abierto-movil.svg), [panel-abierto-escritorio.svg](panel-abierto-escritorio.svg) | CA-1.8.1, CA-1.8.7 |
| Guardando | [guardando-movil.svg](guardando-movil.svg) | CA-1.8.2, CA-1.8.7 |
| Éxito | [exito-movil.svg](exito-movil.svg) | CA-1.8.3, CA-1.8.7 |
| Error de validación | [error-validacion-movil.svg](error-validacion-movil.svg) | CA-1.8.4, CA-1.8.7 |
| Error de conexión | [error-conexion-movil.svg](error-conexion-movil.svg) | CA-1.8.5, CA-1.8.7 |
| Planta no encontrada | [planta-no-encontrada-movil.svg](planta-no-encontrada-movil.svg) | CA-1.8.6, CA-1.8.7 |

## Decisiones

Lo que decide el wireframe y no dicen los criterios:

1. **Acción en cada fila.** En el móvil, «Registrar riego» es un botón secundario a todo el ancho, al pie de cada tarjeta. En escritorio va en una última columna de la tabla, sin encabezado.
2. **Dónde se abre el panel.** En el móvil, dentro de la tarjeta y en lugar del botón «Registrar riego». En escritorio, como una franja a todo el ancho justo debajo de la fila, y el botón de esa fila desaparece mientras el panel está abierto.
3. **Orden dentro del panel:** título «Riego para <nombre>», campo «Cantidad (ml)», error del campo (si lo hay), ayuda «Se anota con la fecha de hoy.», mensaje del panel (conexión o planta no encontrada), «Guardar riego» y «Cancelar». En escritorio, los botones van a la derecha del campo.
4. **«Cancelar» es un enlace con zona táctil de 44 px, no un segundo botón.** Así el panel tiene una sola acción con forma de botón. La línea discontinua del dibujo marca la zona táctil y no se ve en la pantalla real.
5. **Foco.** Al abrir el panel, el campo se dibuja con contorno grueso para indicar el foco (CA-1.8.1).
6. **Guardando.** El campo, «Guardar riego» (que dice «Guardando…») y «Cancelar» se ven desactivados. Cancelar a mitad de un envío no se permite, para que no quede la duda de si se guardó.
7. **Error de validación.** El texto dice «La cantidad de agua debe ser mayor que 0.», el mensaje de la API para 0 ml. Con el campo vacío o con 2,5 ml cambia el texto, pero no la posición.
8. **Error de conexión y planta no encontrada** se muestran en el mismo componente de mensaje, dentro del panel y encima de los botones. Solo cambia el texto.
9. **Planta no encontrada.** No se muestra «Guardar riego», porque reintentar no sirve; solo queda «Cancelar» para cerrar el panel.
10. **Éxito.** El mensaje se queda en la tarjeta de esa planta, encima de su botón «Registrar riego». Los wireframes no deciden cuándo desaparece; eso queda para la spec.
11. **Un solo botón primario.** «Registrar planta» sigue siendo el único botón primario de la pantalla. Todo lo del riego rápido es secundario.

## Lo que no se dibuja

- **Transiciones de CA-1.8.1:** «Cancelar» cierra el panel sin guardar. Abrir el panel de otra planta cierra el anterior, y el resultado se ve igual que en `panel-abierto`, solo que en otra fila.
- **Riego nuevo en el historial (CA-1.8.3):** la pantalla del detalle ya existe y no cambia.
- **CA-1.8.2, «otra pulsación no envía un segundo riego»:** es un comportamiento. El wireframe solo muestra el botón desactivado.
- **CA-1.8.7, teclado numérico y ausencia de desplazamiento horizontal:** tampoco se pueden ver en un dibujo estático. Todos los wireframes móviles miden 390 px de ancho, sin nada fuera del lienzo, y los botones y enlaces miden 44 px de alto.
