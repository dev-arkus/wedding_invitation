## 1. Spike del cielo (bloquea todo lo demás)

- [ ] 1.1 Obtener el Yale Bright Star Catalog (dominio público) y recortarlo a `{ra, dec, mag}` filtrando por magnitud < 4.5; verificar que el JSON resultante pese ≤15KB comprimido
- [ ] 1.2 Implementar la proyección de ecuatoriales a alt-azimutales para 7.77° N / −72.22° O en `2026-11-07T22:00:00Z`, y validar posiciones relativas contra una carta celeste de referencia
- [ ] 1.3 Renderizar un prototipo desechable del campo de estrellas recortado a formato vertical de teléfono y evaluarlo visualmente
- [ ] 1.4 Decidir y documentar: encuadre y proyección definitivos, o caída a la reserva de crepúsculo puro sin astronomía

## 2. Infraestructura y acceso a datos

- [ ] 2.1 Inicializar el proyecto Next.js 14 App Router con TypeScript y Tailwind; sin `output: 'standalone'` ni `outputDirectory`
- [ ] 2.2 Crear el service account en Google Cloud con scope `spreadsheets` y compartir el Sheet con su email
- [ ] 2.3 Portar `googleSheetsConfig.ts` desde `djfinanzas`, conservando `GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')`
- [ ] 2.4 Crear el Sheet con las tres pestañas y encabezados: `Invitados`, `Invitaciones` (con fórmulas COUNTIFS para `pases`/`confirmados`/`estado` y fórmula de `url`), `Config`
- [ ] 2.5 Definir `.env.example` con credenciales de Google, los tres instantes UTC y el override de "ahora" para pruebas
- [ ] 2.6 Implementar la lectura por **nombre de columna** (no por letra), tolerando columnas reordenadas y claves de `Config` ausentes
- [ ] 2.7 Implementar la lectura de `Config` con parseo de `misa_inicio`/`recepcion_inicio` como hora `America/Caracas`, con caída al instante de entorno y advertencia en log si no parsea
- [ ] 2.8 Implementar la escritura del RSVP: localizar filas por `id` en la misma petición, escribir solo `estado` y `actualizado` (ISO 8601) en un único `values.batchUpdate`
- [ ] 2.9 Añadir la verificación de arranque de que misa − corte = 604800s, con advertencia si no se cumple

## 3. Acceso por token y render en servidor

- [ ] 3.1 Implementar la ruta SSR `/i/[token]` que valida el token y renderiza los nombres en el HTML inicial
- [ ] 3.2 Implementar la página 404 con monograma `D & J` y "Esta invitación es privada", servida para `/`, tokens inválidos y rutas desconocidas
- [ ] 3.3 Añadir `X-Robots-Tag: noindex, nofollow`, la meta `robots` y un `robots.txt` que prohíba el rastreo; sin sitemap
- [ ] 3.4 Añadir metadatos Open Graph genéricos e idénticos para todo token, sin nombres de invitados
- [ ] 3.5 Implementar la página de error de lectura del Sheet, sin trazas ni identificadores internos visibles
- [ ] 3.6 Verificar que el bundle de cliente no contiene email del service account, clave privada ni ID del spreadsheet
- [ ] 3.7 Verificar el aislamiento entre invitaciones: la respuesta de un token no expone otros tokens, invitados ni totales

## 4. Sistema de diseño

- [ ] 4.1 Definir los tokens de color: `--noche`, `--navy`, `--azul-luz`, `--oro`, `--luz`, `--hueso` con jerarquía por opacidad
- [ ] 4.2 Cargar Bodoni Moda y Jost con `next/font`, subset latino, y definir la escala tipográfica
- [ ] 4.3 Auditar contraste: texto de cuerpo ≥4.5:1 en todas las combinaciones sobre fondos oscuros
- [ ] 4.4 Implementar el lockup de nombres `DAYONA & JAVIER` con tracking uniforme, verificando que los dos bloques de 6 letras queden ópticamente iguales
- [ ] 4.5 Construir el monograma `D & J` para favicon, 404 y pie del recuerdo

## 5. Campo de estrellas

- [ ] 5.1 Implementar el render del campo de estrellas con el encuadre definido en 1.4, modulando tamaño y brillo por magnitud
- [ ] 5.2 Implementar la aparición escalonada de carga: ~2.5s, de menor a mayor magnitud, con los nombres entrando después
- [ ] 5.3 Implementar la rotación de ~30° de ascensión recta ligada al scroll de misa a recepción, unificada con el oscurecimiento del fondo
- [ ] 5.4 Implementar el titileo de 3 a 5 estrellas, ciclos desfasados de 4–6s, ±8% de opacidad
- [ ] 5.5 Marcar el campo como decorativo para tecnologías de asistencia y excluirlo del orden de foco
- [ ] 5.6 Implementar la caída al fondo de color base si el render del cielo falla, sin bloquear contenido ni scroll
- [ ] 5.7 Suprimir toda animación del cielo bajo `prefers-reduced-motion`, presentando el estado final

## 6. Contenido de la invitación

