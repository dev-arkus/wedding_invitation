# El Google Sheet

El Sheet es la fuente de verdad. La aplicación no tiene base de datos: si el sitio se cae, ustedes y la planner siguen trabajando aquí sin problema.

Tres pestañas, con esos nombres exactos: **`Invitados`**, **`Invitaciones`**, **`Config`**.

---

## Pestaña `Invitados`

Una fila por persona. Es la única pestaña donde la aplicación escribe, y solo toca dos celdas.

Fila 1, exactamente estos encabezados:

```
id | token | nombre | tipo | estado | actualizado | notas
```

Ejemplo:

| id | token | nombre | tipo | estado | actualizado | notas |
|---|---|---|---|---|---|---|
| g01 | a7k2mq | Javier Bastidas | adulto | pendiente | | |
| g02 | a7k2mq | Ana López | adulto | pendiente | | |
| g03 | a7k2mq | Mateo Bastidas | niño | pendiente | | |
| g04 | zz9wp1 | Carmen Herrera | adulto | pendiente | | |

- **`id`** — único en toda la hoja y **nunca se cambia**. Es la única cosa por la que la aplicación localiza una fila. Sirve `g01`, `g02`, …
- **`token`** — todas las personas de una misma invitación comparten token. Ver *Generar tokens* abajo.
- **`tipo`** — `adulto` o `niño`. Los dos ocupan pase; esto solo separa el conteo para el catering.
- **`estado`** — `pendiente`, `si` o `no`. **Sin acento en `si`** (ver más abajo).
- **`actualizado`** — la aplicación la llena sola, en formato ISO. No hay que tocarla.
- **`notas`** — libre. La aplicación nunca la sobrescribe.

### Pongan una lista desplegable en `estado`

Esto no es cosmético, previene el error más probable de todos.

> Seleccionar la columna E → **Datos → Validación de datos** → *Lista de elementos* → `pendiente,si,no` → *Rechazar la entrada*.

Sin esto, alguien va a escribir `Sí` con acento. La aplicación lo entiende igual, pero **las fórmulas `COUNTIF` de la otra pestaña no** — cuentan `si` y `Sí` como valores distintos, y los totales que salen al catering quedarían mal sin que nadie lo note.

### Reordenar columnas es seguro

La aplicación lee **por nombre de encabezado**, no por letra. Pueden mover columnas o agregar nuevas y nada se rompe. Lo único que no se puede cambiar son los nombres de los encabezados ni los `id`.

---

## Pestaña `Invitaciones`

Una fila por invitación. **La aplicación nunca escribe aquí.** Es la vista de trabajo de la planner y se calcula sola.

Fila 1:

```
token | grupo | contacto | whatsapp | pases | confirmados | pendientes | estado | url | mesa | notas
```

En la fila 2, estas cinco fórmulas, y luego se arrastran hacia abajo:

| Columna | Fórmula |
|---|---|
| **E** `pases` | `=COUNTIF(Invitados!$B:$B; $A2)` |
| **F** `confirmados` | `=COUNTIFS(Invitados!$B:$B; $A2; Invitados!$E:$E; "si")` |
| **G** `pendientes` | `=$E2-COUNTIFS(Invitados!$B:$B;$A2;Invitados!$E:$E;"si")-COUNTIFS(Invitados!$B:$B;$A2;Invitados!$E:$E;"no")` |
| **H** `estado` | `=IF($E2=0;"";IF($G2=$E2;"sin responder";IF($G2>0;"incompleta";"respondida")))` |
| **I** `url` | `="https://wedding-dayo-javi.vercel.app/i/"&$A2` |

> Si su Google Sheets usa **coma** en vez de punto y coma como separador de argumentos, cambien `;` por `,` en las cinco.

Notas sobre el diseño de estas fórmulas:

- `pendientes` se calcula por resta en lugar de contar la palabra `"pendiente"`. Así también cuenta las celdas **en blanco**, que es como se ve un invitado recién agregado.
- `estado` distingue tres cosas: **`sin responder`** (nadie de esa invitación contestó), **`incompleta`** (alguien contestó por unos y no por otros) y **`respondida`**.
- **`incompleta` no debería aparecer nunca por uso normal.** La aplicación obliga a marcar a todos antes de enviar. Si aparece, es que alguien editó a mano y dejó a una persona a medias — o sea, es una alerta útil.
- **`url`** hay que actualizarla si cambia el subdominio de Vercel. De esa columna se copian los enlaces para mandarlos por WhatsApp.

