# Spike del cielo — resultado

**Veredicto: el cielo calculado se construye.** No hace falta la reserva de crepúsculo puro.

El riesgo abierto era si el recorte vertical del cielo real se vería bien en pantalla de teléfono. Se ve bien en los dos extremos de la rotación. Evidencia en `reference-misa.png` y `reference-recepcion.png`, ambos a 1080×1920.

---

## Validación de la proyección

Tres comprobaciones independientes, todas correctas:

| Comprobación | Esperado | Obtenido |
|---|---|---|
| Altitud de Polaris = latitud del observador | 7.77° | **7.73°** (Polaris está a dec 89.26°, no en el polo exacto) |
| Rotación entre misa y recepción | ~30° de AR en 2h | **30.08°** |
| Sirius, Canopus, Achernar bajo el horizonte | sí, son objetos de madrugada en noviembre | **sí** |

Posiciones para `2026-11-07T22:00:00Z` desde 7.77° N / −72.22° O:

```
Vega        alt 51.3°  az 327°  (noroeste, alto)
Deneb       alt 52.2°  az   6°  (norte, alto)
Altair      alt 82.8°  az 279°  (CASI EN EL CENIT)
Fomalhaut   alt 36.7°  az 136°  (sureste)
Antares     alt 24.6°  az 236°  (suroeste, Escorpio poniéndose)
Arcturus    alt  1.6°  az 289°  (justo en el horizonte)
```

**El Triángulo de Verano (Vega, Altair, Deneb) está encima a la hora de la misa.** Es el asterismo más reconocible del cielo y ancla la composición.

## Hallazgo: Altair cae entre los nombres

La declinación de Altair (+8.87°) casi coincide con la latitud de San Cristóbal (7.77°), así que culmina a 1.1° del cenit. En una proyección centrada en el cenit eso la deja a **69px del centro exacto del marco**:

```
cenit proyecta en   x=540  y=960
Altair              x=472  y=949
el "&" del lockup   x=540  y≈945
```

La estrella más cercana al cenit en el instante de su misa queda al hombro del `&`, entre sus dos nombres. No se buscó: sale de la latitud de la ciudad.

Se conserva como acento. Pero **la legibilidad manda**: en la implementación, las estrellas cuyo halo caiga dentro del rectángulo de un texto se atenúan y pierden el destello. En pantallas anchas la geometría cambia y no se puede depender de que quede bonito solo.

---

## Decisiones para la implementación

### Catálogo

- Fuente: Yale Bright Star Catalog (dominio público), vía `bsc5-short.json`.
- Filtro: magnitud aparente **< 4.5** → **892 estrellas**.
- Formato: arreglo de arreglos `[ra_deg, dec_deg, mag]`, 2 decimales en coordenadas y 1 en magnitud. Objetos con claves pesarían el doble sin aportar nada.
- **6.2KB comprimido** (16.4KB en crudo). El límite de la spec era 15KB comprimido.
- Se descarta recortar a solo las estrellas sobre el horizonte (417 de 892): ahorraría ~3KB pero la rotación con el scroll va metiendo estrellas nuevas al marco, y el recorte tendría que anticiparlas. No compensa.
- Se descarta aplicar precesión de J2000 a 2026: el desplazamiento máximo es ~0.36°, muy por debajo de un píxel de percepción a esta escala.
- Se descartan las columnas de temperatura de color y nombre propio: el campo se renderiza monocromo en `--luz`, y los nombres no se muestran.

### Proyección

Estereográfica centrada en el cenit.

```
z  = 90° − altitud
r  = R · tan(z / 2)
x  = ancho/2  + r · sin(azimut)
y  = alto/2   − r · cos(azimut)
```

`R` = **media diagonal del viewport**. Atarlo a la diagonal (y no al ancho o al alto) hace que el marco quede siempre cubierto de borde a borde, en cualquier proporción de pantalla, sin esquinas muertas. En un teléfono de 1080×1920 esto muestra el cielo desde el cenit hasta unos 38° de altitud a los lados, y hasta el horizonte en las esquinas.

Se probaron encuadres más cerrados (R = 1.5× y 2.2× la media diagonal): quedan vacíos —181 y 94 estrellas— y pierden el argumento central. **Las fotos de la decoración tienen cientos de luces, no docenas.** Con `R` = media diagonal entran 304 estrellas a la hora de la misa y 286 a la de la recepción, que es la densidad que empata con el salón.

### Brillo y tamaño

```
n      = (4.6 − magnitud) / 6.1        normalizado, acotado a [0,1]
radio  = 1.0 + n^2.5 · 7.0             px
alfa   = 0.22 + n^1.4 · 0.78
```

Los exponentes están altos a propósito: comprimen las estrellas tenues en un rumor de fondo y dejan que las cuatro brillantes destaquen. Con una curva lineal el campo se ve plano.

### Destellos

Cruz suave de cuatro puntas en las estrellas de **magnitud < 1.3**, que a la hora de la misa son exactamente cuatro: Vega, Altair, Deneb y Fomalhaut.

No es adorno de más: los globos de vidrio de las fotos de referencia también destellan. Sin esto el campo se lee como diagrama; con esto se lee como habitación iluminada. Se suprimen bajo `prefers-reduced-motion` sólo en su parte animada — el destello estático se queda.

### Fondo

Degradado vertical de `--noche` (arriba) a `--navy` (abajo), con curva `t^1.3`. El cielo es más profundo en lo alto y se aclara hacia el horizonte, como pasa de verdad y como se ve la tela drapeada de la recepción.

---

## Archivos

| Archivo | Qué es |
|---|---|
| `star-catalog.json` | Las 892 estrellas ya filtradas. **Se mueve a `app/lib/sky/` en la tarea 2.1.** |
| `derive.py` | Deriva el catálogo desde `bsc5-short.json`. Se conserva para poder regenerarlo. |
| `project.py` | Día juliano, GMST, LST y conversión a alt-azimut. Se porta a TypeScript en la tarea 5.1. |
| `reference-misa.png` | Cómo debe verse el hero a las 6:00 PM. |
| `reference-recepcion.png` | Cómo debe verse al final de la rotación, 8:00 PM. |

Los dos PNG son el criterio de aceptación visual de la tarea 5.1: si el render en el navegador no se parece a esto, algo se rompió.
