# Almacén de entidades (ispgen-lite)

Capa genérica inspirada en Capacitación (`sqlDetalle`, `InsertQryDetalle`, `JSDetail`), preparada para extraer a `@jeff-aporta/general`.

## Catálogo (proyectos → secciones → entidades)

| SQL | Contenido |
|-----|-----------|
| `007_entity_catalog.sql` | DDL + secuencias `seq_store_*` |
| `008_seed_projects_sections.sql` | 3 proyectos, 13 secciones |
| `009_seed_entity_definitions.sql` | 32 definiciones (regenerar con `npm run catalog:sql:gen`) |
| `010_seed_entity_rows_note.sql` | Datos vía `npm run entity:seed` |

API metadatos:

- `GET /api/catalog/projects` — árbol proyecto + secciones
- `GET /api/catalog/projects/{project}/sections`
- `GET /api/catalog/projects/{project}/sections/{page}/entities`
- `POST /api/catalog/bootstrap?data=1` — metadatos + seed datos

## Segmentación CRUD

Ruta: `GET|POST /api/entity/{project}/{page}/{entity}`  
Ejemplo: `isa-doc` / `tickets` / `imgbb-asset`

Filtros en listados (evitan dumps):

| Query | Uso |
|-------|-----|
| `limit`, `offset` | Paginación (máx. 500) |
| `q` | Búsqueda en body |
| `fields` | Proyección de columnas |
| `parentPk`, `ticketId` | Hijos de un ticket |
| `tags` | Etiquetas (AND) |
| `filter.campo=valor` | Filtro en `body` |

Detalle anidado (GET por PK):

- `?detail=todo`
- `?detail=assets` o `?detail={"assets":{"todo":true}}`

Respuesta estilo ISP: `{ encabezado, respuesta: { datos | lista, total } }`.

## Proyectos y entidades (resumen)

| Proyecto | Secciones | Entidades (ej.) |
|----------|-----------|-----------------|
| isa-doc | tickets, postman, bitacora, patyia, openai, clientesis-schema, codegen | ticket, imgbb-asset, endpoint, revisado, prompt, table, state |
| patyia | api, prompts, caches, postman-catalog | catalog-endpoint, prompt-file, conversacion/jwt/… UI |
| clientesis | capacitacion, postman-catalog | driver, plan-estudio, curso, permiso, … + snapshots Postman |

Capacitación incluye propagación: `plan-estudio` → `cursosdeplanestudio`, `prerrequisitos`; `driver` → `atributos`; `curso` → `seguridades`, `estructuras`, `planescurso`.

Propagación al `POST`/`PUT`: arrays en claves `details` (ej. `assets` en ticket) insertan hijos con `parent_*`.

## Operación

```bash
npm run db:apply-schema          # 006…010 + 007–009 catálogo
npm run data:migrate-from-isa
npm run catalog:bootstrap        # metadatos si 009 vacío
npm run catalog:bootstrap -- --data
npm run entity:seed              # filas en lab.entity_row
npm run catalog:sql:gen          # regenerar 009 tras editar catalog-definitions.ts
```

- `GET /api/entity` — esquemas registrados en runtime
- `POST /api/entity/seed` — mismo seed que `entity:seed`

## Front estático

ISA-DOC: `fetch(\`${PUBLIC_LAB_LANGGRAPH_URL}/api/entity/isa-doc/tickets/imgbb-asset?ticketId=TK-...\`)`.
