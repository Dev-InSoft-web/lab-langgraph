## Migración `IPLANPADRE` → atributo (`IplanpadreToAtributoMigration.svelte`)

Refactor de modelo: la columna `CAPAC_PLANES_CURSOS.IPLANPADRE` se reemplaza por un atributo de plan llamado `iplanpadre`, definido en `CAPAC_ATRIBUTOS_X_DRIVERS` y materializado en `CAPAC_ATRIBUTOS_PLANES`. La ruta jerárquica se obtiene transformando `CAPAC_PLANDECURSO_OLD.DATO2` (cada 3 dígitos = un nivel) en notación `1.2.3`.

> Ejecuta las fases **en orden** (1 → 2a → 2 → 3 → 4) y valida resultados entre cada una. La Fase 3 es destructiva.
