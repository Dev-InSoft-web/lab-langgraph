/** OpenAPI 3.0 — lab-langgraph Azure Functions (/api). */

import { jsonBodyRef, OPENAPI_COMPONENT_SCHEMAS } from "./components-schemas.js";

export type OpenApiDocument = Record<string, unknown>;

const json = { type: "object", additionalProperties: true } as const;
const body = (schema: ReturnType<typeof jsonBodyRef> | typeof json) => ({
	content: { "application/json": { schema } },
});
const ok = { description: "OK", content: { "application/json": { schema: json } } };
const err = { description: "Error", content: { "application/json": { schema: json } } };

function op(
	methods: Record<
		string,
		{
			summary: string;
			tags: string[];
			parameters?: unknown[];
			requestBody?: unknown;
			responses?: unknown;
			security?: unknown[];
		}
	>,
): Record<string, unknown> {
	return methods;
}

export function buildOpenApiDocument(serverUrl?: string): OpenApiDocument {
	const base = serverUrl?.replace(/\/$/, "") || "/api";
	return {
		openapi: "3.0.3",
		info: {
			title: "lab-langgraph API",
			description:
				"Azure Functions — RAG, PatyIA conversación, catálogo Postman, entity store, orchestrator, SignalR, persistence.",
			version: "0.1.0",
		},
		servers: [{ url: base, description: "Function App (prefijo /api)" }],
		tags: [
			{ name: "RAG", description: "Índice y consulta vectorial" },
			{ name: "PatyIA", description: "Conversación SSE y mensajes" },
			{ name: "Catalog", description: "Catálogo API / Postman" },
			{ name: "Entity", description: "CRUD entity store" },
			{ name: "Agent", description: "Agente catálogo HTTP" },
			{ name: "Orchestrator", description: "Rotación de API keys" },
			{ name: "Tools", description: "Whisper, proofread, health" },
			{ name: "SignalR", description: "Negotiate y notify" },
			{ name: "Persistence", description: "JSON store, revisado, cache PatyIA" },
			{ name: "ImgBB", description: "Assets ImgBB" },
			{ name: "Config", description: "Conexiones configuradas" },
			{ name: "Docs", description: "OpenAPI / Swagger UI" },
			{ name: "Auth", description: "JWT lab (30 días). Contraseña con César en Swagger." },
		],
		components: {
			schemas: OPENAPI_COMPONENT_SCHEMAS,
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
					description: "POST /auth/token → Authorization: Bearer …",
				},
			},
		},
		security: [{ bearerAuth: [] }],
		paths: {
			"/auth/token": op({
				post: {
					summary: "Obtener JWT (30 días)",
					tags: ["Auth"],
					security: [],
					requestBody: body(jsonBodyRef("AuthTokenRequest")),
					responses: { "200": ok, "401": err },
				},
			}),
			"/auth/me": op({
				get: {
					summary: "Validar JWT actual",
					tags: ["Auth"],
					responses: { "200": ok, "401": err },
				},
			}),
			"/ask": op({
				post: {
					summary: "Pregunta RAG",
					tags: ["RAG"],
					requestBody: body(jsonBodyRef("AskRequest")),
					responses: { "200": ok, "400": err, "500": err },
				},
			}),
			"/documents": op({ get: { summary: "Listar documentos indexados", tags: ["RAG"], responses: { "200": ok } } }),
			"/index": op({
				post: {
					summary: "Indexar PDFs (multipart)",
					tags: ["RAG"],
					parameters: [{ name: "replace", in: "query", schema: { type: "boolean", default: true } }],
					requestBody: {
						content: {
							"multipart/form-data": {
								schema: {
									type: "object",
									properties: { file: { type: "string", format: "binary" } },
								},
							},
						},
					},
					responses: { "200": ok, "400": err },
				},
			}),
			"/index/youtube": op({
				post: {
					summary: "Indexar corpus YouTube",
					tags: ["RAG"],
					parameters: [{ name: "replace", in: "query", schema: { type: "boolean", default: true } }],
					responses: { "200": ok, "400": err },
				},
			}),
			"/index/web": op({
				post: {
					summary: "Indexar URLs web",
					tags: ["RAG"],
					parameters: [{ name: "replace", in: "query", schema: { type: "boolean", default: true } }],
					requestBody: body(jsonBodyRef("IndexWebRequest")),
					responses: { "200": ok },
				},
			}),
			"/youtube/proofread": op({
				post: {
					summary: "Proofread transcripción YouTube",
					tags: ["RAG"],
					requestBody: body(jsonBodyRef("YoutubeWhisperRequest")),
					responses: { "200": ok },
				},
			}),
			"/youtube/punctuate": op({
				post: {
					summary: "Puntuación español YouTube",
					tags: ["RAG"],
					requestBody: body(jsonBodyRef("YoutubeWhisperRequest")),
					responses: { "200": ok },
				},
			}),
			"/youtube/whisper/transcribe": op({
				post: {
					summary: "Transcribir video YouTube (Whisper)",
					tags: ["RAG"],
					requestBody: body(jsonBodyRef("YoutubeWhisperRequest")),
					responses: { "200": ok },
				},
			}),
			"/reset": op({
				delete: { summary: "Vaciar índice vectorial", tags: ["RAG"], responses: { "200": ok } },
				post: { summary: "Vaciar índice (alias POST)", tags: ["RAG"], responses: { "200": ok } },
			}),
			"/media/{id}": op({
				get: {
					summary: "Imagen embebida por id",
					tags: ["RAG"],
					parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
					responses: { "200": { description: "image/png" } },
				},
			}),
			"/conversacion": op({
				post: {
					summary: "Turno conversación (SSE)",
					tags: ["PatyIA"],
					requestBody: body(jsonBodyRef("ConversacionRequest")),
					responses: {
						"200": { description: "text/event-stream", content: { "text/event-stream": { schema: { type: "string" } } } },
					},
				},
				get: {
					summary: "Obtener conversación",
					tags: ["PatyIA"],
					parameters: [
						{ name: "iconversacion", in: "query", required: true, schema: { type: "integer" } },
						{ name: "id", in: "query", schema: { type: "integer" } },
					],
					responses: { "200": ok, "404": err },
				},
			}),
			"/conversaciones": op({
				get: {
					summary: "Listar conversaciones lab",
					tags: ["PatyIA"],
					parameters: [
						{ name: "itercero", in: "query", schema: { type: "string", default: "lab-langgraph" } },
						{ name: "icontacto", in: "query", schema: { type: "string", default: "default" } },
					],
					responses: { "200": ok },
				},
				post: {
					summary: "Crear conversación vacía",
					tags: ["PatyIA"],
					requestBody: body(jsonBodyRef("CreateConversationRequest")),
					responses: { "201": ok },
				},
			}),
			"/conversacion/{iconversacion}": op({
				get: {
					summary: "Detalle conversación + turnos",
					tags: ["PatyIA"],
					parameters: [
						{ name: "iconversacion", in: "path", required: true, schema: { type: "integer" } },
					],
					responses: { "200": ok, "404": err },
				},
				patch: {
					summary: "Actualizar título o estado",
					tags: ["PatyIA"],
					parameters: [
						{ name: "iconversacion", in: "path", required: true, schema: { type: "integer" } },
					],
					requestBody: body(jsonBodyRef("JsonBody")),
					responses: { "200": ok, "404": err },
				},
				delete: {
					summary: "Eliminar conversación (soft)",
					tags: ["PatyIA"],
					parameters: [
						{ name: "iconversacion", in: "path", required: true, schema: { type: "integer" } },
					],
					responses: { "200": ok, "404": err },
				},
			}),
			"/conversacion/jailbreak": op({
				post: {
					summary: "Conversación jailbreak (SSE)",
					tags: ["PatyIA"],
					requestBody: body(jsonBodyRef("ConversacionRequest")),
					responses: { "200": { description: "text/event-stream" } },
				},
			}),
			"/mensaje": op({
				post: {
					summary: "Enviar mensaje (LangGraph JSON) o calificar",
					tags: ["PatyIA"],
					requestBody: body(jsonBodyRef("MensajeRequest")),
					responses: { "200": ok },
				},
			}),
			"/patyia/prompts": op({ get: { summary: "Prompts PatyIA", tags: ["PatyIA"], responses: { "200": ok } } }),
			"/catalog/projects": op({ get: { summary: "Proyectos catálogo", tags: ["Catalog"], responses: { "200": ok } } }),
			"/catalog/projects/{project}/sections": op({
				get: {
					summary: "Secciones del proyecto",
					tags: ["Catalog"],
					parameters: [{ name: "project", in: "path", required: true, schema: { type: "string" } }],
					responses: { "200": ok },
				},
			}),
			"/catalog/projects/{project}/sections/{page}/entities": op({
				get: {
					summary: "Entidades de una sección",
					tags: ["Catalog"],
					parameters: [
						{ name: "project", in: "path", required: true, schema: { type: "string" } },
						{ name: "page", in: "path", required: true, schema: { type: "string" } },
					],
					responses: { "200": ok },
				},
			}),
			"/catalog/bootstrap": op({ post: { summary: "Bootstrap catálogo PG", tags: ["Catalog"], responses: { "200": ok } } }),
			"/entity": op({ get: { summary: "Registry entity store", tags: ["Entity"], responses: { "200": ok } } }),
			"/entity/seed": op({ post: { summary: "Seed entity store", tags: ["Entity"], responses: { "200": ok } } }),
			"/entity/{project}/{page}/{entity}": op({
				get: { summary: "CRUD — GET (lista / sin IENTITYID)", tags: ["Entity"], parameters: pathEntityParams(false), responses: { "200": ok } },
				post: {
					summary: "CRUD — POST",
					tags: ["Entity"],
					parameters: pathEntityParams(false),
					requestBody: body(jsonBodyRef("EntityBody")),
					responses: { "200": ok },
				},
			}),
			"/entity/{project}/{page}/{entity}/{ientityid}": op({
				get: { summary: "CRUD — GET por IENTITYID", tags: ["Entity"], parameters: pathEntityParams(true), responses: { "200": ok } },
				put: {
					summary: "CRUD — PUT",
					tags: ["Entity"],
					parameters: pathEntityParams(true),
					requestBody: body(jsonBodyRef("EntityBody")),
					responses: { "200": ok },
				},
				patch: {
					summary: "CRUD — PATCH",
					tags: ["Entity"],
					parameters: pathEntityParams(true),
					requestBody: body(jsonBodyRef("EntityBody")),
					responses: { "200": ok },
				},
				delete: { summary: "CRUD — DELETE", tags: ["Entity"], parameters: pathEntityParams(true), responses: { "200": ok } },
			}),
			"/agent/connections": op({ get: { summary: "Conexiones agente", tags: ["Agent"], responses: { "200": ok } } }),
			"/agent/catalog": op({
				get: {
					summary: "Catálogo agente",
					tags: ["Agent"],
					parameters: [{ name: "project", in: "query", schema: { type: "string" } }],
					responses: { "200": ok },
				},
			}),
			"/agent/manifest": op({
				get: {
					summary: "Manifest workflows",
					tags: ["Agent"],
					parameters: [{ name: "project", in: "query", schema: { type: "string" } }],
					responses: { "200": ok },
				},
			}),
			"/agent/postman-ui": op({
				get: {
					summary: "UI Postman embebida",
					tags: ["Agent"],
					parameters: [{ name: "project", in: "query", schema: { type: "string" } }],
					responses: { "200": ok },
				},
			}),
			"/agent/workflows": op({
				get: {
					summary: "Workflows",
					tags: ["Agent"],
					parameters: [{ name: "project", in: "query", schema: { type: "string" } }],
					responses: { "200": ok },
				},
			}),
			"/agent/task": op({
				post: {
					summary: "Tarea agente (LLM)",
					tags: ["Agent"],
					requestBody: body(jsonBodyRef("AgentTaskRequest")),
					responses: { "200": ok },
				},
			}),
			"/agent/execute": op({
				post: {
					summary: "Ejecutar entrada catálogo",
					tags: ["Agent"],
					requestBody: body(jsonBodyRef("AgentTaskRequest")),
					responses: { "200": ok },
				},
			}),
			"/orchestrator/status": op({ get: { summary: "Estado orchestrator", tags: ["Orchestrator"], responses: { "200": ok } } }),
			"/orchestrator/sync-keys": op({ post: { summary: "Sincronizar slots", tags: ["Orchestrator"], responses: { "200": ok } } }),
			"/orchestrator/lease": op({
				post: {
					summary: "Obtener lease",
					tags: ["Orchestrator"],
					requestBody: body(jsonBodyRef("OrchestratorLeaseRequest")),
					responses: { "200": ok },
				},
			}),
			"/orchestrator/release": op({
				post: {
					summary: "Liberar lease",
					tags: ["Orchestrator"],
					requestBody: body(jsonBodyRef("OrchestratorLeaseRequest")),
					responses: { "200": ok },
				},
			}),
			"/tools/health": op({ get: { summary: "Health ligero", tags: ["Tools"], responses: { "200": ok } } }),
			"/tools/whisper/transcribe": op({
				post: {
					summary: "Whisper transcribe",
					tags: ["Tools"],
					requestBody: body(jsonBodyRef("YoutubeWhisperRequest")),
					responses: { "200": ok },
				},
			}),
			"/tools/proofread": op({
				post: {
					summary: "Proofread tools",
					tags: ["Tools"],
					requestBody: body(jsonBodyRef("JsonBody")),
					responses: { "200": ok },
				},
			}),
			"/signalr/negotiate": op({
				get: {
					summary: "Negotiate SignalR",
					tags: ["SignalR"],
					parameters: [{ name: "userId", in: "query", schema: { type: "string" } }],
					responses: { "200": ok },
				},
				post: { summary: "Negotiate SignalR (POST)", tags: ["SignalR"], responses: { "200": ok } },
			}),
			"/signalr/notify": op({
				post: {
					summary: "Notificar hub SignalR",
					tags: ["SignalR"],
					parameters: [{ name: "x-lab-notify-token", in: "header", schema: { type: "string" } }],
					requestBody: body(jsonBodyRef("SignalRNotifyRequest")),
					responses: { "202": ok },
				},
			}),
			"/persistence": op({ get: { summary: "Inventario persistence", tags: ["Persistence"], responses: { "200": ok } } }),
			"/persistence/{path}": op({
				get: { summary: "Leer JSON store", tags: ["Persistence"], parameters: [{ name: "path", in: "path", required: true, schema: { type: "string" } }], responses: { "200": ok } },
				put: {
					summary: "Escribir JSON store",
					tags: ["Persistence"],
					parameters: [{ name: "path", in: "path", required: true, schema: { type: "string" } }],
					requestBody: body(jsonBodyRef("JsonBody")),
					responses: { "200": ok },
				},
				post: {
					summary: "Escribir JSON store (POST)",
					tags: ["Persistence"],
					parameters: [{ name: "path", in: "path", required: true, schema: { type: "string" } }],
					requestBody: body(jsonBodyRef("JsonBody")),
					responses: { "200": ok },
				},
			}),
			"/revisado": op({
				get: { summary: "Mapa revisado", tags: ["Persistence"], responses: { "200": ok } },
				post: {
					summary: "Actualizar revisado",
					tags: ["Persistence"],
					requestBody: body(jsonBodyRef("RevisadoRequest")),
					responses: { "200": ok },
				},
			}),
			"/patyia/cache/conversaciones": op({
				get: { summary: "Cache conversaciones", tags: ["Persistence"], responses: { "200": ok } },
				put: { summary: "Cache conversaciones PUT", tags: ["Persistence"], requestBody: body(jsonBodyRef("JsonBody")), responses: { "200": ok } },
				post: { summary: "Cache conversaciones POST", tags: ["Persistence"], requestBody: body(jsonBodyRef("JsonBody")), responses: { "200": ok } },
			}),
			"/patyia/cache/identidades": op({
				get: { summary: "Cache identidades", tags: ["Persistence"], responses: { "200": ok } },
				put: { summary: "Cache identidades PUT", tags: ["Persistence"], requestBody: body(jsonBodyRef("JsonBody")), responses: { "200": ok } },
				post: { summary: "Cache identidades POST", tags: ["Persistence"], requestBody: body(jsonBodyRef("JsonBody")), responses: { "200": ok } },
			}),
			"/imgbb/assets": op({ get: { summary: "Listar assets ImgBB", tags: ["ImgBB"], responses: { "200": ok } } }),
			"/imgbb/assets/{filename}": op({
				get: {
					summary: "Asset por nombre",
					tags: ["ImgBB"],
					parameters: [{ name: "filename", in: "path", schema: { type: "string" } }],
					responses: { "200": ok },
				},
			}),
			"/imgbb/assets/upload": op({
				post: {
					summary: "Subir asset ImgBB",
					tags: ["ImgBB"],
					requestBody: {
						content: {
							"multipart/form-data": {
								schema: {
									type: "object",
									properties: { file: { type: "string", format: "binary" } },
								},
							},
						},
					},
					responses: { "200": ok },
				},
			}),
			"/config/connections": op({ get: { summary: "Resumen conexiones (sin secretos)", tags: ["Config"], responses: { "200": ok } } }),
			"/openapi.json": op({
				get: {
					summary: "Especificación OpenAPI",
					tags: ["Docs"],
					responses: { "200": ok },
				},
			}),
			"/docs": op({
				get: { summary: "Swagger UI", tags: ["Docs"], responses: { "200": { description: "HTML Swagger UI" } } },
			}),
		},
	};
}

function pathEntityParams(includePk: boolean): unknown[] {
	const p: unknown[] = [
		{ name: "project", in: "path", required: true, schema: { type: "string" } },
		{ name: "page", in: "path", required: true, schema: { type: "string" } },
		{ name: "entity", in: "path", required: true, schema: { type: "string" } },
	];
	if (includePk) {
		p.push({
			name: "ientityid",
			in: "path",
			required: true,
			description: "Valor de clave compuesta (ITICKET, IIMGBB, …)",
			schema: { type: "string" },
		});
	}
	return p;
}
