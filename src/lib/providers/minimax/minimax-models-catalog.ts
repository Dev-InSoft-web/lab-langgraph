/**
 * Catálogo MiniMax según https://platform.minimax.io/docs/guides/models-intro
 * (más reciente → legacy). Fuente API: api-overview.
 */
export type MinimaxModelTier = "current" | "legacy";

export type MinimaxCatalogEntry = {
	/** language | speech | video | image | music | tool */
	modality: string;
	model: string;
	tier: MinimaxModelTier;
	description: string;
	/** Si el test hola-mundo lo ejecuta automáticamente */
	testable: boolean;
};

/** LLM — más nuevo primero */
export const LANGUAGE_MODELS_DOC: readonly string[] = [
	"MiniMax-M3",
	"MiniMax-M2.7",
	"MiniMax-M2.7-highspeed",
	"MiniMax-M2.5",
	"MiniMax-M2.5-highspeed",
	"MiniMax-M2.1",
	"MiniMax-M2.1-highspeed",
	"MiniMax-M2",
] as const;

/** Video — API ids (api-overview) */
export const VIDEO_MODELS_DOC: readonly string[] = [
	"MiniMax-Hailuo-2.3",
	"MiniMax-Hailuo-2.3-Fast",
	"MiniMax-Hailuo-02",
] as const;

/** TTS síncrono */
export const SPEECH_MODELS_DOC: readonly string[] = [
	"speech-2.8-hd",
	"speech-2.8-turbo",
	"speech-2.6-hd",
	"speech-2.6-turbo",
	"speech-02-hd",
	"speech-02-turbo",
] as const;

/** Music generation API (2.5 aún responde en algunas cuentas; docs destacan 2.6 y legacy 2.0) */
export const MUSIC_MODELS_DOC: readonly string[] = ["music-2.6", "music-2.5", "music-2.0"] as const;

export const IMAGE_MODEL_ID = "image-01";

/** Herramientas / APIs sin prueba hola-mundo en el batch */
export const MINIMAX_TOOLS_CATALOG: readonly MinimaxCatalogEntry[] = [
	{
		modality: "tool",
		model: "t2a-async",
		tier: "current",
		description: "TTS asíncrono largo (hasta 1M caracteres) · speech-2.8/2.6/02",
		testable: false,
	},
	{
		modality: "tool",
		model: "voice-clone",
		tier: "current",
		description: "Clonación de voz desde audio de referencia",
		testable: false,
	},
	{
		modality: "tool",
		model: "voice-design",
		tier: "current",
		description: "Voz personalizada desde descripción textual",
		testable: false,
	},
	{
		modality: "tool",
		model: "Music-Cover",
		tier: "current",
		description: "Cover / style transfer desde audio de referencia",
		testable: false,
	},
	{
		modality: "tool",
		model: "video-agent",
		tier: "current",
		description: "Plantillas (Diving, Run for Life, Transformers, etc.)",
		testable: false,
	},
	{
		modality: "tool",
		model: "file-management",
		tier: "current",
		description: "Upload / List / Retrieve / Delete (mp3, pdf, …)",
		testable: false,
	},
	{
		modality: "tool",
		model: "lyrics-generation",
		tier: "current",
		description: "Generación de letras para música",
		testable: false,
	},
	{
		modality: "language",
		model: "M2-her",
		tier: "current",
		description: "Chat / role-play (64k); no listado en models-intro principal",
		testable: false,
	},
] as const;

function languageEntries(): MinimaxCatalogEntry[] {
	const current = new Set(["MiniMax-M3", "MiniMax-M2.7", "MiniMax-M2.7-highspeed"]);
	return LANGUAGE_MODELS_DOC.map((model) => ({
		modality: "language",
		model,
		tier: current.has(model) ? "current" : "legacy",
		description: "",
		testable: true,
	}));
}

function speechEntries(): MinimaxCatalogEntry[] {
	const current = new Set(["speech-2.8-hd", "speech-2.8-turbo"]);
	return SPEECH_MODELS_DOC.map((model) => ({
		modality: "speech",
		model,
		tier: current.has(model) ? "current" : "legacy",
		description: "",
		testable: true,
	}));
}

function videoEntries(): MinimaxCatalogEntry[] {
	const current = new Set(["MiniMax-Hailuo-2.3", "MiniMax-Hailuo-2.3-Fast"]);
	return VIDEO_MODELS_DOC.map((model) => ({
		modality: "video",
		model,
		tier: current.has(model) ? "current" : "legacy",
		description:
			model === "MiniMax-Hailuo-2.3-Fast"
				? "Image-to-Video (requiere imagen)"
				: "Text/Image to Video",
		testable: true,
	}));
}

function musicEntries(): MinimaxCatalogEntry[] {
	return MUSIC_MODELS_DOC.map((model) => ({
		modality: "music",
		model,
		tier: model === "music-2.6" ? "current" : "legacy",
		description: model === "music-2.5" ? "Generación previa (no en models-intro 2026)" : "",
		testable: true,
	}));
}

/** Inventario completo para report.json / catalog.json */
export function buildMinimaxFullCatalog(): MinimaxCatalogEntry[] {
	return [
		...languageEntries(),
		...speechEntries(),
		{
			modality: "image",
			model: IMAGE_MODEL_ID,
			tier: "current",
			description: "Text-to-image e image-to-image",
			testable: true,
		},
		...musicEntries(),
		...videoEntries(),
		...MINIMAX_TOOLS_CATALOG,
	];
}

export const LANGUAGE_MODELS = [...LANGUAGE_MODELS_DOC];
export const VIDEO_MODELS = [...VIDEO_MODELS_DOC];
export const SPEECH_MODELS = [...SPEECH_MODELS_DOC];
export const MUSIC_MODELS = [...MUSIC_MODELS_DOC];
