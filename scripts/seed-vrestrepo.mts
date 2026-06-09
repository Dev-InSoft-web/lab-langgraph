/**
 * Crea/actualiza VRESTREPO (rol instrucciones_editor en lab-permissions.json).
 * Contraseña por defecto: mesa-editar (sustantivo + verbo).
 *
 * Uso:
 *   npm run auth:seed-vrestrepo
 *   LAB_SEED_PASSWORD=otra-clave npm run auth:seed-vrestrepo
 */
import "dotenv/config";
import { preloadIsaDocSecrets } from "../src/lib/core/secrets.js";
import { upsertLabUser } from "../src/lib/auth/users.js";

preloadIsaDocSecrets();

const username = "VRESTREPO";
const password = process.env.LAB_SEED_PASSWORD?.trim() || "mesa-editar";

await upsertLabUser({
	username,
	password,
	displayName: "VRESTREPO",
	roleCode: "instrucciones_editor",
});
console.log(`Usuario lab listo: ${username} (rol: instrucciones_editor en BD)`);
console.log(`Contraseña inicial: ${password}`);
