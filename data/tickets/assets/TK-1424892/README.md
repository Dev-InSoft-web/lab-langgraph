# TK-1424892 — Imágenes pendientes

Capturas asociadas al refactor de BtnRef en planes de estudio y cursos,
y al ajuste de la pestaña Seguridad del curso.

## Capturas requeridas

Colocar los `.jpg` en esta misma carpeta con los siguientes nombres:

- `seguridadToolbarOk.jpg` — toolbar de la pestaña Seguridad del curso
  mostrando solo Refrescar / Filtro / Búsqueda / Selección y las pestañas
  laterales de Columnas y Filtro correctamente alineadas tras el fix.
- `btnRefPermisoSeguridad.jpg` — modal del BtnRef del permiso de seguridad
  abierto en modo consulta (sin acciones de mantenimiento), incluyendo el
  formulario de visualización del permiso.
- `btnRefDriverCurso.jpg` — BtnRef del driver del curso (350px, centrado)
  desplegado en el aviso de espera de la pestaña Estructura/Seguridad.
- `btnRefIPlanPadre.jpg` — BtnRef de iplanpadre del recurso mostrando el
  catálogo filtrado a hermanos del mismo capítulo, sin el propio registro
  ni los que ya tienen iplanpadre asignado.
- `btnRefTema.jpg` — BtnRef del tema en cursos, con caption que muestra
  solo el nombre y las columnas sobrescritas por la subclase local.
- `btnRefPrerrequisitos.jpg` — BtnRef de prerrequisitos del plan/curso
  con su callback de selección aplicado.
- `btnRefCursoDelPlan.jpg` — BtnRef del curso dentro de un plan de
  estudio, con la lista consumida vía API (sin label en rojo).

## Subida y referencia

Tras colocar los archivos, subir a imgbb y regenerar el mapa:

```powershell
node scripts/upload-assets-imgbb.mjs
```

Luego, en `src/lib/features/tickets/TK-1424892.ts`, descomentar el bloque marcado
con `// FIGURES:` y los `img(...)` correspondientes.
