import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type {
	ApiCatalogManifest,
	ApiCatalogProject,
	ApiProject,
	CatalogEndpoint,
	CatalogEntityMeta,
	EnvironmentsFile,
	PostmanCollection,
	PostmanItem,
	PostmanRequest,
	PostmanRequestUrl,
} from "./types.js";
import { buildPathFromUrl, extractHostVar } from "./substitute.js";
import { enrichVariableExamples, variableMetaForProject } from "./variable-meta.js";

export function slugify(name: string): string {
	return name
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

const PROJECT_META: Record<
	ApiProject,
	{ displayName: string; description: string }
> = {
	patyia: {
		displayName: "PatyIA · AyudasCP-IA",
		description: "Asistente IA: JWT, conversaciones, mensajes, tiquetes y timers.",
	},
	clientesis: {
		displayName: "ClientesIS · ContaPymeU",
		description: "APIs Azure de capacitación (cursos, planes, drivers, permisos) y microservicios relacionados.",
	},
};

function extractPathParams(url: PostmanRequestUrl): CatalogEndpoint["pathParams"] {
	const out: CatalogEndpoint["pathParams"] = [];
	const seen = new Set<string>();
	for (const v of url.variable ?? []) {
		if (!v.key || seen.has(v.key)) continue;
		seen.add(v.key);
		out.push({
			key: v.key,
			description: v.description,
			example: v.value,
		});
	}
	for (const seg of url.path ?? []) {
		if (!seg.startsWith(":")) continue;
		const key = seg.slice(1);
		if (seen.has(key)) continue;
		seen.add(key);
		out.push({ key, description: `Path param :${key}` });
	}
	return out;
}

function parseEndpoint(
	project: ApiProject,
	entity: string,
	entityDescription: string | undefined,
	item: PostmanItem,
): CatalogEndpoint | null {
	const req = item.request;
	if (!req?.method || !req.url) return null;
	const urlObj = typeof req.url === "string" ? { raw: req.url } : req.url;
	const raw = urlObj.raw ?? "";
	const hostVar = extractHostVar(raw || (urlObj.host?.[0] ?? "{{HOST}}"));
	const pathTemplate = buildPathFromUrl(urlObj);
	const method = req.method.toUpperCase();
	const authBearer =
		req.auth?.type === "bearer" || raw.includes("{{token}}") || pathTemplate.includes("{{token}}");
	const id = `${project}/${entity}/${slugify(item.name)}`;
	const urlTemplate = raw || `{{${hostVar}}}${pathTemplate}`;
	return {
		id,
		project,
		entity,
		name: item.name,
		method,
		pathTemplate,
		hostVar,
		urlTemplate,
		description: typeof item.description === "string" ? item.description : req.description,
		bodyTemplate: req.body?.mode === "raw" ? req.body.raw : undefined,
		authBearer,
		entityDescription,
		mutating: ["POST", "PUT", "PATCH", "DELETE"].includes(method),
		pathParams: extractPathParams(urlObj),
	};
}

function walkEndpoints(
	project: ApiProject,
	entity: string,
	entityDescription: string | undefined,
	items: PostmanItem[],
	out: CatalogEndpoint[],
): void {
	for (const it of items) {
		if (it.request) {
			const e = parseEndpoint(project, entity, entityDescription, it);
			if (e) out.push(e);
		}
		if (it.item?.length) walkEndpoints(project, entity, entityDescription, it.item, out);
	}
}

function loadEnvironmentsFile(path: string): EnvironmentsFile | null {
	if (!existsSync(path)) return null;
	return JSON.parse(readFileSync(path, "utf8")) as EnvironmentsFile;
}

function loadPatyiaFolders(entitiesDir: string): PostmanItem[] {
	if (!existsSync(entitiesDir)) return [];
	const items: PostmanItem[] = [];
	for (const f of readdirSync(entitiesDir).filter((x) => x.endsWith(".json"))) {
		const ent = JSON.parse(readFileSync(join(entitiesDir, f), "utf8")) as {
			name: string;
			description?: string;
			item: PostmanItem[];
		};
		items.push({
			name: ent.name,
			description: ent.description,
			item: ent.item ?? [],
		});
	}
	return items;
}

function loadClientesisFolders(collectionPath: string): PostmanItem[] {
	if (!existsSync(collectionPath)) return [];
	const col = JSON.parse(readFileSync(collectionPath, "utf8")) as PostmanCollection;
	return col.item ?? [];
}

function buildProject(
	project: ApiProject,
	postmanRoot: string,
): ApiCatalogProject | null {
	const base = join(postmanRoot, project);
	const envFile = loadEnvironmentsFile(join(base, "environments.json"));
	if (!envFile) return null;

	const folders =
		project === "patyia"
			? loadPatyiaFolders(join(base, "entities"))
			: loadClientesisFolders(join(base, "collection.json"));

	const endpoints: CatalogEndpoint[] = [];
	const entities: CatalogEntityMeta[] = [];

	for (const folder of folders) {
		const slug = slugify(folder.name);
		const entityDescription =
			typeof folder.description === "string" ? folder.description : undefined;
		const countBefore = endpoints.length;
		if (folder.item?.length) {
			walkEndpoints(project, slug, entityDescription, folder.item, endpoints);
		} else if (folder.request) {
			const e = parseEndpoint(project, slug, entityDescription, folder as PostmanItem);
			if (e) endpoints.push(e);
		}
		entities.push({
			slug,
			name: folder.name,
			description: entityDescription,
			endpointCount: endpoints.length - countBefore,
		});
	}

	const defaultEnvId = envFile.active || envFile.environments[0]?.id || "staging";
	const activeEnv = envFile.environments.find((e) => e.id === defaultEnvId) ?? envFile.environments[0];
	const envVars: Record<string, string> = {};
	for (const v of activeEnv?.values ?? []) {
		if (v.enabled !== false) envVars[v.key] = v.value ?? "";
	}

	const meta = PROJECT_META[project];
	return {
		key: project,
		displayName: meta.displayName,
		description: meta.description,
		defaultEnvId,
		environments: envFile.environments,
		variables: enrichVariableExamples(project, variableMetaForProject(project), envVars),
		entities,
		endpoints,
	};
}

/** Construye el manifiesto desde `data/postman` (ISA-DOC o copia en lab-langgraph). */
export function buildApiCatalogManifest(postmanRoot: string, source = "isa-doc"): ApiCatalogManifest {
	const projects = {} as Record<ApiProject, ApiCatalogProject>;
	for (const key of ["patyia", "clientesis"] as ApiProject[]) {
		const p = buildProject(key, postmanRoot);
		if (p?.endpoints.length) projects[key] = p;
	}
	return {
		version: 1,
		generatedAt: new Date().toISOString(),
		source,
		defaultEnvId: process.env.LAB_API_ENV?.trim() || "staging",
		projects,
	};
}