---

## Pestaña `Config`

Pares clave/valor. Cambian el contenido de la invitación sin desplegar nada.

Fila 1: `clave | valor`

| clave | valor de ejemplo | si está vacía |
|---|---|---|
| `misa_inicio` | `2026-11-07 18:00` | se usa el instante del entorno |
| `misa_lugar` | `Parroquia San José` | aparece "Por confirmar" |
| `misa_direccion` | `Carrera 5 con calle 8, San Cristóbal` | se omite |
| `misa_maps` | el `src` del iframe de Google Maps | no se ofrece mapa |
| `misa_coords` | `7.767123,-72.225456` | no aparecen los botones de llegar |
| `recepcion_inicio` | `2026-11-07 20:00` | se usa el instante del entorno |
| `recepcion_lugar` | | igual que arriba |
| `recepcion_direccion` | | |
| `recepcion_maps` | | |
| `recepcion_coords` | | |
| `dress_code` | `Etiqueta` | **la sección entera desaparece** |
| `mensaje_cierre` | `Los esperamos` | se omite |

**Las horas se escriben como `YYYY-MM-DD HH:mm`, en hora de Venezuela.** Si una no se entiende, la aplicación usa el instante de respaldo, deja una advertencia en el log y **sigue funcionando**: el conteo regresivo nunca se cae por un dedazo.

Ninguna clave vacía rompe nada. Las secciones incompletas se omiten enteras en vez de mostrarse a medias, así que pueden ir llenando esto a su ritmo.

### Lo que NO va aquí

La fecha de corte del RSVP **no está en `Config`**, está en las variables de entorno. Es a propósito: un dedazo en una celda editable no puede abrir ni cerrar la lista.

### Sacar las coordenadas y el iframe

- **Coordenadas** — en computadora, clic derecho sobre el punto exacto en Google Maps; el primer renglón del menú son las coordenadas. En el teléfono, mantener presionado hasta que caiga el pin. Apunten a la puerta, no al centro de la manzana.
- **Iframe** — buscar el lugar → **Compartir** → pestaña **Insertar un mapa** → copiar el HTML. Del bloque solo hace falta el `src`. No requiere API key ni facturación.

---

## Generar tokens

El token es la única llave de la invitación, así que **tiene que ser aleatorio**. Nada de `INV-001`, `INV-002`: eso se adivina en tres intentos.

Diez caracteres de un alfabeto sin ambigüedades (sin `l`, `1`, `0`, `o`). Pegar en una celda auxiliar, arrastrar, y luego **copiar → pegado especial → solo valores**, para que dejen de recalcularse:

```
=JOIN("";ARRAYFORMULA(MID("abcdefghijkmnpqrstuvwxyz23456789";RANDBETWEEN(1;32);1)*1^0))
```

Si esa fórmula da problemas en su versión de Sheets, esta más simple funciona igual:

```
=LOWER(DEC2HEX(RANDBETWEEN(1048576;16777215))&DEC2HEX(RANDBETWEEN(1048576;16777215)))
```

**Importante:** una vez que se copie el token a valores y salga el enlace por WhatsApp, ese token no se puede cambiar. Los enlaces no se pueden recoger.

---

## Compartir con la aplicación

Cuando el service account exista (tarea 2.2), hay que compartir este Sheet con su correo —termina en `.iam.gserviceaccount.com`— con permiso de **Editor**. Sin eso la aplicación no puede leer ni escribir.

Ese mismo correo va en `GOOGLE_CLIENT_EMAIL`, y el `GOOGLE_SHEET_ID` es el trozo largo de la URL del Sheet:

```
https://docs.google.com/spreadsheets/d/  ESTO ES EL ID  /edit
```

---

## Si alguien borra algo

Google Sheets guarda el historial completo: **Archivo → Historial de versiones → Ver historial**. Se restaura cualquier estado anterior. Solo ustedes y la planner tienen acceso de escritura, así que no hace falta ningún respaldo aparte.
