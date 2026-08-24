## Context

Repositorio vacío. Boda el sábado 7 de noviembre de 2026 en San Cristóbal, Táchira (Venezuela): misa 6:00 PM, recepción 8:00 PM. ~70 invitados, ~25-30 invitaciones.

**Actores y sus herramientas**
- La pareja (Dayona Herrera, Javier Bastidas): ambos programan.
- La wedding planner: no aprende herramientas nuevas. Vive en Google Sheets.
- Los invitados: familia y amigos, casi todos abriendo el enlace desde un teléfono con datos móviles venezolanos.

**Repo hermano como referencia**: `/Users/javierbastidas/Documents/code/arkus/djfinanzas` ya resuelve Next 14 App Router + `googleapis` con service account JWT + rutas `app/api/*` desplegado en Vercel. Incluye el arreglo de `GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')`, imprescindible en Vercel. Ese patrón se reutiliza.

**Restricciones duras**
- La credencial de Google no puede llegar al navegador.
- Los enlaces se reparten a mano por WhatsApp y **no se pueden recoger** una vez enviados.
- Ancho de banda escaso en el destino.
- Sin API key facturable de Google Maps.

## Goals / Non-Goals

**Goals:**
- Control real de pases: nombres fijos, marcado individual, sin forma de sumar gente.
- El Google Sheet como fuente de verdad viva, editable a mano por la pareja y la planner en paralelo con la aplicación.
- Congelamiento del RSVP decidido por el servidor, inmune al reloj del invitado.
- Una invitación que se sienta lujosa y sea liviana: ≤250KB de primera carga.
- Un elemento firma irrepetible que además genere el recuerdo descargable.

**Non-Goals:**
- PWA, service worker, funcionamiento sin conexión.
- Base de datos, panel de administración, autenticación con usuario y contraseña.
- Hashtag, playlist colaborativa, galería, mesa de regalos, hospedaje.
- Pases extra, acompañantes no listados, alergias, menú.
- Notificaciones de cualquier tipo. El Sheet es la única salida.
- Dominio propio en el lanzamiento (se puede agregar después sin romper enlaces).
- Cualquier integración programática con WhatsApp.

## Decisions

### D1 — Capa servidor delgada, no acceso directo del navegador al Sheet

El pedido original era "el frontend se comunica con el Google Sheet". Literalmente no es posible de forma segura:

| Enfoque | Resultado |
|---|---|
| Sheet público + `fetch` desde el navegador | Cualquiera lee toda la hoja: nombres, teléfonos y **los 70 tokens** |
| API key de Sheets en el bundle | Las API keys son de solo lectura → no se puede escribir el RSVP. Y la key queda pública igual |
| **Capa servidor delgada** | La credencial vive en el servidor. El navegador nunca toca Google |

Elegido: **Next.js 14 App Router en Vercel con service account** (`googleapis`, scope `spreadsheets`).

Alternativas consideradas:
- **Google Apps Script Web App**: cero infraestructura y `LockService` da exclusión mutua real. Descartado por latencia de 300–1500ms, CORS problemático en POST (obliga al truco de `text/plain`), imposibilidad de renderizar los nombres en servidor, y un ciclo de pruebas pobre.
- **Base de datos real con espejo al Sheet**: correcto y atómico, pero exige sincronización bidireccional para que las ediciones manuales de la planner regresen. Sobredimensionado para 30 invitaciones.

El SSR es la ventaja decisiva: el servidor valida el token, lee el Sheet y entrega los nombres ya en el HTML. Sin destello de carga, sin credencial en el cliente, y la vista previa del enlace funciona sola.

### D2 — Forma del Sheet: normalizado, con superficie de escritura mínima

Tres pestañas:

```
Invitados     id | token | nombre | tipo | estado | actualizado | notas
              ^^ una fila por persona. FUENTE DE VERDAD del RSVP.
              La app escribe SOLO estado y actualizado.

Invitaciones  token | grupo | contacto | whatsapp | pases | confirmados |
              estado | url | mesa | notas
              ^^ pases/confirmados/estado son FÓRMULAS (COUNTIFS) sobre Invitados.
              url es fórmula sobre token → la pareja copia y pega en WhatsApp.
              La app NUNCA escribe aquí.

Config        clave | valor
              ^^ contenido editable: horas, lugares, direcciones, coordenadas,
              iframes de mapa, dress code, mensaje de cierre.
```

Una fila por persona en vez de una fila ancha por invitación: filtrar por `estado` y `tipo` para el catering es trivial, y no hay techo de columnas.

