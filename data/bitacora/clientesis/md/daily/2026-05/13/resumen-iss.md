# ISP-ClientesISServer / ISS-ClientesIS-ContaPymeU

Bitácora del 2026-05-13.

## ISP-CLientesISServer

Sin cambios en el periodo.

## ISS-ClientesIS-ContaPymeU

- **`a82a112` · `feat(capacitacion)`** — Se **exponen todas las acciones
   soportadas** en los catálogos maestros de `TCurso` y `TPlanDeEstudio`.
   Se eliminó el `omitir: ["Verificar","Duplicar","Recodificar","Consolidar"]`
   del `registerCatalogoGenAzureFunction` para que la Function app
   publique los 8 endpoints heredados de `TCatalogoGenController`:
   `Crear`, `Modificar`, `Visualizar` (Obtener), `Listar`, `Eliminar`,
   `Verificar`, `Duplicar`, `Recodificar`, `Consolidar`.

   Los catálogos **slave** y `Pivot` no requirieron cambios: su CRUD se
   mantiene como estaba; las acciones globales (verificar, duplicar,
   recodificar, consolidar) son exclusivas del maestro.

   `TDriver` y `TPermiso` quedaron con su configuración previa.

## Despliegue

- El cambio `a82a112` queda listo para la siguiente ventana de
   despliegue del ISS. El front (ISW) puede comenzar a consumir las
   nuevas rutas una vez se publique la Function:
   `/curso/verificar/{icurso}`, `/curso/duplicar/{icurso}`,
   `/curso/recodificar/{icurso}`, `/curso/consolidar/{icurso}` y
   análogos para `plan/estudio`.

## Estrategias y notas para próximos desarrolladores

### Activar el set completo de acciones de un catálogo maestro

`registerCatalogoGenAzureFunction` expone por defecto los 8 endpoints
del `TCatalogoGenController`. Para apagar alguno (típico en catálogos
auxiliares o `RelNoSysrecurso`) se usa el parámetro
`omitir: ["Verificar", "Duplicar", "Recodificar", "Consolidar", ...]`.
Cuando un catálogo necesite la API completa de mantenimiento avanzado
(consolidar = mover y borrar el origen; recodificar = renombrar PK;
duplicar = clonar; verificar = chequear integridad), basta con
**eliminar las entradas del array `omitir`**. El server respeta las
rutas por defecto (`<recurso>/verificar/<pk>`, `<recurso>/duplicar/<pk>`,
etc.). Si se requiere otra ruta, usar `cfg.paths.{verificar|duplicar|...}`.
