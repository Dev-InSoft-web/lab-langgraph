/** Schemas reutilizables para Swagger (inputs en Try it out). */

export const OPENAPI_COMPONENT_SCHEMAS: Record<string, Record<string, unknown>> = {
	AuthTokenRequest: {
		type: "object",
		required: ["username", "password"],
		properties: {
			username: {
				type: "string",
				description: "Usuario lab (se normaliza a mayúsculas)",
				example: "",
			},
			password: {
				type: "string",
				format: "password",
				description:
					"Contraseña en claro en el formulario; Swagger envía César(abc123+pass+xyz987) con desfase = día UTC (1–31).",
				example: "",
			},
		},
	},
	AskRequest: {
		type: "object",
		required: ["question"],
		properties: {
			question: { type: "string", example: "¿Cómo crear un ticket?" },
			k: { type: "integer", default: 4, example: 4 },
			corpus: { oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] },
			tipo: { oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] },
		},
	},
	ConversacionRequest: {
		type: "object",
		properties: {
			iconversacion: { type: "integer", example: 1 },
			mensaje: { type: "string", example: "Hola" },
			agente: { type: "string", example: "paty" },
		},
	},
	MensajeRequest: {
		type: "object",
		properties: {
			iconversacion: { type: "integer", example: 1 },
			calificacion: { type: "integer", minimum: 1, maximum: 5, example: 5 },
			comentario: { type: "string", example: "" },
		},
	},
	AgentTaskRequest: {
		type: "object",
		properties: {
			prompt: { type: "string", example: "Resume el ticket TK-0000000" },
			model: { type: "string", example: "groq" },
		},
	},
	OrchestratorLeaseRequest: {
		type: "object",
		properties: {
			capability: { type: "string", example: "chat" },
			provider: { type: "string", example: "groq" },
			leaseId: { type: "string", example: "" },
		},
	},
	SignalRNotifyRequest: {
		type: "object",
		properties: {
			target: { type: "string", example: "lab" },
			arguments: { type: "array", items: { type: "string" }, example: ["evento", "payload"] },
		},
	},
	RevisadoRequest: {
		type: "object",
		properties: {
			key: { type: "string", example: "tickets.TK-0000000" },
			checked: { type: "boolean", example: true },
		},
	},
	EntityBody: {
		type: "object",
		additionalProperties: true,
		description: "Campos de negocio (ITICKET, IIMGBB, …)",
		example: { ITICKET: "TK-0000000", titulo: "Ejemplo" },
	},
	IndexWebRequest: {
		type: "object",
		properties: {
			urls: { type: "array", items: { type: "string", format: "uri" }, example: ["https://example.com"] },
		},
	},
	YoutubeWhisperRequest: {
		type: "object",
		properties: {
			videoId: { type: "string", example: "dQw4w9WgXcQ" },
			language: { type: "string", example: "es" },
		},
	},
	JsonBody: {
		type: "object",
		additionalProperties: true,
		description: "JSON libre",
		example: {},
	},
};

export function jsonBodyRef(name: keyof typeof OPENAPI_COMPONENT_SCHEMAS | "JsonBody" = "JsonBody") {
	return { $ref: `#/components/schemas/${name}` };
}
