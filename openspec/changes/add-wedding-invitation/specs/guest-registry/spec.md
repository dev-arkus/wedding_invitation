## ADDED Requirements

### Requirement: El Google Sheet es la fuente de verdad

El Google Sheet SHALL ser la única fuente de verdad de invitados y confirmaciones. El sistema MUST NOT mantener una base de datos paralela ni una copia autoritativa en otro lugar.

La pareja y la wedding planner SHALL poder abrir, filtrar, ordenar, editar y exportar el Sheet directamente, sin pasar por la aplicación.

#### Scenario: Edición directa reflejada en la invitación

- **WHEN** la planner cambia a mano el `estado` de un invitado en la pestaña `Invitados` y luego se carga la invitación de ese token
- **THEN** la invitación muestra el estado que la planner dejó escrito

### Requirement: Estructura de la pestaña Invitados

La pestaña `Invitados` SHALL contener una fila por persona con las columnas: `id`, `token`, `nombre`, `tipo`, `estado`, `actualizado`, `notas`.

- `id` SHALL ser único y estable en toda la hoja.
- `tipo` SHALL ser `adulto` o `niño`. Ambos ocupan un pase; `tipo` solo distingue para efectos de catering.
- `estado` SHALL ser `pendiente`, `si` o `no`.
- `actualizado` SHALL escribirse en formato ISO 8601 para que sea ordenable y filtrable.

#### Scenario: Un niño ocupa un pase

- **WHEN** una invitación tiene 2 filas con `tipo` = `adulto` y 1 fila con `tipo` = `niño`
- **THEN** la invitación cuenta 3 pases y presenta los 3 nombres como confirmables de forma independiente

### Requirement: Estructura de la pestaña Invitaciones

La pestaña `Invitaciones` SHALL contener una fila por invitación con al menos: `token`, `grupo`, `contacto`, `whatsapp`, `pases`, `confirmados`, `estado`, `url`, `mesa`, `notas`.

Las columnas `pases`, `confirmados` y `estado` SHALL calcularse con fórmulas sobre la pestaña `Invitados`. La aplicación MUST NOT escribir en esta pestaña.

La columna `url` SHALL construirse por fórmula a partir del `token`, para que la pareja pueda copiar el enlace y enviarlo a mano.

#### Scenario: Los totales se actualizan solos

- **WHEN** un invitado confirma y la aplicación escribe su `estado` en la pestaña `Invitados`
- **THEN** las columnas `confirmados` y `estado` de la pestaña `Invitaciones` reflejan el cambio por fórmula, sin que la aplicación las haya tocado

### Requirement: Estructura de la pestaña Config

La pestaña `Config` SHALL contener pares clave/valor con el contenido editable de la invitación, incluyendo al menos: `misa_inicio`, `misa_lugar`, `misa_direccion`, `misa_maps`, `misa_coords`, `recepcion_inicio`, `recepcion_lugar`, `recepcion_direccion`, `recepcion_maps`, `recepcion_coords`, `dress_code`, `mensaje_cierre`.

Las claves `misa_inicio` y `recepcion_inicio` SHALL escribirse como `YYYY-MM-DD HH:mm` y el sistema SHALL interpretarlas como hora de `America/Caracas`.

El instante de corte del RSVP MUST NOT residir en la pestaña `Config`. Un error de tecleo en una celda editable no debe poder abrir ni cerrar el RSVP.

#### Scenario: La pareja cambia el dress code sin desplegar

- **WHEN** la pareja escribe un valor en la celda `dress_code` y recarga la invitación
- **THEN** la sección de vestimenta aparece con ese texto, sin necesidad de un despliegue nuevo

#### Scenario: Hora inválida en Config

- **WHEN** `misa_inicio` contiene un valor que no se puede interpretar como fecha y hora
- **THEN** el sistema usa el instante de la misa definido en variables de entorno, registra una advertencia en logs y sigue renderizando la página completa

### Requirement: Escritura acotada y direccionada por id

Al registrar una confirmación, el sistema SHALL escribir únicamente las celdas `estado` y `actualizado` de las filas correspondientes en la pestaña `Invitados`.

El sistema SHALL localizar cada fila buscando su `id` inmediatamente antes de escribir. El sistema MUST NOT cachear índices de fila entre peticiones, MUST NOT reescribir filas completas, y MUST NOT tocar las columnas `id`, `token`, `nombre`, `tipo` ni `notas`.

#### Scenario: La planner inserta una fila mientras alguien confirma

- **WHEN** la planner inserta filas nuevas en la pestaña `Invitados`, desplazando las posiciones, y a continuación un invitado envía su confirmación
- **THEN** el sistema escribe el estado en las filas cuyo `id` coincide, y ninguna otra fila queda alterada

#### Scenario: Las notas de la planner sobreviven

- **WHEN** la planner escribe un comentario en la columna `notas` de un invitado y ese invitado cambia después su respuesta
- **THEN** la columna `notas` conserva el comentario intacto

### Requirement: Escritura atómica por invitación

Los cambios de estado de una invitación SHALL enviarse a Google Sheets en una sola operación por lotes.

#### Scenario: Confirmación parcial de un grupo

- **WHEN** un invitado marca 2 de 3 nombres y envía
- **THEN** los 3 estados se escriben en una única petición por lotes

### Requirement: Semillado manual de la lista

La pareja SHALL cargar a mano los ~70 invitados en la pestaña `Invitados`, agrupados por `token`. El sistema MUST NOT requerir un proceso de importación ni una interfaz de administración para hacerlo.

#### Scenario: Invitación agregada después de que el sitio está en vivo

- **WHEN** la pareja agrega filas con un `token` nuevo y `estado` = `pendiente`
- **THEN** la URL de ese token empieza a funcionar sin desplegar nada
