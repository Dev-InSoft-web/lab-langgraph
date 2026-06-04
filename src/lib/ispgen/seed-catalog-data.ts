import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { resolveLabDataRoot, PATYIA_PROMPTS_CATALOG } from "../core/lab-data-paths.js";
import { resolveLabRepoRoot } from "../core/data-paths.js";
import { join as joinPath } from "node:path";
import { loadApiCatalogManifestSync } from "../integrations/postman/manifest.js";
import { upsertEntityRow } from "./repository.js";
import { seedImgbbFromMap, seedRevisadoFromJson } from "./sync-from-files.js";

const ISA_DOC_ROOT =
	process.env.ISA_DOC_ROOT?.trim() || joinPath(resolveLabRepoRoot(), "..", "ISA-DOC");

export async function seedApiCatalogEndpoints(): Promise<number> {
	let n = 0;
	const manifest = loadApiCatalogManifestSync();
	for (const [apiProject, p] of Object.entries(manifest.projects)) {
		for (const ep of p.endpoints) {
			const pk = encodeURIComponent(ep.id);
			await upsertEntityRow(
				{ project: "isa-doc", page: "postman", entity: "endpoint" },
				pk,
				{
					apiProject,
					id: ep.id,
					name: ep.name,
					method: ep.method,
					path: ep.pathTemplate,
					folder: ep.entity,
					body: ep,
				},
				{ tags: [apiProject, ep.entity] },
			);
			n++;
		}
	}
	return n;
}

export async function seedPatyiaCatalogEndpoints(): Promise<number> {
	let n = 0;
	const manifest = loadApiCatalogManifestSync();
	const p = manifest.projects.patyia;
	if (!p) return 0;
	for (const ep of p.endpoints) {
		await upsertEntityRow(
			{ project: "patyia", page: "api", entity: "catalog-endpoint" },
			encodeURIComponent(ep.id),
			{
				id: ep.id,
				entity: ep.entity,
				name: ep.name,
				method: ep.method,
				pathTemplate: ep.pathTemplate,
				hostVar: ep.hostVar,
				description: ep.description,
				bodyTemplate: ep.bodyTemplate,
				authBearer: ep.authBearer,
			},
			{ tags: [ep.entity] },
		);
		n++;
	}
	return n;
}

export async function seedPostmanUiSnapshots(): Promise<number> {
	let n = 0;
	const staticDir = join(ISA_DOC_ROOT, "public", "static-api", "postman");
	const pairs: { project: string; page: string; file: string }[] = [
		{ project: "clientesis", page: "postman-catalog", file: "entity-cursos.json" },
		{ project: "clientesis", page: "postman-catalog", file: "entity-planes-de-estudio.json" },
		{ project: "clientesis", page: "postman-catalog", file: "entity-drivers.json" },
		{ project: "clientesis", page: "postman-catalog", file: "entity-permisos.json" },
	];
	for (const { project, page, file } of pairs) {
		const path = join(staticDir, file);
		if (!existsSync(path)) continue;
		const slug = file.replace(/^entity-/, "").replace(/\.json$/, "");
		const payload = JSON.parse(readFileSync(path, "utf8")) as { name?: string; item?: unknown[] };
		await upsertEntityRow(
			{ project, page, entity: slug },
			encodeURIComponent(slug),
			{
				slug,
				name: payload.name ?? slug,
				itemCount: payload.item?.length ?? 0,
				payload,
			},
		);
		n++;
	}
	return n;
}

async function seedPatyiaPromptsAsync(root: string): Promise<number> {
	let n = 0;
	async function walk(dir: string): Promise<void> {
		for (const name of readdirSync(dir, { withFileTypes: true })) {
			const full = join(dir, name.name);
			if (name.isDirectory()) {
				await walk(full);
				continue;
			}
			if (!name.name.endsWith(".md")) continue;
			const rel = full.slice(root.length + 1).replace(/\\/g, "/");
			const content = readFileSync(full, "utf8");
			await upsertEntityRow(
				{ project: "patyia", page: "prompts", entity: "prompt-file" },
				encodeURIComponent(rel),
				{ relPath: rel, content: content.slice(0, 500_000), title: name.name },
			);
			n++;
		}
	}
	await walk(root);
	return n;
}

export async function seedPatyiaCaches(): Promise<number> {
	let n = 0;
	const conv = join(resolveLabDataRoot(), "patyia", "caches", "conversaciones-cache.json");
	const idn = join(resolveLabDataRoot(), "patyia", "caches", "identidades-cache.json");
	if (existsSync(conv)) {
		const body = JSON.parse(readFileSync(conv, "utf8"));
		await upsertEntityRow(
			{ project: "patyia", page: "caches", entity: "conversaciones" },
			"default",
			{ id: "default", body },
		);
		n++;
	}
	if (existsSync(idn)) {
		const body = JSON.parse(readFileSync(idn, "utf8"));
		await upsertEntityRow(
			{ project: "patyia", page: "caches", entity: "identidades" },
			"default",
			{ id: "default", body },
		);
		n++;
	}
	return n;
}

export async function seedCodegenState(): Promise<number> {
	const statePath = join(resolveLabDataRoot(), "codegen", "_state.json");
	if (!existsSync(statePath)) return 0;
	const body = JSON.parse(readFileSync(statePath, "utf8"));
	await upsertEntityRow(
		{ project: "isa-doc", page: "codegen", entity: "state" },
		"default",
		{ id: "default", body },
	);
	return 1;
}

export async function seedClientesisTables(): Promise<number> {
	const treePath = join(resolveLabDataRoot(), "clientesis-schema", "tables-tree.json");
	if (!existsSync(treePath)) return 0;
	const tree = JSON.parse(readFileSync(treePath, "utf8")) as {
		entities?: { TABLE?: Array<{ tableid: string; tableref: string; rowname: string }> };
	};
	const tables = tree.entities?.TABLE ?? [];
	let n = 0;
	for (const t of tables) {
		const colsPath = join(resolveLabDataRoot(), "clientesis-schema", "columns", `${t.tableref}.json`);
		let columns: unknown = null;
		if (existsSync(colsPath)) {
			columns = JSON.parse(readFileSync(colsPath, "utf8"));
		}
		await upsertEntityRow(
			{ project: "isa-doc", page: "clientesis-schema", entity: "table" },
			encodeURIComponent(t.tableid),
			{ tableid: t.tableid, tableref: t.tableref, rowname: t.rowname, columns },
		);
		n++;
	}
	return n;
}

export async function seedAllCatalogData(): Promise<Record<string, number>> {
	return {
		imgbb: await seedImgbbFromMap(),
		revisado: await seedRevisadoFromJson(),
		endpoints: await seedApiCatalogEndpoints(),
		patyiaEndpoints: await seedPatyiaCatalogEndpoints(),
		postmanUi: await seedPostmanUiSnapshots(),
		prompts: await seedPatyiaPromptsAsync(PATYIA_PROMPTS_CATALOG()),
		caches: await seedPatyiaCaches(),
		codegen: await seedCodegenState(),
		tables: await seedClientesisTables(),
	};
}
