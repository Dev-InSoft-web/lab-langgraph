import { registerControllersFromCatalog } from "./catalog-load.js";

let done = false;
let registerPromise: Promise<void> | null = null;

/** Registra controladores desde lab.entity_definition (PG). */
export async function ensureEntityControllersRegisteredAsync(): Promise<void> {
	if (done) return;
	if (!registerPromise) {
		registerPromise = registerControllersFromCatalog().then(() => {
			done = true;
		});
	}
	await registerPromise;
}

/** Sync wrapper: registra en primer uso async vía store/catalog handlers. */
export function ensureEntityControllersRegistered(): void {
	if (done) return;
	void ensureEntityControllersRegisteredAsync();
}
