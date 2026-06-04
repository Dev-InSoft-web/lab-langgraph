export type ApiProject = "patyia" | "clientesis";

export type ApiCatalogSource = "bundled" | "postgres" | "isa-doc";

export interface PostmanRequestUrl {
	raw?: string;
	host?: string[];
	path?: string[];
	variable?: { key: string; value?: string; description?: string }[];
}

export interface PostmanRequest {
	method?: string;
	header?: { key: string; value: string }[];
	body?: { mode?: string; raw?: string };
	url?: string | PostmanRequestUrl;
	auth?: { type?: string };
	description?: string;
}

export interface PostmanItem {
	name: string;
	request?: PostmanRequest;
	item?: PostmanItem[];
	description?: string;
}

export interface PostmanCollection {
	info: { name: string; description?: string };
	item: PostmanItem[];
}

export interface EnvVar {
	key: string;
	value: string;
	type?: string;
	enabled?: boolean;
}

export interface Environment {
	id: string;
	name: string;
	values: EnvVar[];
}

export interface EnvironmentsFile {
	active: string;
	environments: Environment[];
}

/** Variable de entorno Postman documentada en el manifiesto. */
export interface CatalogVariableMeta {
	key: string;
	description: string;
	secret?: boolean;
	/** Valor de ejemplo en el entorno activo por defecto (sin secretos reales). */
	example?: string;
}

export interface CatalogEntityMeta {
	slug: string;
	name: string;
	description?: string;
	endpointCount: number;
}

/** Endpoint ejecutable (subset usado por execute/agent). */
export interface CatalogEntry {
	id: string;
	project: ApiProject;
	entity: string;
	name: string;
	method: string;
	pathTemplate: string;
	hostVar: string;
	description?: string;
	bodyTemplate?: string;
	authBearer: boolean;
}

/** Endpoint enriquecido dentro del manifiesto consolidado. */
export interface CatalogEndpoint extends CatalogEntry {
	/** URL completa plantilla: `{{HOST}}/api/...` */
	urlTemplate: string;
	entityDescription?: string;
	mutating: boolean;
	pathParams: { key: string; description?: string; example?: string }[];
}

export interface ApiCatalogProject {
	key: ApiProject;
	displayName: string;
	description: string;
	defaultEnvId: string;
	environments: Environment[];
	variables: CatalogVariableMeta[];
	entities: CatalogEntityMeta[];
	endpoints: CatalogEndpoint[];
}

/** Fuente de verdad del backend: hosts, envs, rutas y metadatos. */
export interface ApiCatalogManifest {
	version: number;
	generatedAt: string;
	source: string;
	defaultEnvId: string;
	projects: Record<ApiProject, ApiCatalogProject>;
}

export interface ResolvedRequest {
	method: string;
	url: string;
	headers: Record<string, string>;
	body?: string;
}

export interface HttpCallResult {
	status: number;
	data: unknown;
	error?: string;
	durationMs: number;
}
