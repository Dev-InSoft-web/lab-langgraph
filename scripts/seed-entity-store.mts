/**
 * Pobla lab.entity_row desde data/ e ISA-DOC static-api.
 *
 *   npm run entity:seed
 */
import { preloadIsaDocSecrets } from "../src/lib/core/secrets.js";
import { ensureEntityControllersRegisteredAsync } from "../src/lib/ispgen/register.js";
import { seedAllCatalogData } from "../src/lib/ispgen/seed-catalog-data.js";

preloadIsaDocSecrets();
await ensureEntityControllersRegisteredAsync();
const data = await seedAllCatalogData();
console.log("[ok]", data);
