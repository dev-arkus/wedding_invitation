## ADDED Requirements

### Requirement: Disponible solo tras confirmar al menos un asistente

El botón para generar y descargar la imagen recuerdo SHALL aparecer únicamente después de un envío exitoso en el que al menos un invitado quedó en `si`.

#### Scenario: Nadie asiste

- **WHEN** una invitación se envía con todos los nombres en `no`
- **THEN** el botón de recuerdo no aparece

#### Scenario: Al menos uno asiste

- **WHEN** una invitación se envía con al menos un nombre en `si`
- **THEN** el botón de recuerdo aparece junto al mensaje de confirmación

#### Scenario: Regreso posterior

- **WHEN** un invitado con al menos un `si` registrado vuelve a abrir su URL, incluso después del corte
- **THEN** el botón de recuerdo sigue disponible

### Requirement: Contenido de la imagen

La imagen recuerdo SHALL contener el mismo campo de estrellas del hero, los nombres de la pareja, la fecha de la boda, y los nombres de quienes confirmaron asistencia en esa invitación.

La imagen MUST NOT incluir las fotos de la iglesia ni del salón, ni los nombres de quienes no asisten, ni el token de la invitación.

#### Scenario: Confirmación parcial

- **WHEN** una invitación de 3 personas confirma 2
- **THEN** la imagen nombra a esos 2 invitados y no menciona al tercero

### Requirement: Generación en el cliente

La imagen SHALL generarse en el navegador con Canvas 2D, dibujando sus elementos directamente. El sistema MUST NOT capturar el DOM ni requerir un servicio de render en servidor.

La imagen SHALL producirse a 1080×1350 px, apta para compartir en redes sociales.

#### Scenario: Sin llamada al servidor

- **WHEN** el invitado pulsa el botón de recuerdo
- **THEN** la imagen se produce sin peticiones de red adicionales

#### Scenario: Dimensiones

- **WHEN** se inspecciona la imagen generada
- **THEN** mide 1080×1350 px

### Requirement: Entrega adaptada al dispositivo

Cuando el navegador admita compartir archivos mediante la API de Web Share, el sistema SHALL ofrecer esa vía para entregar la imagen. En caso contrario SHALL ofrecer una descarga directa.

Esto es necesario porque en Safari de iOS el atributo `download` no funciona de forma fiable.

#### Scenario: Teléfono con Web Share

- **WHEN** el invitado pulsa el botón de recuerdo en un teléfono cuyo navegador admite compartir archivos
- **THEN** se abre la hoja de compartir del sistema con la imagen adjunta

#### Scenario: Navegador de escritorio

- **WHEN** el invitado pulsa el botón de recuerdo en un navegador sin soporte de compartir archivos
- **THEN** la imagen se descarga como archivo

### Requirement: Retroalimentación durante la generación

El botón SHALL indicar que está trabajando mientras se genera la imagen, y SHALL informar con una acción concreta si la generación falla.

#### Scenario: Fallo de generación

- **WHEN** la generación de la imagen falla
- **THEN** el invitado ve un mensaje que le indica volver a intentarlo, y el botón queda de nuevo disponible

### Requirement: Fuentes listas antes de dibujar

El sistema SHALL esperar a que las fuentes tipográficas estén cargadas antes de dibujar el texto en el canvas, para que la imagen no se genere con tipografías de reserva.

#### Scenario: Pulsación temprana

- **WHEN** el invitado pulsa el botón de recuerdo antes de que las fuentes hayan terminado de cargar
- **THEN** el sistema espera a que estén listas y produce la imagen con la tipografía correcta
