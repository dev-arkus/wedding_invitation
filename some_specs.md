# Invitación digital de boda — Especificación

Documento de referencia para retomar el proyecto. Recoge requisitos definidos y decisiones técnicas acordadas.

---

## 1. Contexto

Pareja de informáticos organizando su boda. Existe una **wedding planner** que debe recibir las confirmaciones sin necesidad de aprender herramientas nuevas.

Objetivos:
- Confirmación (RSVP) por invitación, con control real de pases.
- Datos accesibles simultáneamente para la pareja y la planner.

---

## 2. Requisitos funcionales

### 2.1 Invitaciones y confirmación

| # | Requisito |
|---|---|
| R1 | **URL única por invitación** (`/i/{token}`). El token es la autenticación; sin login. |
| R2 | **Nombres fijos y precargados**, no conteo numérico. El invitado no declara cuántos son. |
| R3 | Cada nombre se marca **Sí / No** de forma independiente. |
| R4 | **Confirmación parcial permitida** (ej. van 2 de 3 anotados). |
| R5 | **Los niños ocupan pase**, igual que los adultos. Se distinguen solo por el campo `tipo` para efectos de catering. |
| R6 | La respuesta es **editable hasta 1 semana antes de la boda**. Pasada esa fecha queda congelada. |
| R7 | Tras el cierre, la URL sigue funcionando en **modo lectura** (muestra respuesta final + direcciones). |
| R8 | Se exige marcar **todos los nombres** antes de enviar, para poder distinguir "no viene" de "no respondió". |

### 2.2 Contenido de la invitación

- Cuenta regresiva.
- **Misa** y **Recepción** en dos secciones separadas, cada una con fecha y hora.
- Mapa de la iglesia y mapa del lugar del festejo.
- Botón para **generar y descargar una imagen resumen / recuerdo**, habilitado solo después de confirmar al menos 1 asistente.
- Aplicación de la **paleta de colores de la boda**.

### 2.3 Salida para la wedding planner

- **Google Sheet en vivo** como fuente de verdad visible. Filtrable, exportable, enviable al catering sin intervención técnica.
- Sin otras notificaciones.


---

## 6. Mapas

No usar el SDK de Google Maps (requiere key con facturación).

- Iframe de `maps/embed` (Compartir → Insertar mapa, sin key) o imagen estática.
- Botones de acción directa:
  - `https://www.google.com/maps/dir/?api=1&destination=LAT,LNG`
  - `https://waze.com/ul?ll=LAT,LNG&navigate=yes`

---

## 7. Paleta de colores

Extraída del moodboard de referencia (navy + dorado + blanco hueso).

| Rol | Hex | Uso |
|---|---|---|
| Navy profundo | `#1C2340` | Texto y fondos |
| Azul acero | `#4A5578` | Secundario |
| Dorado | `#B8862F` | Acentos, bordes |
| Dorado claro | `#E0C173` | Detalles, hover |
| Blanco hueso | `#F5F2EC` | Superficies |

**Aviso de contraste:** el dorado sobre blanco no cumple WCAG para texto corrido. Reservarlo para filetes, iconos y títulos grandes. Cuerpo de texto en navy.

---