Que los agregados sean fórmulas y no escrituras de la aplicación reduce la superficie de escritura a dos celdas por invitado. Menos que se pueda corromper, y la planner ve los totales en vivo sin que nada los actualice.

### D3 — Concurrencia: buscar por `id`, nunca cachear índices de fila

Google Sheets no ofrece bloqueos. El riesgo real no es que dos invitados escriban a la vez (cada invitación toca solo sus propias filas, y son 30 invitaciones a lo largo de un año) — es que **la planner inserte o reordene filas** mientras la aplicación tiene un índice en la mano, y la escritura caiga en la persona equivocada.

Mitigación: leer y localizar por `id` inmediatamente antes de escribir, en la misma petición. Nunca persistir ni cachear posiciones de fila. Queda una ventana TOCTOU de ~200ms; a esta escala es despreciable, y el modo de fallo peor posible es un estado escrito sobre una fila recién movida, recuperable a mano.

Todas las filas de una invitación se escriben en un solo `values.batchUpdate`.

### D4 — Los instantes viven en UTC, en variables de entorno

```
misa       2026-11-07T22:00:00Z    (7 nov 6:00 PM VE)
recepción  2026-11-08T00:00:00Z    (7 nov 8:00 PM VE)
corte      2026-10-31T22:00:00Z    (31 oct 6:00 PM VE)
```

Venezuela es UTC−4 sin horario de verano. Los servidores de Vercel corren en UTC. Guardar "31 de octubre" como fecha suelta haría que un invitado confirmando el sábado a las 8:00 PM hora local fuera ya 1 de noviembre para el servidor, y quedara rechazado horas antes de tiempo. Un único instante absoluto elimina la clase entera de error.

Para **mostrar** fechas y horas se usa siempre la zona IANA `America/Caracas`, nunca un desfase `-4` en duro. Venezuela cambió su huso dos veces en veinte años (−4 → −4:30 en 2007 → −4 en 2016); si vuelve a pasar antes de la boda, se ajusta una constante en vez de auditar toda la base de código.

**El corte es su propia constante, no se deriva de la misa.** Da la casualidad de que es exactamente misa − 7 días, y el arranque verifica esa igualdad (604800s) y advierte si deja de cumplirse. Pero derivarlo haría que mover la hora de la misa moviera el corte en silencio.

### D5 — Frontera Sheet/entorno/repo

| Dónde | Qué | Por qué |
|---|---|---|
| `Config` (Sheet) | Horas, lugares, direcciones, coordenadas, iframes, dress code | Lo cambian sin desplegar ni pedir ayuda |
| Entorno | Instantes UTC, corte, credenciales | Reglas de negocio y secretos. Un dedazo en una celda no puede abrir el RSVP |
| Repo | Las tres fotos, el audio, el catálogo de estrellas | Binarios que se ponen una vez; `next/image` los optimiza en build |

Las horas van en `Config` como `YYYY-MM-DD HH:mm`, interpretadas como hora de Caracas y convertidas a instante en el servidor. Así el conteo regresivo y el texto mostrado salen del **mismo dato** y no pueden desincronizarse. Si el valor no parsea: se usa el instante del entorno, se registra advertencia y la página sigue completa.

### D6 — Dirección visual: es una boda de noche

La misa empieza a las 6:00 PM. A 7.7° de latitud norte en noviembre el sol se pone alrededor de las 5:55 PM. La ceremonia arranca justo al caer la luz y la fiesta transcurre entera de noche.

Casi toda invitación de boda es color crema. Esta es oscura, y hay un argumento de accesibilidad que lo respalda: el dorado de la paleta sobre blanco hueso da 3.2:1 y no cumple WCAG para texto; sobre navy da 5.1:1 y sí. **Invertir el fondo convierte el dorado en un color usable en vez de un adorno restringido.**

**Elemento firma: el cielo real de esa noche.** Posiciones astronómicas para San Cristóbal el 7 de noviembre de 2026 a las 6:00 PM, como puntos dorados sobre navy profundo.

Las fotos de la decoración de la recepción confirmaron la idea de una forma que no se anticipó: cientos de luces cálidas colgando sobre tela azul profunda **ya son un cielo estrellado hecho a mano**. La invitación funciona como vista previa del salón. El invitado reconoce el lugar antes de saber por qué.

Y resuelve el recuerdo descargable sin assets nuevos: la imagen es ese mismo cielo con los nombres y la fecha.

### D7 — Paleta calibrada a la temperatura del salón

