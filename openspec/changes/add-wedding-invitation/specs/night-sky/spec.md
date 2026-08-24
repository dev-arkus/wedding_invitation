## ADDED Requirements

### Requirement: Cielo calculado para el instante y lugar de la boda

El campo de estrellas SHALL calcularse a partir de posiciones astronómicas reales, proyectadas para las coordenadas de San Cristóbal, Táchira (≈7.77° N, −72.22° O) en el instante de la misa (`2026-11-07T22:00:00Z`).

Las posiciones MUST NOT ser aleatorias, decorativas ni generadas por ruido.

#### Scenario: Reproducibilidad

- **WHEN** la invitación se carga dos veces en dispositivos distintos
- **THEN** el campo de estrellas es idéntico en ambos, con las mismas estrellas en las mismas posiciones relativas

#### Scenario: Correspondencia con el cielo real

- **WHEN** se comparan las posiciones proyectadas contra una carta celeste de referencia para ese instante y esas coordenadas
- **THEN** las posiciones relativas de las estrellas brillantes coinciden

### Requirement: Catálogo acotado embebido

El catálogo de estrellas SHALL derivarse de un catálogo de estrellas brillantes de dominio público, recortado a los campos necesarios (ascensión recta, declinación, magnitud) y filtrado por magnitud aparente.

El catálogo servido SHALL pesar 15KB o menos comprimido y SHALL viajar con la aplicación. El sistema MUST NOT consultar un servicio externo de astronomía en tiempo de ejecución.

#### Scenario: Sin dependencias externas en ejecución

- **WHEN** se carga la invitación
- **THEN** no se realiza ninguna petición de red a un servicio de datos astronómicos

### Requirement: Fidelidad de posición sobre fidelidad fotométrica

El sistema SHALL renderizar todas las estrellas del catálogo filtrado, aunque a las 6:00 PM el cielo real esté en crepúsculo civil y solo unas pocas serían visibles a simple vista.

La verdad que se preserva es **dónde estaban** las estrellas, no cuántas alcanzaría a ver el ojo. El brillo de render SHALL modularse por magnitud como jerarquía visual.

#### Scenario: Densidad del campo

- **WHEN** se renderiza el hero
- **THEN** se presenta el conjunto completo de estrellas del catálogo filtrado, con las de menor magnitud renderizadas más brillantes y grandes que las de mayor magnitud

### Requirement: Rotación real entre misa y recepción

Conforme el invitado avanza desde la sección de la misa hasta la de la recepción, el cielo SHALL rotar según el movimiento real transcurrido entre ambos instantes (2 horas, unos 30° de ascensión recta).

Esta rotación SHALL formar parte del mismo cambio de fondo que oscurece la página con el scroll; MUST NOT ser una animación independiente.

#### Scenario: Progresión del cielo con el scroll

- **WHEN** el invitado hace scroll desde la sección de la misa hasta la de la recepción
- **THEN** el campo de estrellas rota de forma continua hacia su posición correspondiente a las 8:00 PM, mientras el fondo se oscurece

### Requirement: Titileo mínimo

Entre 3 y 5 estrellas SHALL titilar con ciclos desfasados de 4 a 6 segundos y una variación de opacidad no mayor a ±8%.

El sistema MUST NOT aplicar titileo a todo el campo ni usar ciclos rápidos o variaciones de opacidad marcadas.

#### Scenario: Titileo contenido

- **WHEN** se observa el hero en reposo
- **THEN** a lo sumo 5 estrellas varían su brillo de forma lenta y sutil, y el resto permanece estable

#### Scenario: Movimiento reducido

- **WHEN** el invitado tiene activado `prefers-reduced-motion`
- **THEN** ninguna estrella titila y el campo se presenta en su estado final

### Requirement: Aparición progresiva por magnitud

En la carga de la página, las estrellas SHALL aparecer de forma escalonada a lo largo de aproximadamente 2.5 segundos, primero las más brillantes y luego las más tenues, reproduciendo el orden en que aparecen al anochecer.

Los nombres de la pareja SHALL aparecer una vez iniciada esa secuencia.

#### Scenario: Secuencia de entrada

- **WHEN** se carga la invitación por primera vez
- **THEN** las estrellas de menor magnitud aparecen primero, las restantes se suman progresivamente, y los nombres entran después del inicio de la secuencia

### Requirement: El cielo es fondo, no contenido

El campo de estrellas SHALL ser decorativo a efectos de accesibilidad: expuesto como tal a las tecnologías de asistencia y excluido del orden de foco.

El texto superpuesto SHALL conservar su relación de contraste requerida sobre cualquier zona del campo, independientemente de dónde caigan las estrellas.

#### Scenario: Lector de pantalla

- **WHEN** un lector de pantalla recorre el hero
- **THEN** anuncia los nombres y la fecha, y no anuncia el campo de estrellas

#### Scenario: Contraste sobre las estrellas

- **WHEN** una estrella queda detrás de un carácter de los nombres
- **THEN** el contraste del texto se mantiene en el mínimo requerido

### Requirement: Render sin bloquear el contenido

El render del campo de estrellas MUST NOT retrasar la aparición del contenido de la invitación ni impedir el scroll.

Si el render del cielo falla, la página SHALL continuar mostrando todo su contenido sobre el fondo de color base.

#### Scenario: Fallo del render del cielo

- **WHEN** el campo de estrellas no puede renderizarse en el dispositivo del invitado
- **THEN** la invitación se muestra completa y utilizable sobre el fondo oscuro, sin bloques rotos
