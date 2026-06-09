### Fase 2 — Migrar `DATO2` → `CAPAC_ATRIBUTOS_PLANES`

Transforma `CAPAC_PLANDECURSO_OLD.DATO2` (cadena de tripletes de 3 dígitos) a la representación jerárquica con puntos:

- `'001002003'` → `'1.2.3'`
- `'010001'`    → `'10.1'`

E inserta el resultado en `CAPAC_ATRIBUTOS_PLANES (IPLAN, ICURSO, IATRIBUTO, BACTIVO, VALOR, IUSUARIOCRE, IAPPCRE, IPCRE, FHCRE, IUSUARIOULT, IAPPULT, IPULT, FHULT)` enlazado al atributo `iplanpadre` del driver del curso (`CAPAC_CURSOS.IDRIVER`).

> **Blindaje:** la versión anterior insertaba filas para *cualquier* `(ICURSO, IPLAN)` presente en `CAPAC_PLANDECURSO_OLD`, lo que generaba `IPLAN` huérfanos cuando el plan ya no existía. Ahora la fase **filtra** uniendo con `CAPAC_PLANES_CURSOS`.

Reglas:
- Idempotente (`NOT EXISTS` por PK lógica `(IPLAN, ICURSO, IATRIBUTO)`).
- Se aplica `LTRIM/RTRIM` a `DATO2` y se descartan filas con caracteres no numéricos (`NOT LIKE '%[^0-9]%'`).
- Sólo procesa filas con `LEN(DATO2) >= 3` y `LEN(DATO2) % 3 = 0`.
- `BACTIVO = 1`; audit fields (`IUSUARIOCRE/IAPPCRE/IPCRE/FHCRE` y sus `*ULT`) se llenan con `migration-iplanpadre` / `ISA-DOC` / IP del cliente / `GETDATE()`.
- Se descartan rutas vacías (`VALOR <> ''`).
