/** Filtro PGVector (compatible con similaritySearch de LangChain). */
export type PgMetadataFilter = Record<
	string,
	string | number | boolean | { in?: (string | number | boolean)[] }
>;

/** Marcas / dominios de conocimiento indexables en PGVector. */
export type RagCorpus =
	| "contapyme"
	| "agrowin"
	| "dian"
	| "legal"
	| "minhacienda"
	| "supersociedades";

export type RagTipo = "youtube" | "pdf" | "web" | "normativa";

/** Campos estándar en metadata jsonb de cada chunk. */
export type RagChunkMetadata = {
	source: string;
	page: string;
	corpus: RagCorpus;
	tipo: RagTipo;
	kind?: RagTipo | "youtube" | "pdf";
	title?: string;
	url?: string;
	videoId?: string;
	startMs?: number;
	videoUrl?: string;
	segmentIndex?: number;
	section?: string;
	fecha?: string;
};

export type AskFilters = {
	/** Uno o varios corpus (OR). Ej. ["contapyme", "dian"] */
	corpus?: RagCorpus[];
	/** Subfiltro por tipo de fuente */
	tipo?: RagTipo[];
};

export function normalizeCorpusList(input: string[] | undefined): RagCorpus[] | undefined {
	if (!input?.length) return undefined;
	const allowed = new Set<RagCorpus>([
		"contapyme",
		"agrowin",
		"dian",
		"legal",
		"minhacienda",
		"supersociedades",
	]);
	const out = input
		.map((c) => c.trim().toLowerCase())
		.filter((c): c is RagCorpus => allowed.has(c as RagCorpus));
	return out.length ? out : undefined;
}

export function normalizeTipoList(input: string[] | undefined): RagTipo[] | undefined {
	if (!input?.length) return undefined;
	const allowed = new Set<RagTipo>(["youtube", "pdf", "web", "normativa"]);
	const out = input
		.map((t) => t.trim().toLowerCase())
		.filter((t): t is RagTipo => allowed.has(t as RagTipo));
	return out.length ? out : undefined;
}

/** Filtro PGVector para similaritySearch. */
export function buildMetadataFilter(filters?: AskFilters): PgMetadataFilter | undefined {
	if (!filters) return undefined;
	const meta: PgMetadataFilter = {};
	if (filters.corpus?.length === 1) meta.corpus = filters.corpus[0];
	else if (filters.corpus && filters.corpus.length > 1) meta.corpus = { in: filters.corpus };
	if (filters.tipo?.length === 1) meta.tipo = filters.tipo[0];
	else if (filters.tipo && filters.tipo.length > 1) meta.tipo = { in: filters.tipo };
	return Object.keys(meta).length > 0 ? meta : undefined;
}

/** Inferir corpus ContaPyme vs AgroWin desde título del video. */
export function inferYoutubeCorpus(title: string): RagCorpus {
	if (/agrowin|agro\s*win/i.test(title)) return "agrowin";
	return "contapyme";
}

export function corpusFromHostname(hostname: string): RagCorpus {
	const h = hostname.toLowerCase().replace(/^www\./, "");
	if (h.includes("dian.gov.co")) return "dian";
	if (h.includes("minhacienda.gov.co")) return "minhacienda";
	if (h.includes("supersociedades.gov.co")) return "supersociedades";
	if (h.includes("consejodeestado.gov.co") || h.includes("suin-juriscol")) return "legal";
	return "legal";
}

export function tipoFromUrl(url: string): RagTipo {
	const path = url.toLowerCase();
	if (path.endsWith(".pdf") || path.includes("/pdf/")) return "normativa";
	if (/normativ|circul|resoluc|decreto|ley|estatut|concepto/i.test(path)) return "normativa";
	return "web";
}
