## 8 · Lección: merge remoto puede borrar entradas de `imgbb-map.json`

Durante la jornada se hicieron `git pull` con merge mientras había
commits locales sin push que tocaban
`src/lib/features/tickets/assets/imgbb-map.json`. El merge resolvió tomando la
versión remota y **eliminó 8 entradas** del mapa
(`tk1428161-*`, `tk1426900-*`, `contenido-curso-edit.png`,
`seguridad-form-*`, `seguridad-lista.png`). El viewer de tickets
empezó a tirar `Error: imgbb-map.json sin entrada para …` en todos
los tickets que dependían de esas claves.

**Diagnóstico rápido:** comparar `git show <hash>:.../imgbb-map.json`
contra la versión actual con `Compare-Object` sobre las llaves del
JSON revela qué entradas se perdieron.

**Resolución sin re-subir a imgbb:** restaurar sólo las claves
faltantes desde el commit previo (las URLs en imgbb siguen vivas):

```pwsh
node -e "const fs=require('fs'),cp=require('child_process');
const old=JSON.parse(cp.execSync('git show <hash>:src/lib/features/tickets/assets/imgbb-map.json'));
const p='src/lib/features/tickets/assets/imgbb-map.json';
const cur=JSON.parse(fs.readFileSync(p,'utf8'));
for(const k of Object.keys(old)) if(!(k in cur)) cur[k]=old[k];
fs.writeFileSync(p,JSON.stringify(cur,null,'\t')+'\n');"
```

### 8.1 · Iconos `mdi:*` faltantes en `public/icons/iconify/mdi/`

`config/downloadIconify.js` escanea el código y descarga, pero hoy
saltó tres SVG (`mdi:check-decagram`, `mdi:image-outline`,
`mdi:source-commit`): aparecían como `[icono] …` sin ser realmente
escritos a disco (uno incluso quedó en `0 bytes`). Como fallback se
descargan a mano desde la API pública:

```pwsh
$dir = "public/icons/iconify/mdi"
foreach ($n in @("check-decagram","image-outline","source-commit")) {
  Invoke-WebRequest -Uri ("https://api.iconify.design/mdi/" + $n + ".svg") `
    -OutFile "$dir/$n.svg" -UseBasicParsing
}
```

> **Regla:** tras cualquier `git pull --merge` que toque
> `imgbb-map.json` o iconos, validar el viewer en `localhost:4400` y
> revisar la consola del navegador antes de cerrar la jornada.
