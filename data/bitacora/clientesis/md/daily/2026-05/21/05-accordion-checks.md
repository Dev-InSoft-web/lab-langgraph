## 5 · `Accordion` con `checkKey` / `checkKeys`

`Accordion.svelte` acepta nuevas props `checkKey?: string` y
`checkKeys?: string[]`. Cuando se proveen y **no** existe slot
`title-extra` custom, el accordion **auto-renderiza** un
`RevisadoCheck` agregado en su header (con estado mixto cuando
aplica), eliminando la repetición del check en cada llamado.

Aplicado al accordion **Seguridad · Insertar acciones faltantes en
SEG_ACCIONESXROL (Cursos, PlanDeEstudio)** que estaba sin check.
