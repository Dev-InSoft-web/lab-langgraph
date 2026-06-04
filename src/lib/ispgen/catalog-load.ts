import { clearRegisteredControllers, DetailEntityController, registerController } from "./controller.js";
import { definitionToSchema } from "./catalog-types.js";
import { ensureCatalogBootstrapped, bootstrapCatalogFromDefinitions } from "./catalog-bootstrap.js";
import { loadAllEntityDefinitions } from "./catalog-repository.js";

let controllersFromDb = false;

export async function registerControllersFromCatalog(): Promise<number> {
	await ensureCatalogBootstrapped();
	let defs = await loadAllEntityDefinitions();
	if (!defs.length) {
		await bootstrapCatalogFromDefinitions();
		defs = await loadAllEntityDefinitions();
	}
	clearRegisteredControllers();
	for (const def of defs) {
		registerController(new DetailEntityController(definitionToSchema(def)));
	}
	controllersFromDb = true;
	return defs.length;
}

export function catalogLoadedFromDb(): boolean {
	return controllersFromDb;
}
