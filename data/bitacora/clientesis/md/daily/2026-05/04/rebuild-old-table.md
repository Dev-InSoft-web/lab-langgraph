## Reconstrucción `{table}` desde CSV (`{old}`)

Pipeline de tres pasos para vaciar y volver a llenar la tabla destino con datos exportados desde su `*_OLD` en formato CSV (encabezados = columnas destino).

### Paso 1 · Eliminar tabla destino

Elimina la tabla viva si existe. Operación destructiva e idempotente: hace `DROP TABLE IF EXISTS`.

### Paso 2 · Crear tabla destino

Recrea la tabla con la DDL de `init_capacitacion.sql` (PK incluida). Si quedaron índices/FKs externos apuntando a la tabla previa, deben recrearse aparte.

### Paso 3 · Insertar datos desde CSV

Toma el CSV (encabezado + filas) y genera un `INSERT INTO ... VALUES (...)` por fila, envolviendo cada valor con `TRY_CAST(... AS <tipo>)` según el tipo declarado de la columna destino. Filas vacías se omiten; el `INSERT` falla en bloque si `XACT_ABORT` detecta inconsistencias.

> **Reglas:**
> - El CSV debe tener encabezado exacto con los nombres de columna destino.
> - Strings con coma o comilla deben ir entre `"..."` (escape de comilla = `""`).
> - Valores `NULL` se representan con la cadena vacía o `NULL` literal.
> - El orden de filas se respeta — útil para PKs naturales con dependencia interna.
