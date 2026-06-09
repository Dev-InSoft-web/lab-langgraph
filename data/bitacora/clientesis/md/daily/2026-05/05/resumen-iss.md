# ISP-ClientesISServer / ISS-ClientesIS-ContaPymeU

## ISP-ClientesISServer · Capacitación
- `TK-1420754` — Defaults de estructura de curso:
  - Renombrado `todoStruct` → `JData2HighDetail` en varias clases (alineación con la nueva nomenclatura del controller).
- `TK-1420755` — Listado básico de cursos:
  - Nuevo método `getFieldsListar` para el listado básico.
  - Nuevo `JData2List` en `TCapacitacionServer`, sobrescrito en `TCursoServer` para incluir `tema` y `driver` anidados (responde el ticket de campos vacíos en grid de curso).
- `TK-1420813` — Plan de curso:
  - El servicio de plan de curso ahora incluye datos del recurso asociado.
- Refactor de cursos: `TTemaServer` reemplazado por `TTemasController` en las configuraciones anidadas (consistente con el cambio del paquete cliente).

## ISS-ClientesIS-ContaPymeU
- `fix(capacitacion)`: se elimina el registro de tema en la función de capacitación (alineado con el reemplazo `TTema` → `TTemaSoporte` del cliente y la consolidación en `TTemasController`).