Las bombillas de las fotos de referencia están cerca de 2200K: ámbar, no bronce.

```
--noche      #0D1226   el cielo profundo, fondo del hero
--navy       #1A2340   superficies, el drapeado en sombra
--azul-luz   #2B3E6B   donde la luz toca la tela
--oro        #B8862F   TINTA grabada: filetes, subrayados
--luz        #FFC97A   LUZ: estrellas, brillos, foco de teclado
--hueso      #F2EBE0   texto (100% / 60% / 40% para jerarquía)
```

Dos dorados con roles distintos: `--oro` es tinta, `--luz` es luz. Entibiar el dorado también mejora el contraste — `#FFC97A` sobre navy da 10.8:1 frente a los 5.1:1 de `#B8862F`. La estética y la accesibilidad apuntan al mismo lado.

Se descartó un token de gris azulado intermedio: sobre fondo oscuro se ve sucio, y la opacidad del hueso da mejor jerarquía con un token menos.

### D8 — Tipografía: Bodoni Moda + Jost

Descartados de entrada: Playfair Display (el default de las bodas generadas), cualquier script tipo Great Vibes, Montserrat.

**Bodoni Moda** para display. Su contraste extremo entre trazo grueso y fino se lee como grabado en lámina. Y tiene eje óptico variable, así que los nombres a 96px salen con filos limpios en lugar de engordados.

Hay una tensión honesta: Bodoni es alta costura, mientras que las fotos de referencia son cálidas (madera, ladrillo, pampas secas, velas). Se resuelve a favor de Bodoni por una razón concreta: **sus trazos finos tienen el mismo grosor que los cables de luz que cruzan ese techo.** Una tipografía de peso parejo se sentaría encima del campo de estrellas; los pelos de Bodoni se sientan entre ellas. El calor entra por el color, no por la letra.

Si al ver el prototipo se siente severa, el reemplazo de una línea es **Marcellus** (romana de inscripción, más cálida). No cambiar antes de verlo.

**Jost** para cuerpo, etiquetas y botones: geométrica de los años treinta, y sobre fondo oscuro una sans de bajo contraste se lee mucho mejor que una garalda, que a cuerpo pequeño titila.

Dos familias, subset latino.

**Dispositivo estructural: la hora en numeral romano** (`VI · 00`, `VIII · 00`). No `01 / 02 / 03` — las secciones no son una lista numerada, son una noche en dos actos a dos horas concretas. El marcador carga información real y vive en el mismo mundo lapidario que Bodoni y que una iglesia.

Los nombres tienen **exactamente 6 letras cada uno** (DAYONA / JAVIER), así que con tracking uniforme el bloque queda un rectángulo perfecto sin ajustes ópticos.

### D9 — Jerarquía de fotos: con marco es referencia, sin marco es mundo

Tres fotos en un diseño oscuro y minimalista es donde las cosas se ensucian. Se resuelve separando por función:

```
pareja    emoción       a sangre, sin marco, duotono fuerte navy→ámbar,
                        estrellas encima al 15%, grande
lugares   información   contenida, filete dorado, virada apenas (~70% sat),
                        pequeña, sin estrellas encima
```

Los lugares se viran apenas a propósito: un duotono fuerte sobre una iglesia la vuelve irreconocible, y el punto entero de esa foto es que la reconozcan.

**La foto del lugar reemplaza la portada del mapa.** El mapa ya iba a cargar solo al tocarlo, con una imagen estática de portada. Esa portada ahora es la foto del lugar. No se agrega un elemento: se cambia uno, y de paso se ahorra la imagen estática del mapa. También respeta el orden en que la gente piensa: primero *qué* es, después *dónde* queda.

Degradación en tres escalones, cada uno una página terminada:
```
foto + mapa       → la foto es la portada, se toca y sale el mapa
sin foto          → mapa estático de portada
sin foto ni mapa  → solo dirección en texto, sin marcos vacíos
```

Duotono no es solo estético: una imagen de dos colores comprime 4–5× mejor. Objetivo ≤80KB para la pareja, ≤50KB cada lugar.

### D10 — Movimiento: cinco cosas, y una de ellas es verdad

1. **Carga**: las estrellas aparecen escalonadas en 2.5s, las más brillantes primero — el orden real del anochecer. Los nombres entran después.
2. **Scroll**: el fondo se oscurece de crepúsculo a noche cerrada, **y el cielo rota** los ~30° de ascensión recta que corresponden a las 2 horas entre la misa y la recepción. No es una animación nueva: es la que ya existía, contando la verdad.
3. **Sí/No**: el filete dorado se dibuja en 200ms.
4. **Titileo**: 3 a 5 estrellas, ciclos desfasados de 4–6s, ±8% de opacidad. Un campo perfectamente estático se lee como diagrama; un titileo mínimo se lee como habitación con las luces prendidas.
5. **Confirmado**: una estrella se enciende.

