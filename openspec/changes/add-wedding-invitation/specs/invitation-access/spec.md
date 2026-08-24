## ADDED Requirements

### Requirement: Acceso por token en la URL

El sistema SHALL servir cada invitación en `/i/{token}`, donde el token es el único mecanismo de autenticación. El sistema MUST NOT exigir login, registro ni contraseña.

Los tokens SHALL generarse aleatoriamente con al menos 10 caracteres de un alfabeto base32. El sistema MUST NOT emitir tokens secuenciales ni derivados del nombre del invitado.

#### Scenario: Token válido

- **WHEN** un visitante abre `/i/{token}` con un token que existe en la pestaña `Invitaciones`
- **THEN** el sistema responde 200 con la invitación completa, incluidos los nombres de los invitados de esa invitación

#### Scenario: Token inexistente

- **WHEN** un visitante abre `/i/{token}` con un token que no existe
- **THEN** el sistema responde 404 mostrando únicamente el monograma `D & J` y el texto "Esta invitación es privada"

#### Scenario: Raíz del sitio

- **WHEN** un visitante abre `/`
- **THEN** el sistema responde 404 con la misma página que un token inexistente

#### Scenario: Ruta desconocida

- **WHEN** un visitante abre cualquier otra ruta que no sea `/i/{token}` ni un asset
- **THEN** el sistema responde 404 con la misma página

### Requirement: Render en servidor sin exponer credenciales

El sistema SHALL leer el Google Sheet desde el servidor y entregar los nombres de los invitados ya presentes en el HTML de la respuesta.

Las credenciales del service account (`GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`) MUST permanecer del lado del servidor. El sistema MUST NOT incluirlas en el bundle del cliente, ni exponer una API key de Google, ni hacer que el navegador contacte a Google Sheets directamente.

#### Scenario: Nombres presentes en el HTML inicial

- **WHEN** se solicita `/i/{token}` válido y se inspecciona el HTML crudo de la respuesta
- **THEN** los nombres de los invitados aparecen en el marcado, sin necesidad de ejecutar JavaScript

#### Scenario: Sin credenciales en el cliente

- **WHEN** se inspecciona el bundle de JavaScript servido al navegador
- **THEN** no contiene el email del service account, la clave privada ni el ID del spreadsheet

### Requirement: Aislamiento entre invitaciones

Una invitación SHALL exponer únicamente los invitados asociados a su propio token. El sistema MUST NOT revelar otros tokens, otros invitados, ni totales globales de la boda a través de la página ni de sus endpoints.

#### Scenario: Solo los propios

- **WHEN** se carga `/i/{tokenA}` y la invitación tiene 3 invitados
- **THEN** la respuesta contiene esos 3 invitados y ningún dato de invitaciones distintas de `tokenA`

### Requirement: Modo lectura después del corte

Pasado el instante de corte, la URL de la invitación SHALL seguir funcionando en modo lectura: muestra la respuesta final registrada, las secciones de misa y recepción, y los mapas.

En modo lectura el sistema MUST NOT renderizar controles de Sí/No ni el botón de confirmar.

#### Scenario: Invitación congelada

- **WHEN** un invitado abre su URL después del instante de corte
- **THEN** ve su respuesta final, la información de los lugares y el mensaje "Cerramos la lista el 31 de octubre. Si algo cambió, escríbenos."
- **AND** no ve controles para modificar la respuesta

### Requirement: La invitación no debe indexarse

El sistema SHALL enviar `X-Robots-Tag: noindex, nofollow` y una etiqueta `robots` equivalente en las páginas de invitación, y SHALL servir un `robots.txt` que prohíba el rastreo. El sistema MUST NOT publicar un sitemap con tokens.

#### Scenario: Encabezados de no indexación

- **WHEN** un rastreador solicita `/i/{token}`
- **THEN** la respuesta incluye `X-Robots-Tag: noindex, nofollow`

### Requirement: Vista previa de enlace genérica

Las etiquetas Open Graph SHALL ser idénticas para todas las invitaciones: nombres de la pareja, fecha e imagen genérica. El sistema MUST NOT incluir nombres de invitados ni datos de la invitación específica en los metadatos Open Graph.

#### Scenario: Previsualización al compartir

- **WHEN** un enlace `/i/{token}` se pega en un chat y el rastreador del servicio solicita la página
- **THEN** los metadatos Open Graph devueltos son los mismos que para cualquier otro token, sin nombres de invitados

### Requirement: Errores de la fuente de datos no rompen la invitación

Si la lectura del Google Sheet falla, el sistema SHALL responder con una página de error legible que invite a reintentar. El sistema MUST NOT mostrar trazas de error, mensajes de la API de Google ni identificadores internos al invitado.

#### Scenario: Google Sheets no responde

- **WHEN** la llamada a la API de Google Sheets falla o expira al servir `/i/{token}`
- **THEN** el invitado ve un mensaje que explica que no se pudo cargar la invitación y sugiere intentar de nuevo
- **AND** el detalle técnico queda solo en los logs del servidor