- [ ] 6.1 Implementar el hero con el lockup de nombres, la fecha `07 · XI · MMXXVI` y el campo de estrellas
- [ ] 6.2 Implementar el conteo regresivo hacia el instante de la misa, con días como cifra dominante, numerales tabulares y mensaje de cierre tras la boda
- [ ] 6.3 Implementar las secciones de misa y recepción con marcadores en numeral romano `VI · 00` y `VIII · 00` derivados de los instantes
- [ ] 6.4 Implementar el bloque de lugar con carga diferida del mapa: portada → iframe `maps/embed` solo al pulsar, sin peticiones a Google Maps en la carga inicial
- [ ] 6.5 Implementar los botones de navegación directa a Google Maps y Waze a partir de las coordenadas de `Config`
- [ ] 6.6 Implementar la degradación en tres escalones del bloque de lugar: foto+mapa / solo mapa / solo dirección
- [ ] 6.7 Implementar la sección de dress code, omitida por completo cuando la clave está vacía
- [ ] 6.8 Preparar y colocar la foto de la pareja: duotono navy→ámbar, a sangre, estrellas al 15% encima, placeholder oscuro, ≤80KB
- [ ] 6.9 Preparar y colocar las fotos de iglesia y salón: 3:2, enmarcadas con filete, viradas apenas, ≤50KB cada una
- [ ] 6.10 Implementar el botón persistente de música: `preload="none"`, sin autoplay, en bucle, con pausa al ocultarse la pestaña
- [ ] 6.11 Redactar todo el texto en «tú», con variantes singular y plural según el número de invitados de la invitación

## 7. Confirmación (RSVP)

- [ ] 7.1 Implementar el control de Sí/No sobre `fieldset`/radios nativos, con el nombre del invitado como etiqueta de grupo, objetivos táctiles ≥44px y foco visible
- [ ] 7.2 Implementar el subrayado dorado que se dibuja en 200ms, asegurando que el estado seleccionado se distinga sin depender del color
- [ ] 7.3 Precargar en los controles el estado actual de cada invitado leído del Sheet
- [ ] 7.4 Implementar la validación de cliente que exige marcar todos los nombres, señalando cuál falta y conservando lo seleccionado
- [ ] 7.5 Implementar el endpoint `POST /api/rsvp`: revalidar token, revalidar corte con reloj de servidor, exigir todos los invitados, escribir por lotes
- [ ] 7.6 Implementar el rechazo de escrituras posteriores al corte, sin tocar el Sheet, devolviendo estado de "lista cerrada"
- [ ] 7.7 Implementar los mensajes de resultado: todos sí / parcial nombrando solo a quienes asisten / nadie asiste
- [ ] 7.8 Implementar el manejo de fallo de guardado, conservando las selecciones en pantalla
- [ ] 7.9 Implementar el modo lectura posterior al corte: respuesta final, lugares y mapas, sin controles ni botón de confirmar
- [ ] 7.10 Implementar la animación de estrella que se enciende al confirmar

## 8. Imagen recuerdo

- [ ] 8.1 Implementar la generación con Canvas 2D a 1080×1350, reutilizando los datos del cielo, con nombres de la pareja, fecha y asistentes confirmados
- [ ] 8.2 Esperar a `document.fonts.ready` antes de dibujar texto
- [ ] 8.3 Implementar la entrega vía `navigator.share({files})` cuando esté disponible, con descarga directa como reserva
- [ ] 8.4 Mostrar el botón solo cuando hay al menos un `si`, incluido el regreso posterior al corte
- [ ] 8.5 Implementar el estado de trabajo del botón y el mensaje de reintento si la generación falla

## 9. Rendimiento y accesibilidad

- [ ] 9.1 Medir la primera carga con limitación de red y verificar ≤250KB (HTML + fuentes + catálogo + JS)
- [ ] 9.2 Verificar que fotos, mapas y audio no cuentan en la primera pintada
- [ ] 9.3 Recorrer la invitación completa solo con teclado, comprobando foco visible en todos los controles
- [ ] 9.4 Verificar el comportamiento bajo `prefers-reduced-motion` en toda la página
- [ ] 9.5 Probar en un teléfono real: iOS Safari y Android Chrome

## 10. Despliegue y puesta en marcha

- [ ] 10.1 Decidir el nombre definitivo del proyecto en Vercel, **verificar disponibilidad del subdominio** y congelarlo
- [ ] 10.2 Crear el proyecto en Vercel, cargar variables de entorno y desplegar a producción
- [ ] 10.3 Añadir `vercel.json` con los encabezados de seguridad portados desde `djfinanzas`
- [ ] 10.4 Probar el estado congelado usando el override de "ahora", verificando modo lectura y rechazo de escrituras
- [ ] 10.5 Cargar los ~70 invitados en la pestaña `Invitados` con tokens aleatorios base32 de 10+ caracteres, agrupados por invitación
- [ ] 10.6 Prueba de extremo a extremo con tokens reales: confirmación total, parcial, ninguna, cambio de respuesta y descarga del recuerdo
- [ ] 10.7 Verificar que una edición manual de la planner en el Sheet se refleja en la invitación y sobrevive a un envío posterior del invitado
- [ ] 10.8 Documentar en el README: cómo restaurar el Sheet desde el historial de versiones, y que nunca se comparten URL de preview
- [ ] 10.9 Repartir los enlaces desde la columna `url` del Sheet
