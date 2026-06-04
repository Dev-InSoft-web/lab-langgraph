# TK-1424911 — Imágenes pendientes

Coloca aquí la captura adjuntada por el ingeniero (pestaña Contenido vacía
con el botón Agregar tras crear curso) y luego ejecuta:

```powershell
node scripts/upload-assets-imgbb.mjs
```

Sugerencias de nombre:

- `contenidoBotonAgregar.jpg` — estado inicial reportado (árbol vacío).
- `contenidoPersistido.jpg` — verificación con el nodo persistido tras el
  fix.

Una vez subidas, agrega la referencia con `img(...)` en `TK-1424911.ts`.
