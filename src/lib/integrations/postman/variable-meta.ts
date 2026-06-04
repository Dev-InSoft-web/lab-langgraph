import type { ApiProject, CatalogVariableMeta } from "./types.js";

const PATYIA_VARS: CatalogVariableMeta[] = [
	{ key: "HOST", description: "URL base del Function App PatyIA (AyudasCP-IA)." },
	{ key: "CONTROLKEY", description: "Clave de control para POST /api/JWT.", secret: true },
	{ key: "token", description: "JWT Bearer devuelto por /api/JWT o token de prueba.", secret: true },
	{ key: "iconversacion", description: "ID de conversación activa (se setea tras crear conversación)." },
	{ key: "THREAD_ID", description: "Identificador de hilo LangGraph / sesión (opcional)." },
];

const CLIENTESIS_VARS: CatalogVariableMeta[] = [
	{ key: "host_contapymeu", description: "Microservicio ContaPymeU (capacitación, cursos, planes)." },
	{ key: "host_soporte", description: "Microservicio soporte." },
	{ key: "host_titulosgen", description: "Microservicio títulos generales." },
	{ key: "host_terceros", description: "Microservicio terceros." },
	{ key: "host_contactos", description: "Microservicio contactos." },
	{ key: "host_seguridad", description: "Microservicio seguridad / JWT." },
	{ key: "host_general", description: "Microservicio general." },
	{ key: "host_jwt", description: "Host emisor JWT (si aplica)." },
	{ key: "token", description: "JWT Bearer del usuario autenticado.", secret: true },
	{ key: "uuidtoken", description: "UUID asociado al token de sesión.", secret: true },
];

export function variableMetaForProject(project: ApiProject): CatalogVariableMeta[] {
	return project === "patyia" ? [...PATYIA_VARS] : [...CLIENTESIS_VARS];
}

export function enrichVariableExamples(
	project: ApiProject,
	meta: CatalogVariableMeta[],
	envVars: Record<string, string>,
): CatalogVariableMeta[] {
	return meta.map((m) => {
		const v = envVars[m.key];
		if (!v || m.secret) return m;
		return { ...m, example: v };
	});
}
