### Fase 4 — `JCONFIG` dificultad → `select B/M/A`

Setea `JCONFIG = '{"options":["B","M","A"]}'` en todo `CAPAC_ATRIBUTOS_X_DRIVERS` cuyo `NATRIBUTO` contenga "dificultad" (case-insensitive) y aún no tenga `options`. El formulario de plan (pestaña Contenidos) usa esa config para renderizar `<select>` en lugar de `<input>` texto.
