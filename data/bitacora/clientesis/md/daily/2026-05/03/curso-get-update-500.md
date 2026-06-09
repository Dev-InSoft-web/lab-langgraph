# 2026-05-03 — Curso GET/UPDATE devuelve HTTP 500 tras `npm i` limpio

> **Audiencia:** desarrolladores que mantienen `ISP-CLientesISServer`, `ISS-ClientesIS-ContaPymeU` y los consumidores que importan `@ingenieria_insoft/ispclientesisserver`.
> **Resumen:** `LIST` de cursos funciona, pero `GET /api/curso/{icurso}` y `PUT /api/curso/{icurso}` lanzaban 500. La causa estaba en el paquete `ispclientesisserver` publicado (1.0.153). El arreglo vivía solamente en la copia local, así que tras borrar `node_modules` y hacer `npm i` el bug volvía.

## 1. Síntomas

- `GET /api/cursos/{filtro}` ⇒ HTTP 200 (lista OK).
- `GET /api/curso/{icurso}` ⇒ HTTP 500.
- `PUT /api/curso/{icurso}` ⇒ HTTP 500.
- Reproducible inmediatamente después de:
  ```powershell
  Remove-Item node_modules -Recurse -Force
  npm i
  npm run start
  ```
  porque `npm i` reinstala la versión publicada (1.0.153) y sobrescribe cualquier parche local.

## 2. Causa raíz

El controlador `TCursoServer` en `ispclientesisserver` envuelve `Listar`/`Get` con `sqlDetalle({ todo })` que arrastra subconsultas anidadas (`tema`, `driver.atributos`, `seguridades`, `estructuras`, `planescurso → planpadre`). En la versión 1.0.153 publicada esa expansión genera SQL inválido para `Get`/`Update` (mientras que `Listar` no usa `sqlDetalle({ todo })` y por eso pasa).

El fix vive en código fuente local, **no** en la versión publicada en npm.

## 3. Diagnóstico (cómo confirmarlo)

1. Verificar la versión instalada:
   ```powershell
   Get-Content node_modules\@ingenieria_insoft\ispclientesisserver\package.json | Select-String '"version"'
   ```
2. Inyectar logs **localmente** en el ISS (no en el paquete) creando una subclase de `TCursoServer` en `ISS-ClientesIS-ContaPymeU/src/functions/FN-Capacitacion.ts` que registre `GetAsQry`/`UpdateAsQry`:
   ```ts
   class TCursoServerDebug extends TCursoServer {
       async Get(Obj: TCurso): Promise<boolean> {
           const ObjQuery: any = await (this as any).GetAsQry(Obj);
           console.log("[DBG Curso.Get] SQL:\n", ObjQuery?.sql);
           return await super.Get(Obj);
       }
       async Update(Obj: TCurso): Promise<boolean> {
           const ObjQuery: any = await (this as any).UpdateAsQry(Obj);
           console.log("[DBG Curso.Update] SQL:\n", ObjQuery?.sql);
           return await super.Update(Obj);
       }
   }
   registerCatalogoGenAzureFunction(TCursoServerDebug, TCurso, { /* ...config original... */ });
   ```
3. Reiniciar `npm run start` y disparar el endpoint para ver el SQL exacto que falla.

> ⚠️ **No** modifiques el paquete dentro de `node_modules`: cualquier `npm i` lo borra. Y **no** modifiques `ISP-CLientesISServer/src/.../02_Cursos.ts` para "parchearlo": eso solo se vería si republicas el paquete.

## 4. Solución persistente (paso a paso)

### 4.1 Sincroniza tu copia local del paquete contra los consumidores

```powershell
cd C:\Users\JAGUDELOE\Documents\Contapyme\ClientesIS\doc\ISA-DOC\scripts\PS1
.\sync-local-isp-clientesis.ps1
```

Este script:

1. Compila `ISP-ClientesIS` y `ISP-CLientesISServer` (`isnode` + `tsc`).
2. Reemplaza `node_modules\@ingenieria_insoft\ispclientesis*` en ISP-Server, ISS y ISW con el `dist` recién compilado.
3. Corrige `index.d.ts` (default export y mojibake).

> Este paso es lo que un `npm i` deshace. Es la razón por la que el 500 reapareció.

### 4.2 Verifica el arranque del ISS

```powershell
cd ISS-ClientesIS-ContaPymeU
npm run start
```

No debe registrarse dos veces `API_GET_CursoRecursoPlan` ni quedar archivos `FN-Swagger.*` huérfanos en `dist`. Si los hay, borra `dist` y vuelve a compilar.

### 4.3 Ejecuta la suite de verificación

```powershell
cd doc\ISA-DOC
npm run verify:api
```

Deben pasar `Driver`, `Curso` y `PlanEstudio` (CRUL completo). El log queda en `doc\ISA-DOC\scripts\verify-api\logs\out*.txt`.

### 4.4 Hazlo permanente: publica el paquete

Mientras la versión publicada en npm siga siendo `1.0.153`, **cualquier `npm i` lo regresa al estado roto**. Para que el fix sobreviva a un clone limpio:

1. En `ISP-CLientesISServer` corregir el error TS preexistente en `src/index.ts(3743)` sobre `Property 'contacto' does not exist on type 'TFiltro<TAsignacionTemaSoporte>'` (este error bloquea `npm run build` del paquete y por eso no se podía republicar).
2. `npm run build`.
3. Bumpear `package.json.version` (ej. `1.0.154`).
4. `pwsh .\pub.ps1` (publica con `.npmrc-publicar.npmrc`).
5. En ISS/ISW: `npm i @ingenieria_insoft/ispclientesisserver@latest` y commit del nuevo `package-lock.json`.

> Hasta que **se republique**, el flujo correcto tras un `npm i` es siempre re-ejecutar `doc/ISA-DOC/scripts/PS1/sync-local-isp-clientesis.ps1`.

## 5. Verificación final (qué debe pasar)

| Operación | Endpoint                       | Esperado |
| --------- | ------------------------------ | -------- |
| LIST      | `GET /api/cursos/e30=`         | 200      |
| GET       | `GET /api/curso/{icurso}`      | 200 con `tema/driver/seguridades/estructuras/planescurso` |
| POST      | `POST /api/curso`              | 201      |
| PUT       | `PUT /api/curso/{icurso}`      | 202      |
| Re-GET    | `GET /api/curso/{icurso}`      | 200 con datos actualizados |

## 6. Lecciones aprendidas

- **Instrumenta en el consumidor, no en el paquete** cuando el paquete tiene errores de build preexistentes que bloquean publicar.
- `npm i` reinstala desde el registro y borra cualquier `node_modules\@ingenieria_insoft\*` parcheado a mano. Si tu fix no está publicado, no es persistente.
- `tsc` no purga archivos huérfanos del `outDir`; un build sin limpiar `dist` puede dejar funciones fantasma (caso del swagger duplicado).
- En este monorepo la fuente de verdad son los repos `ISP-*`. `doc/ISA-DOC/scripts/PS1/sync-local-isp-clientesis.ps1` es el puente local; la publicación al npm registry es el puente persistente.
