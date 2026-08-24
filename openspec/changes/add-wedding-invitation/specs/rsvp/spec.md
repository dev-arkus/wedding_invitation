## ADDED Requirements

### Requirement: Nombres fijos, sin conteo numérico

La invitación SHALL presentar los nombres precargados de sus invitados. El invitado MUST NOT poder declarar cuántos asisten, agregar nombres, editar nombres ni solicitar pases adicionales.

#### Scenario: No hay forma de agregar acompañantes

- **WHEN** un invitado revisa la sección de confirmación
- **THEN** solo encuentra los nombres precargados con sus controles de Sí/No, sin campos de texto libre ni botones para sumar personas

### Requirement: Marcado independiente por persona

Cada invitado de la invitación SHALL tener su propio control de Sí/No, marcable de forma independiente del resto.

#### Scenario: Confirmación parcial

- **WHEN** una invitación tiene 3 nombres y se marcan 2 como `si` y 1 como `no`
- **THEN** el sistema acepta el envío y registra `si`, `si`, `no` respectivamente

#### Scenario: Nadie asiste

- **WHEN** todos los nombres se marcan como `no`
- **THEN** el sistema acepta el envío y responde "Gracias por avisarnos. Los vamos a extrañar."

### Requirement: Todos los nombres deben marcarse antes de enviar

El sistema SHALL exigir que todos los nombres de la invitación tengan un valor `si` o `no` antes de aceptar el envío, para poder distinguir "no viene" de "no respondió".

El servidor SHALL rechazar un envío que deje algún invitado de la invitación en `pendiente`.

#### Scenario: Falta un nombre por marcar

- **WHEN** un invitado marca 2 de 3 nombres y pulsa Confirmar
- **THEN** el sistema no envía, indica cuál nombre falta por marcar y mantiene lo ya seleccionado

#### Scenario: El servidor también valida

- **WHEN** llega una petición al endpoint de RSVP que omite uno de los invitados de esa invitación
- **THEN** el servidor la rechaza sin escribir nada en el Sheet

### Requirement: Ventana de edición hasta el corte

Antes del instante de corte, un invitado SHALL poder reenviar su respuesta cuantas veces quiera, y cada envío reemplaza el anterior.

El instante de corte SHALL ser `2026-10-31T22:00:00Z` (31 de octubre de 2026, 6:00 PM hora de Venezuela).

#### Scenario: Cambio de respuesta

- **WHEN** un invitado que ya confirmó abre su URL antes del corte y cambia un `si` por un `no`
- **THEN** el sistema guarda el nuevo estado y la invitación refleja el valor actualizado

#### Scenario: Estado actual precargado

- **WHEN** un invitado que ya respondió vuelve a abrir su URL
- **THEN** los controles aparecen con su respuesta previa ya seleccionada

### Requirement: Congelamiento por reloj de servidor

El servidor SHALL decidir si el RSVP está abierto comparando su propio reloj contra el instante de corte. El sistema MUST NOT confiar en la hora del dispositivo del invitado para esa decisión.

Toda escritura recibida después del instante de corte SHALL ser rechazada, sin importar lo que muestre la interfaz.

#### Scenario: Petición posterior al corte

- **WHEN** llega una petición al endpoint de RSVP después del instante de corte
- **THEN** el servidor la rechaza, no escribe nada en el Sheet y devuelve un estado de "lista cerrada"

#### Scenario: Reloj del dispositivo manipulado

- **WHEN** un visitante atrasa el reloj de su teléfono y envía una confirmación después del corte
- **THEN** el servidor la rechaza igual

### Requirement: Coherencia entre corte e instante de la boda

El instante de corte SHALL definirse como su propia constante de entorno, no derivarse de la hora de la misa.

Al arrancar, el sistema SHALL verificar que la diferencia entre el instante de la misa y el instante de corte sea exactamente 604800 segundos (7 días), y SHALL registrar una advertencia si no lo es.

#### Scenario: Alguien mueve la hora de la misa

- **WHEN** el instante de la misa se cambia de modo que ya no queda a 7 días exactos del corte
- **THEN** el sistema registra una advertencia al arrancar
- **AND** el instante de corte permanece sin cambios

### Requirement: Respuesta al confirmar

Tras un envío exitoso, el sistema SHALL mostrar un mensaje acorde al resultado y habilitar la descarga de la imagen recuerdo cuando al menos un invitado quedó en `si`.

Los mensajes SHALL nombrar a quienes asisten y MUST NOT enumerar a quienes no.

#### Scenario: Asisten todos

- **WHEN** todos los nombres quedan en `si`
- **THEN** el sistema muestra "Listo. Nos vemos el 7 de noviembre." y ofrece descargar el recuerdo

#### Scenario: Asisten algunos

- **WHEN** quedan en `si` Javier y Ana, y en `no` un tercer invitado
- **THEN** el sistema muestra "Nos vemos con Javier y Ana." y ofrece descargar el recuerdo

#### Scenario: No asiste nadie

- **WHEN** todos los nombres quedan en `no`
- **THEN** el sistema no ofrece la descarga del recuerdo

### Requirement: Fallo de guardado comunicado con acción

Si la escritura en el Sheet falla, el sistema SHALL informarlo con un mensaje que diga qué hacer, y SHALL conservar lo que el invitado había marcado para que pueda reintentar sin volver a empezar.

El mensaje MUST NOT disculparse ni exponer detalles técnicos.

#### Scenario: Se cae la conexión al enviar

- **WHEN** la escritura en Google Sheets falla
- **THEN** el invitado ve "No pudimos guardar tu respuesta. Revisa tu conexión e inténtalo otra vez."
- **AND** sus selecciones siguen en pantalla

### Requirement: Control de Sí/No accesible

El control de Sí/No SHALL implementarse sobre controles de formulario nativos agrupados por invitado, operables con teclado y anunciados correctamente por lectores de pantalla, con el nombre del invitado como etiqueta del grupo.

Cada objetivo táctil SHALL medir al menos 44×44 px. El estado seleccionado MUST NOT distinguirse únicamente por color.

#### Scenario: Recorrido con teclado

- **WHEN** un usuario navega la sección de confirmación solo con teclado
- **THEN** puede alcanzar y activar cada opción de Sí y No, con el foco siempre visible

#### Scenario: Selección perceptible sin color

- **WHEN** la página se visualiza en escala de grises
- **THEN** sigue siendo posible distinguir qué opción está seleccionada
