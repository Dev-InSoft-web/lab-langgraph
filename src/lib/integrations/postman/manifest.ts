import { readFileSync, existsSync } from "node:fs";
import type {
	ApiCatalogManifest,
	ApiCatalogProject,
	ApiCatalogSource,
	ApiProject,
	CatalogEndpoint,
	EnvironmentsFile,
} from "./types.js";
import { getPatyPgPool } from "../../db/pg.js";
import { Q_LAB_API_CATALOG_MANIFEST } from "../../db/pg-identifiers.js";
import { sqlCol } from "../../db/pg-quote.js";
import { bundledCatalogExists, resolveBundledCatalogPath } from "./paths.js";

const CATALOG_ROW_ID = "default";

let cached: ApiCatalogManifest | null = null;
let cachedSource: ApiCatalogSource | null = null;

function readBundledManifest(): ApiCatalogManifest {
	const path = resolveBundledCatalogPath();
	if (!existsSync(path)) {
		throw new Error(`Falta ${path}. Ejecute: npm run catalog:build`);
	}
	return JSON.parse(readFileSync(path, "utf8")) as ApiCatalogManifest;
}

export function getCatalogSourcePreference(): ApiCatalogSource {
	const raw = process.env.API_CATALOG_SOURCE?.trim().toLowerCase();
	if (raw === "postgres" || raw === "pg") return "postgres";
	return "bundled";
}

export async function loadApiCatalogManifest(refresh = false): Promise<ApiCatalogManifest> {
	if (!refresh && cached) return cached;

	if (getCatalogSourcePreference() === "postgres") {
		try {
			const fromPg = await loadManifestFromPg();
			if (fromPg) {
				cached = fromPg;
				cachedSource = "postgres";
				return fromPg;
			}
		} catch {
			/* fallback JSON */
		}
	}

	cached = readBundledManifest();
	cachedSource = "bundled";
	return cached;
}

export function loadApiCatalogManifestSync(refresh = false): ApiCatalogManifest {
	if (!refresh && cached) return cached;
	cached = readBundledManifest();
	cachedSource = "bundled";
	return cached;
}

export function getLoadedCatalogSource(): ApiCatalogSource | null {
	return cachedSource;
}

export function getProjectManifest(project: ApiProject): ApiCatalogProject {
	const m = loadApiCatalogManifestSync();
	const p = m.projects[project];
	if (!p) throw new Error(`Proyecto no presente en manifiesto: ${project}`);
	return p;
}

export function loadEnvironmentsFromManifest(project: ApiProject): EnvironmentsFile {
	const p = getProjectManifest(project);
	return { active: p.defaultEnvId, environments: p.environments };
}

export function loadCatalogFromManifest(project: ApiProject): CatalogEndpoint[] {
	return getProjectManifest(project).endpoints;
}

export async function ensureApiCatalogSchema(): Promise<void> {
	const { ensureLanglabSchema } = await import("../../db/ensure-schemas.js");
	await ensureLanglabSchema();
}

export async function upsertManifestToPg(manifest: ApiCatalogManifest): Promise<void> {
	await ensureApiCatalogSchema();
	const pool = getPatyPgPool();
	const c = {
		id: sqlCol("id"),
		version: sqlCol("version"),
		generatedAt: sqlCol("generatedat"),
		source: sqlCol("source"),
		body: sqlCol("body"),
	};
	await pool.query(
		`INSERT INTO ${Q_LAB_API_CATALOG_MANIFEST} (${c.id}, ${c.version}, ${c.generatedAt}, ${c.source}, ${c.body})
		 VALUES ($1, $2, $3::timestamptz, $4, $5::jsonb)
		 ON CONFLICT (${c.id}) DO UPDATE SET
		   ${c.version} = EXCLUDED.${c.version},
		   ${c.generatedAt} = EXCLUDED.${c.generatedAt},
		   ${c.source} = EXCLUDED.${c.source},
		   ${c.body} = EXCLUDED.${c.body}`,
		[CATALOG_ROW_ID, manifest.version, manifest.generatedAt, manifest.source, JSON.stringify(manifest)],
	);
}

export async function loadManifestFromPg(): Promise<ApiCatalogManifest | null> {
	await ensureApiCatalogSchema();
	const pool = getPatyPgPool();
	const res = await pool.query<{ body: ApiCatalogManifest }>(
		`SELECT ${sqlCol("body")} AS body FROM ${Q_LAB_API_CATALOG_MANIFEST} WHERE ${sqlCol("id")} = $1`,
		[CATALOG_ROW_ID],
	);
	const row = res.rows[0];
	if (!row?.body) return null;
	return typeof row.body === "string" ? (JSON.parse(row.body) as ApiCatalogManifest) : row.body;
}

export function getManifestMeta(): {
	version: number;
	generatedAt: string;
	source: string;
	defaultEnvId: string;
	runtimeSource: ApiCatalogSource | null;
	bundledPath: string;
} {
	const m = loadApiCatalogManifestSync();
	return {
		version: m.version,
		generatedAt: m.generatedAt,
		source: m.source,
		defaultEnvId: m.defaultEnvId,
		runtimeSource: cachedSource,
		bundledPath: resolveBundledCatalogPath(),
	};
}
