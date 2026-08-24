## ADDED Requirements

### Requirement: Conteo regresivo hacia la misa

La invitación SHALL mostrar un conteo regresivo hacia el instante de la misa (`2026-11-07T22:00:00Z`), con los días como cifra dominante y horas, minutos y segundos en una línea secundaria.

Las cifras SHALL usar numerales tabulares para que no se desplacen al actualizarse.

#### Scenario: Cuenta activa

- **WHEN** un invitado abre la invitación antes de la boda
- **THEN** ve los días restantes como cifra principal y una línea con horas, minutos y segundos que avanza cada segundo

#### Scenario: Ancho estable

- **WHEN** el conteo pasa de un valor a otro con dígitos de distinto ancho
- **THEN** el bloque no cambia de ancho ni desplaza el contenido vecino

#### Scenario: Después de la boda

- **WHEN** el instante de la misa ya pasó
- **THEN** el conteo deja de mostrar valores negativos y presenta un mensaje de cierre

### Requirement: Misa y recepción en secciones separadas

La invitación SHALL presentar la misa y la recepción como dos secciones distintas, cada una con su hora, su lugar y su dirección.

Cada sección SHALL identificarse con la hora del evento en numeral romano (`VI · 00` y `VIII · 00`), derivada del instante correspondiente.

#### Scenario: Dos secciones con sus datos

- **WHEN** un invitado recorre la invitación
- **THEN** encuentra una sección de misa a las 6:00 PM y una sección de recepción a las 8:00 PM, cada una con su lugar y dirección

### Requirement: Mapas sin SDK ni API key

Los mapas SHALL integrarse mediante el iframe de `maps/embed` obtenido desde la opción de compartir de Google Maps. El sistema MUST NOT usar el SDK de Google Maps ni requerir una API key facturable.

Cada lugar SHALL ofrecer además botones de navegación directa a Google Maps (`https://www.google.com/maps/dir/?api=1&destination=LAT,LNG`) y a Waze (`https://waze.com/ul?ll=LAT,LNG&navigate=yes`).

#### Scenario: Navegación directa

- **WHEN** un invitado pulsa el botón de Waze en la sección de la misa
- **THEN** se abre Waze con las coordenadas de la parroquia como destino

### Requirement: El mapa no carga hasta que se solicita

Ningún iframe de mapa SHALL cargarse durante la carga inicial de la página. El iframe SHALL insertarse únicamente tras una acción explícita del invitado.

#### Scenario: Carga inicial sin contacto con Google Maps

- **WHEN** se carga la invitación y no se toca ningún mapa
- **THEN** no se realiza ninguna petición a servidores de Google Maps

#### Scenario: El invitado abre el mapa

- **WHEN** el invitado pulsa "Ver mapa" en una sección de lugar
- **THEN** el iframe se inserta y sustituye a la portada de ese bloque

### Requirement: Fotos de los lugares como portada del mapa

Cuando exista una foto del lugar, esa foto SHALL ser la portada del bloque de mapa, con un control visible para revelar el mapa.

Las fotos de los lugares SHALL presentarse contenidas, enmarcadas con un filete, y con un tratamiento de color más suave que la foto de la pareja, de modo que el lugar siga siendo reconocible.

#### Scenario: Bloque de lugar con foto

- **WHEN** la foto de la iglesia está disponible
- **THEN** el bloque de la misa muestra esa foto con el control "Ver mapa", y el mapa aparece al pulsarlo

### Requirement: Foto de la pareja

La invitación SHALL incluir una foto de la pareja, presentada a sangre, sin marco, con tratamiento duotono acorde a la paleta y las estrellas superpuestas a baja opacidad.

Su marcador de posición durante la carga SHALL ser oscuro, acorde al fondo de la página.

#### Scenario: Sin destello claro al cargar

- **WHEN** la foto de la pareja entra en el viewport y aún no ha terminado de cargar
- **THEN** el espacio que ocupa se muestra oscuro, sin un destello blanco o gris claro

