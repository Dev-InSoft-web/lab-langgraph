## 4 · Iconos `<img>` con `?color=` + min/max width

Los íconos de `h3Iconized` y `note` ahora se renderizan como
`<img src="https://api.iconify.design/<set>/<name>.svg?color=%23hex">`
en vez del SVG embebido.

El helper `icon()` fija `width`/`height` + `min-width`/`max-width` +
`min-height`/`max-height` para evitar que clientes de correo
reescalen el ícono por viewport y degraden la legibilidad del bullet.
