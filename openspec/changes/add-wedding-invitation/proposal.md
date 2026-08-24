## Why

Dayona Herrera y Javier Bastidas se casan el **sábado 7 de noviembre de 2026** en San Cristóbal, Táchira (Venezuela): misa a las 6:00 PM, recepción a las 8:00 PM. Son ~70 invitados y hay una wedding planner que debe ver las confirmaciones en vivo sin aprender herramientas nuevas.

El problema no es "hacer una página bonita": es **control real de pases**. Un contador numérico ("¿cuántos van?") permite que una invitación de 3 se convierta en 5. Los nombres vienen fijos desde la invitación y el invitado solo marca Sí/No por cada uno. La lista vive en un Google Sheet porque es la única herramienta que la pareja y la planner ya comparten, y desde ahí sale directo al catering.

## What Changes

**Aplicación nueva** (repositorio vacío hoy). Next.js 14 App Router + `googleapis` con service account, desplegada en Vercel. Reutiliza el patrón ya probado en el repo hermano `djfinanzas`.

**Acceso y confirmación**
- URL única por invitación `/i/{token}`. El token es la autenticación; sin login.
- SSR: el servidor valida el token, lee el Sheet y renderiza los nombres en el HTML. La credencial de Google nunca llega al navegador.
- Nombres fijos y precargados. Cada uno se marca Sí/No de forma independiente.
- Confirmación parcial permitida (van 2 de 3). Los niños ocupan pase igual que los adultos.
- Obligatorio marcar **todos** los nombres antes de enviar, para distinguir "no viene" de "no respondió".
- Editable hasta el corte. Después queda congelada en modo lectura, con la URL viva.
- `/` y cualquier token inválido → 404 con el monograma y nada más.

**Instantes fijos** (UTC, en env, evaluados con reloj de servidor):
```
misa       2026-11-07T22:00:00Z    (7 nov 6:00 PM VE)
recepción  2026-11-08T00:00:00Z    (7 nov 8:00 PM VE)
corte      2026-10-31T22:00:00Z    (31 oct 6:00 PM VE)
```

**Google Sheet como fuente de verdad**, tres pestañas: `Invitados` (una fila por persona), `Invitaciones` (vista de la planner, con fórmulas) y `Config` (contenido editable de la invitación). La pareja y la planner editan a mano; la app escribe únicamente dos celdas por invitado (`estado`, `actualizado`) y siempre busca por `id`, nunca por índice de fila.

**Contenido de la invitación**: conteo regresivo, misa y recepción en secciones separadas, mapas de ambos lugares, foto de la pareja, foto pequeña de la iglesia y del salón, dress code, música de fondo con botón, e imagen recuerdo descargable tras confirmar al menos 1 asistente.

**Elemento firma — el cielo de esa noche**: el fondo del hero es el cielo real sobre San Cristóbal el 7 de noviembre de 2026 a las 6:00 PM, calculado a partir de un catálogo de estrellas brillantes. La decoración de la recepción (cientos de luces cálidas sobre tela azul profunda) ya es un cielo estrellado, así que la invitación funciona como vista previa del salón.

**Fuera de alcance**: PWA, hashtag, playlist colaborativa, galería, mesa de regalos, hospedaje, pases extra, alergias/menú, notificaciones, dominio propio, y cualquier API de WhatsApp (los links se envían a mano).

## Capabilities

### New Capabilities

- `invitation-access`: resolución de `/i/{token}`, validación, render SSR, modo lectura tras el corte, 404 para raíz y tokens inválidos.
- `guest-registry`: contrato del Google Sheet — pestañas, columnas, fórmulas, escritura acotada por `id`, tolerancia a edición manual concurrente de la pareja y la planner.
- `rsvp`: marcado Sí/No por nombre, confirmación parcial, exigencia de marcar todos, ventana de edición y congelamiento por reloj de servidor.
- `invitation-content`: conteo regresivo, secciones de misa y recepción, mapas con carga diferida, fotos, dress code, música, y degradación limpia cuando faltan datos en `Config`.
- `night-sky`: cálculo y render del campo de estrellas para el instante y las coordenadas de la boda, con su comportamiento de movimiento y accesibilidad.
- `keepsake-image`: generación en cliente de la imagen recuerdo y su entrega al invitado.

### Modified Capabilities

Ninguna. `openspec/specs/` está vacío — es el primer cambio del proyecto.

## Impact

**Repositorio**: hoy solo tiene `README.md` y `some_specs.md`. Este cambio crea la aplicación entera.

**Dependencias nuevas**: `next@14`, `react@18`, `googleapis`, `tailwindcss`. Sin SDK de Google Maps (los mapas van por iframe de `maps/embed`, sin API key ni facturación).

**Servicios externos**:
- Google Cloud: un service account con scope `spreadsheets`, y el Sheet compartido con su email.
- Vercel: proyecto en plan gratuito. **El nombre del proyecto es el subdominio y debe congelarse antes de enviar el primer link** — renombrarlo rompe los 70 links ya repartidos, y no hay forma de recogerlos. Agregar un dominio propio más adelante es seguro (el `.vercel.app` sobrevive como alias).

**Configuración**: `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`, más los tres instantes UTC y un override para poder probar el estado congelado antes de octubre de 2026.

**Restricción de rendimiento**: los invitados abren esto desde datos móviles en Venezuela, casi todos en teléfono. Presupuesto de primera carga **≤ 250KB** (HTML + fuentes + catálogo de estrellas + JS). Las tres fotos, los mapas y el audio van por debajo del pliegue y no cargan hasta que hacen falta.

**Riesgo técnico abierto**: falta validar que el recorte vertical del cielo calculado se vea bien en pantalla de teléfono. Se resuelve con un spike antes de construir alrededor.

**Decisiones pendientes que no bloquean**: coordenadas y direcciones de la parroquia y el salón, dress code, y si existen fotos aprovechables de ambos lugares. Todo eso entra por la pestaña `Config` o por el repo, sin cambios de arquitectura.