### Requirement: Degradación limpia ante datos faltantes

Ninguna clave vacía en la pestaña `Config` SHALL romper la página. Una sección sin datos SHALL omitirse por completo en lugar de mostrarse vacía o con marcadores de posición visibles.

#### Scenario: Dress code sin definir

- **WHEN** la celda `dress_code` está vacía
- **THEN** la sección de vestimenta no se renderiza, y no queda un título huérfano ni un espacio en blanco

#### Scenario: Lugar sin foto pero con mapa

- **WHEN** no hay foto de un lugar pero sí datos de mapa
- **THEN** el bloque usa una imagen estática de mapa como portada

#### Scenario: Lugar sin foto ni mapa

- **WHEN** no hay foto ni datos de mapa para un lugar
- **THEN** la sección muestra solo el texto de lugar y dirección, sin marcos ni bloques vacíos

#### Scenario: Lugar sin confirmar

- **WHEN** la celda de lugar de una sección está vacía
- **THEN** la sección muestra "Por confirmar" en lugar del nombre del lugar

### Requirement: Música de fondo bajo control del invitado

La invitación SHALL ofrecer un botón persistente para reproducir y pausar la música de fondo. El sistema MUST NOT reproducir audio automáticamente.

El archivo de audio MUST NOT descargarse hasta que el invitado pulse reproducir.

#### Scenario: Sin descarga hasta la primera pulsación

- **WHEN** se carga la invitación y no se toca el botón de música
- **THEN** no se solicita el archivo de audio

#### Scenario: Reproducción y pausa

- **WHEN** el invitado pulsa el botón de música
- **THEN** el audio comienza en bucle y el botón pasa a estado de pausa, permaneciendo accesible mientras se hace scroll

#### Scenario: La pestaña pasa a segundo plano

- **WHEN** el invitado cambia de pestaña o de aplicación mientras suena la música
- **THEN** la reproducción se pausa

### Requirement: Texto en segunda persona del singular

Todo el texto de la invitación SHALL dirigirse a quien recibe el enlace usando la forma «tú».

El texto SHALL ajustarse al número de invitados de la invitación: singular cuando hay un solo nombre, plural cuando hay dos o más.

#### Scenario: Invitación individual

- **WHEN** la invitación tiene un solo nombre
- **THEN** la sección de confirmación dice "Apartamos un lugar para ti."

#### Scenario: Invitación de grupo

- **WHEN** la invitación tiene dos o más nombres
- **THEN** la sección de confirmación dice "Apartamos estos lugares para ti." y "Marca quién puede venir."

### Requirement: Presupuesto de carga inicial

La carga inicial de la invitación —HTML, fuentes, catálogo de estrellas y JavaScript— SHALL mantenerse en 250KB o menos comprimidos.

Las fotos, los mapas y el audio MUST NOT contar contra esa carga inicial: SHALL cargarse de forma diferida o bajo demanda.

#### Scenario: Medición del primer render

- **WHEN** se audita la invitación con red limitada, sin hacer scroll ni tocar controles
- **THEN** el total transferido para el primer render es igual o menor a 250KB

### Requirement: Legibilidad y movimiento reducido

El texto de cuerpo SHALL alcanzar al menos una relación de contraste de 4.5:1 contra su fondo.

Cuando el sistema operativo del invitado declare `prefers-reduced-motion`, toda animación decorativa SHALL suprimirse y los elementos SHALL presentarse en su estado final.

#### Scenario: Preferencia de movimiento reducido

- **WHEN** el invitado tiene activado el ajuste de reducir movimiento
- **THEN** el campo de estrellas aparece en su estado final sin transiciones, el titileo no ocurre y el fondo no cambia con el scroll

#### Scenario: Contraste del texto

- **WHEN** se audita el contraste del texto de cuerpo sobre el fondo
- **THEN** ninguna combinación queda por debajo de 4.5:1
