# Proyecto ISA-DOC

- Bitácora del 2026-05-08 inicializada con tres resúmenes (ISW/ISP, ISS y
   este de seguimiento ISA-DOC).
- **TK-1423165** — Documentado el ticket recibido del ingeniero con
   cuatro hallazgos del módulo Capacitación → Plan de contenidos:
   nomenclatura de campos por nivel, atributos de capítulos por nivel,
   apertura del catálogo del recurso y creación del recurso bajo el padre
   correcto.
- **Íconos en bitácora y tickets — vuelta a SVG inline**: se intentó migrar
   los helpers `tk-helpers.ts` (`note`, `h3Iconized`) y los helpers locales
   del `TK-1418894.ts` a `<img>` hacia `api.iconify.design` (vía `icon`)
   buscando compatibilidad con Outlook, pero la imagen externa terminó
   bloqueada / no descargada en el cliente y dejaba un hueco. Se revirtió
   a `iconSvg` (SVG embebido inline), que sí se renderiza nativo dentro
   del HTML del correo.

## Estrategias y notas para próximos desarrolladores

### Íconos en bitácora y tickets — usar `iconSvg` (SVG inline)

`snippets.ts` expone dos funciones para íconos:

- `iconSvg(name, { size, color })` → asíncrona, embebe el SVG inline con `loadIcon` del paquete `ispsveltecomponents`. **Es la opción por defecto** y la que usan los helpers comunes (`tk-helpers.ts → note`, `h3Iconized`). Funciona en visor web y en correo (el SVG va dentro del HTML, no es un recurso externo).
- `icon(name, { size, color })` → devuelve `<img src="https://api.iconify.design/<icon>.svg?color=…" />` síncrono. Se intentó como alternativa "email-safe", pero Outlook bloquea la descarga de la imagen externa y deja un hueco. **No usar** salvo que el destino sea un visor web confiable que sí descargue imágenes externas y se prefiera evitar el peso del SVG inline.

Los helpers comunes (`tk-helpers.ts → note`, `h3Iconized`) y los locales del `TK-1418894.ts` están en `iconSvg`. Los TKs nuevos heredan ese comportamiento sin cambios.

### Estándar de imágenes en TKs — siempre vía imgbb

Toda evidencia visual de un cambio implementado se anexa al cuerpo del TK como imagen alojada en imgbb (no como base64 ni como ruta relativa al proyecto). El pipeline ya está armado en `doc/ISA-DOC` y el flujo es:

1. Capturar las pantallas representativas del cambio (estado actual del módulo después del trabajo del día). Idealmente cubrir cada hallazgo con su propia captura.
2. Guardar cada archivo (`.jpg`, `.jpeg`, `.png`, `.gif` o `.webp`) bajo `doc/ISA-DOC/src/lib/features/tickets/assets/<TK-CODE>/<nombre-descriptivo>.jpg`. Una carpeta por TK; nombres en `camelCase` o `kebab-case`.
3. Ejecutar desde `doc/ISA-DOC`:

   ```
   node scripts/upload-assets-imgbb.mjs
   ```

   El script calcula `sha1` de cada archivo, omite uploads cuyo hash ya está en `assets/imgbb-map.json` y sube solo los nuevos / modificados. Genera y mantiene `assets/imgbb-map.json` con `{ sha1, url, width, height }` por archivo. La key API por defecto está embebida; puede sobreescribirse con `IMGBB_API_KEY=…`.

4. En el `TK-1423165.ts`, importar y usar el helper:

   ```ts
   import { code, img } from "./snippets";

   // Dentro del cuerpo:
   img("treeContenidos.jpg")              // ancho por defecto 360px
   img("formularioEtiquetasTitulo.jpg", 480) // ancho explícito
   ```

   `img(filename, targetW = 360)` lee `imgbb-map.json`, calcula la altura (clamp `[300, 600]` px) y emite `<a href target="_blank"><img width height style="cursor:zoom-in"></a>`. Es síncrono y email-safe.

5. Anexar las imágenes entre las secciones `h3Iconized` del TK, una por sección o como portada inicial junto al `intro`. La regla mínima: **todo TK debe tener al menos una imagen de la pantalla actual implementada**.

Esto garantiza que el correo se vea completo en Outlook (los `<img>` con URL absoluta se renderizan; los recursos relativos / base64 grandes son bloqueados o descartados) y que el ticket conserve evidencia visual del estado entregado, sin inflar el repositorio con binarios duplicados.
