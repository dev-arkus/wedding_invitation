# Fotos

Dejen los archivos aquí con **estos nombres exactos**, en minúsculas:

| Archivo             | Qué es                | Formato sugerido        |
|---------------------|-----------------------|-------------------------|
| `pareja.jpg`        | Ustedes dos           | vertical u horizontal   |
| `iglesia.jpg`       | Fachada de la parroquia | horizontal 3:2        |
| `salon.jpg`         | Salón de la recepción | horizontal 3:2          |

Después, descomenten la entrada correspondiente en `app/lib/photos.ts`.

## No hay que preparar nada

JPG o PNG tal como salen de la cámara o del teléfono. `next/image` las reescala
y las sirve en AVIF/WebP según el navegador, y el viraje de color se aplica por
CSS. No hace falta convertir, recortar ni tonificar a mano.

Manden la resolución alta (1600–2500px de ancho). Next genera los tamaños
pequeños solo, y partir de algo grande da mejor resultado que de algo ya
comprimido.

## Qué foto tomar

**Iglesia** — la fachada de frente, con la puerta por donde van a entrar. Al
atardecer si se puede: la luz cálida ya empata con la paleta.

**Salón** — ojo, el salón *decorado* no existe todavía; ese montaje ocurre el día
de la boda. Sirve la foto promocional del local (suele venir montada e
iluminada) o una de otro evento ahí. Si ninguna convence, **déjenla fuera**: una
foto floja hunde más de lo que una foto de más suma.
