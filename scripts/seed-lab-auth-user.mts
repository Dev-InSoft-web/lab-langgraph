/**
 * Crea/actualiza usuario lab (bcrypt en BD).
 * Uso: LAB_SEED_USERNAME=JAGUDELOE LAB_SEED_PASSWORD=... npm run auth:seed-user
 */
import "dotenv/config";
import { preloadIsaDocSecrets } from "../src/lib/core/secrets.js";
import { upsertLabUser } from "../src/lib/auth/users.js";

preloadIsaDocSecrets();

const username = process.env.LAB_SEED_USERNAME?.trim() || "JAGUDELOE";
const password = process.env.LAB_SEED_PASSWORD?.trim() || "Jeffrey1.618";

const roleCode = process.env.LAB_SEED_ROLE?.trim() || "admin";
await upsertLabUser({ username, password, displayName: username, roleCode });
console.log(`Usuario lab listo: ${username.toUpperCase()} (rol: ${roleCode})`);
