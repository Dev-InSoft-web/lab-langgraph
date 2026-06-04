import type { ApiProject, ApiCatalogProject, CatalogEndpoint } from "./types.js";
import { getProjectManifest } from "./manifest.js";

export type PostmanUiEntityFile = {
	name: string;
	description?: string;
	item: PostmanUiItem[];
};

export type PostmanUiItem = {
	name: string;
	description?: string;
	request?: {
		method?: string;
		header?: { key: string; value: string }[];
		body?: { mode?: string; raw?: string };
		url?: { raw?: string; host?: string[]; path?: string[]; variable?: { key: string; value?: string }[] };
		auth?: { type: string; bearer?: { key: string; value: string; type: string }[] };
	};
};

export type PostmanUiPayload = {
	meta: {
		info: { name: string; description?: string; schema: string };
		variable: { key: string; value: string; type?: string }[];
		entities: { slug: string; name: string; count: number }[];
	};
	envs: { active: string; environments: ApiCatalogProject["environments"] };
	full: { info: { name: string; description?: string }; item: { name: string; item: PostmanUiItem[] }[] };
	entities: Record<string, PostmanUiEntityFile>;
};

function endpointToItem(e: CatalogEndpoint): PostmanUiItem {
	const headers = [{ key: "Content-Type", value: "application/json" }];
	const item: PostmanUiItem = {
		name: e.name,
		description: e.description,
		request: {
			method: e.method,
			header: headers,
			url: {
				raw: e.urlTemplate,
				host: [`{{${e.hostVar}}}`],
				path: e.pathTemplate.replace(/^\//, "").split("/").filter(Boolean),
				variable: e.pathParams.map((p) => ({
					key: p.key,
					value: p.example ?? "",
					description: p.description,
				})),
			},
		},
	};
	if (e.bodyTemplate) {
		item.request!.body = { mode: "raw", raw: e.bodyTemplate };
	}
	if (e.authBearer) {
		item.request!.auth = {
			type: "bearer",
			bearer: [{ key: "token", value: "{{token}}", type: "string" }],
		};
	}
	return item;
}

export function buildPostmanUiPayload(project: ApiProject): PostmanUiPayload {
	const p = getProjectManifest(project);
	const entities: Record<string, PostmanUiEntityFile> = {};
	for (const ent of p.entities) {
		const endpoints = p.endpoints.filter((e) => e.entity === ent.slug);
		entities[ent.slug] = {
			name: ent.name,
			description: ent.description,
			item: endpoints.map(endpointToItem),
		};
	}
	const variable = p.variables.map((v) => ({
		key: v.key,
		value: v.example ?? "",
		type: v.secret ? "secret" : undefined,
	}));
	const meta = {
		info: {
			name: p.displayName,
			description: p.description,
			schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
		},
		variable,
		entities: p.entities.map((e) => ({ slug: e.slug, name: e.name, count: e.endpointCount })),
	};
	const full = {
		info: { name: p.displayName, description: p.description },
		item: p.entities.map((ent) => ({
			name: ent.name,
			item: (entities[ent.slug]?.item ?? []) as PostmanUiItem[],
		})),
	};
	return {
		meta,
		envs: { active: p.defaultEnvId, environments: p.environments },
		full,
		entities,
	};
}
