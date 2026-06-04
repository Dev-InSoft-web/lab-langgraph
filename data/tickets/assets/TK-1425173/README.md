# TK-1425173 — Imágenes pendientes

Coloca aquí las capturas de soporte y luego ejecuta:

```powershell
node scripts/upload-assets-imgbb.mjs
```

Capturas esperadas (resuelto: plan padre del recurso como catálogo filtrado):

- `planPadreAntes.jpg` — estado previo del campo **Plan padre** como
  captura numérica libre.
- `planPadreBtnRef.jpg` — campo **Plan padre** rediseñado como **BtnRef**
  en dificultad Medio/Avanzado.
- `planPadreCatalogo.jpg` — catálogo del BtnRef mostrando únicamente los
  **hermanos del mismo capítulo** con dificultad Básico (sin exponer todo
  el árbol del contenido del curso).
- `planPadreOcultoBasico.jpg` — el campo queda oculto cuando la dificultad
  del recurso es Básico.

Una vez subidas, agrega las referencias en `TK-1425173.ts` con
`img("planPadreAntes.jpg")`, etc., siguiendo el patrón de `TK-1424911.ts`:
una figura justo antes de cada sección (Requerimientos / Solución aplicada).