`prefers-reduced-motion` suprime todo y presenta el estado final.

**Cortado deliberadamente**: un efecto de foil dorado reaccionando a la inclinación del teléfono (`DeviceOrientationEvent`). Precioso, pero el cielo ya es la firma, y dos elementos memorables compitiendo no dejan ninguno.

**También fuera**: parallax, scroll-jacking, pétalos flotando, guirnaldas de hojas, faroles de papel dibujados. De las fotos de referencia se lee **la luz, no los props** — así se abstraen las dos a la vez sin quedar pegado a ninguna.

### D11 — Recuerdo: Canvas 2D en el cliente

| Enfoque | Descartado por |
|---|---|
| `html2canvas` / captura del DOM | Fuentes y sombras salen mal, defectos conocidos en iOS |
| Render en servidor (satori/resvg) | Más infraestructura y latencia de la que amerita |
| **Canvas 2D dibujado a mano** | Elegido: control total, nítido, reutiliza los datos del cielo |

1080×1350. Detalle que decide el éxito en móvil: **en Safari de iOS el atributo `download` no funciona de forma fiable.** Con `navigator.share({files})` el invitado guarda la imagen directo en Fotos o la reenvía; descarga directa como reserva en escritorio. Y hay que esperar a `document.fonts.ready` antes de dibujar, o la imagen sale con tipografías de reserva.

### D12 — Hosting: el nombre del proyecto es irreversible, el dominio no

```
nombre del repo    ≠   proyecto en Vercel   =   el subdominio
wedding-dayo-javi      (elección pendiente)     ...vercel.app/i/{token}
```

Son campos independientes. **Renombrar el proyecto después del primer envío rompe los 70 enlaces**, que ya no se pueden recoger. Agregar un dominio propio más adelante **es seguro**: el `.vercel.app` sobrevive como alias y los enlaces viejos siguen vivos. Conclusión: no hay prisa por el dominio, solo por congelar el nombre.

Dos trampas de Vercel gratuito:
- Las URL de *preview* traen Vercel Authentication activada — un invitado que reciba una se topa con una pantalla de login. Se comparte únicamente la URL de producción.
- Los subdominios `.vercel.app` son por orden de llegada; hay que verificar disponibilidad antes de repartir nada.

Se descarta el `output: 'standalone'` + `outputDirectory` que arrastra `djfinanzas`: en Vercel con `framework: "nextjs"` se estorban entre sí.

### D13 — Rendimiento como requisito, no como aspiración

Los invitados abren esto desde datos móviles venezolanos. Una invitación de boda típica pesa 8–15MB en fotos y fuentes.

```
primera carga     HTML + 2 fuentes subset + catálogo estrellas + JS   ≤250KB
al hacer scroll   pareja ≤80KB · iglesia ≤50KB · salón ≤50KB
bajo demanda      iframes de mapa (0KB hasta el toque)
                  audio, preload="none" (0KB hasta el toque)
```

El patrón "no carga hasta que lo tocan" en mapas y audio no es solo peso: también evita que Google reciba un hit por cada visita, y evita bajar 3MB de MP3 a quien nunca lo va a escuchar.

Auditoría con Lighthouse y limitación de red como tarea, no como suposición.

### D14 — Texto: cálido pero correcto, en «tú»

Familia y amigos, con mayores leyendo. «La recepción», no «la fiesta» — una palabra fija el registro de la página entera.

Dos frases hacen trabajo de diseño:
- *"Apartamos estos lugares para ti."* explica sola por qué los nombres vienen puestos y no hay campo para agregar gente. Sin texto de ayuda, sin asteriscos.
- *"Marca quién puede venir."* nombra la acción exactamente como el sistema la ejecuta.

Al hablar en «tú» se le habla a **quien recibe el enlace**, no al grupo, y el problema de singular/plural se reduce a "un lugar" / "estos lugares".

Los mensajes de resultado nombran a quienes asisten y nunca a quienes no. Los errores no se disculpan y dicen qué hacer. El 404 no explica nada: monograma `D & J` y "Esta invitación es privada".

## Risks / Trade-offs

