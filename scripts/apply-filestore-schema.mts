/**
 * Aplica 027_filestore.sql y 028_auth_login_penalty.sql en BD_LANGLAB,
 * respalda las credenciales del filestore en CREDENCIALES y asegura el bucket remoto.
 *
 *   npm run db:apply-filestore
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { getLanglabPgPool, pingPatyDb, queryPaty } from "../src/lib/db/pg.js";
import { getFilestoreConfig, getFileStorage } from "../src/lib/filestore/storage.js";

preloadLabSecrets();

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

console.log("Comprobando conexión BD_LANGLAB…");
if (!(await pingPatyDb())) {
	console.error("FALLO: LANGLAB_DATABASE_URL");
	process.exit(1);
}
console.log("  langlab: OK\n");

for (const file of ["027_filestore.sql", "028_auth_login_penalty.sql"]) {
	console.log(`Aplicando ${file}…`);
	const sql = await readFile(path.join(root, "db/schema/ops", file), "utf8");
	await getLanglabPgPool().query(sql);
}
console.log("  schemas: listos\n");

console.log("Respaldando credenciales del filestore en CREDENCIALES…");
const cfg = getFilestoreConfig();
const creds: Array<[string, string, string]> = [
	["FILESTORE_PROVIDER", "Proveedor actual del filestore (/api/files)", cfg.provider],
	["FILESTORE_ACCOUNT_ID", "Account ID del proveedor del filestore", cfg.accountId],
	["FILESTORE_API_TOKEN", "API token del proveedor del filestore", cfg.apiToken],
	["FILESTORE_BUCKET", "Bucket/contenedor del filestore", cfg.bucket],
];
for (const [nombre, descripcion, valor] of creds) {
	const updated = await queryPaty(
		`UPDATE "BD_LANGLAB"."CREDENCIALES"
		 SET "DESCRIPCION" = $2, "VALOR" = $3, "ACTUALIZADO_EN" = now()
		 WHERE "NOMBRE" = $1 RETURNING "ID"`,
		[nombre, descripcion, valor],
	);
	if (!updated.length) {
		await queryPaty(
			`INSERT INTO "BD_LANGLAB"."CREDENCIALES" ("NOMBRE","DESCRIPCION","VALOR") VALUES ($1,$2,$3)`,
			[nombre, descripcion, valor],
		);
	}
	console.log(`  ${nombre}: respaldada`);
}

console.log(`\nAsegurando bucket remoto '${cfg.bucket}'…`);
try {
	await getFileStorage().ensureBucket();
	console.log("  bucket: OK");
} catch (err) {
	console.warn(`  [aviso] no se pudo asegurar el bucket: ${err instanceof Error ? err.message : err}`);
	console.warn("  El CRUD de BD funciona; el contenido remoto fallará hasta corregir permisos del token.");
}

console.log("\n[ok] Filestore preparado.");
process.exit(0);
