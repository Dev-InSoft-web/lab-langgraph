## 2 · Estándar de imágenes para tickets (`img()` + imgbb)

Las capturas dejan de servirse desde `public/imgs/...` y se publican
en **imgbb** vía `scripts/upload-assets-imgbb.mjs`. El resultado se
persiste en `src/lib/features/tickets/assets/imgbb-map.json`
(`sha1 → { url, width, height }`).

El helper `img(filename, targetW)` produce un `<a>` envolvente que
permite abrir la imagen en tamaño real y un `<img>` con `width`,
`height`, `min/max` clamp a `[300, 600]px` de alto, borde y
`cursor: zoom-in`.

Migrados al estándar: **TK-1426681**, **TK-1426669** y **TK-1426728**.
Se eliminan las carpetas `public/imgs/tickets/TK-*` obsoletas.