**El recorte vertical del cielo puede quedar pobre en pantalla de teléfono** → Riesgo abierto y el único que puede obligar a rehacer trabajo. Se resuelve con un spike de 2–3 horas *antes* de construir alrededor: proyectar, recortar a formato vertical y mirarlo. Si sale flojo se ajusta el encuadre o la proyección, no la idea. Reserva: fondo de crepúsculo puro sin astronomía, conservando tipografía, estructura y controles.

**Sin bloqueos en Sheets** → Escritura direccionada por `id`, resuelta en la misma petición, en un solo `batchUpdate`. Ventana residual de ~200ms, despreciable a 30 invitaciones repartidas en un año.

**La planner puede romper la hoja** (borrar filas, cambiar encabezados, editar un token) → Se acepta: es el precio de que el Sheet sea la fuente de verdad y ella pueda trabajar sin la aplicación. El historial de versiones de Google recupera. La aplicación se defiende leyendo por nombre de columna en vez de por letra, y tratando toda clave ausente como vacía en lugar de fallar.

**El Sheet es el único almacén** → Sin respaldo adicional por decisión explícita de la pareja: solo ellos pueden borrarlo y el historial de versiones basta.

**Enlaces irrecuperables una vez enviados** → El nombre del proyecto en Vercel se congela y se verifica su disponibilidad *antes* del primer envío. Se documenta que las URL de preview no se comparten.

**El corte llega en octubre de 2026; el estado congelado no se puede probar de forma natural** → Un override de entorno permite forzar el instante "ahora" en desarrollo. Sin eso, el modo lectura se probaría el día en que ya no importa.

**Tres fotos en un diseño minimalista pueden ensuciarlo** → Jerarquía explícita de tratamiento (D9) y la foto del lugar reemplazando la portada del mapa en vez de sumarse a ella.

**La foto del salón decorado no existe todavía** → Ese montaje ocurre el día de la boda. Sirve la foto promocional del local (suele venir montada e iluminada) o una de otro evento. Si ninguna convence, **se omite**: una foto floja hunde más de lo que una foto de más suma.

**Enumeración de tokens** → Base32 de 10+ caracteres aleatorios, `noindex`, sin sitemap, 404 idéntico para raíz y token inválido. A 70 invitados el riesgo es teórico; no se agrega limitación de tasa.

**Bodoni puede sentirse severa junto a una decoración cálida** → Tensión reconocida en D8, resuelta a favor de Bodoni con reemplazo de una línea a Marcellus si el prototipo lo desmiente.

## Migration Plan

No hay migración: el repositorio está vacío y no existe sistema previo.

**Orden de despliegue**
1. Spike del cielo. Sin esto validado, todo lo demás se construye sobre una apuesta.
2. Crear el proyecto en Vercel con el nombre definitivo, verificar disponibilidad del subdominio y **congelarlo**.
3. Service account de Google Cloud, Sheet compartido con su email, variables de entorno cargadas.
4. Construir el Sheet con sus tres pestañas y sus fórmulas.
5. Aplicación a producción, aún sin repartir enlaces.
6. La pareja carga los ~70 invitados a mano y genera los tokens.
7. Prueba de extremo a extremo con tokens reales, incluido el estado congelado vía override.
8. Repartir enlaces desde la columna `url` del Sheet, uno por uno.

**Reversión**: la aplicación no tiene estado propio. Volver a un despliegue anterior en Vercel es instantáneo y no afecta a los datos, que viven en el Sheet. Si la aplicación se cae por completo, el Sheet sigue siendo utilizable y la planner puede seguir trabajando y confirmando por teléfono.

## Open Questions

- **Nombre del proyecto en Vercel**: `wedding-dayo-javi` decidido, pero "wedding-" es una palabra de programador y el subdominio lo ven 70 personas en WhatsApp. `dayo-y-javi` se lee como invitación. Cambiar el campo es gratis; hay que decidir y verificar disponibilidad **antes del primer envío**. El nombre del repo puede ser distinto.
- **Coordenadas, direcciones e iframes** de la parroquia y del salón. Entran por `Config`, no bloquean.
- **Dress code**. Entra por `Config`, no bloquea.
- **¿Existen fotos aprovechables de la iglesia y del salón?** Formato pedido: horizontal 3:2. La iglesia, fachada de frente con la puerta por donde van a entrar, preferiblemente al atardecer.
- **Canción para la música de fondo.** Si es comercial y se aloja en el sitio, es técnicamente una infracción. En una invitación privada de 70 personas nadie va a reclamar, pero conviene que sea decisión consciente.
