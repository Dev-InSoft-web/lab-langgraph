/** Variantes ASR → marca canónica (regex por marca). */
const ASR_TO_BRAND: Array<{ brand: string; patterns: RegExp[] }> = [
	{
		brand: "AgroWin",
		patterns: [/\bagro\s*wing\b/gi, /\bagro[- ]?win\b/gi, /\bagrowin\b/gi, /\bagro\s*win\b/gi],
	},
	{
		brand: "ContaPyme",
		patterns: [
			/\bconta\s*pyme\b/gi,
			/\bconta\s*pime\b/gi,
			/\bcontapime\b/gi,
			/\bconta[- ]?pyme\b/gi,
		],
	},
	{ brand: "INSOFT", patterns: [/\bin\s*soft\b/gi, /\binsoft\b/gi] },
];

export type VideoTextContext = {
	title?: string;
	description?: string;
	tags?: string[];
};

/** Marcas mencionadas en título, descripción o etiquetas del video. */
export function extractBrandsFromContext(ctx: VideoTextContext): string[] {
	const blob = [ctx.title, ctx.description, ...(ctx.tags ?? [])].filter(Boolean).join("\n");
	const found = new Set<string>();
	for (const { brand } of ASR_TO_BRAND) {
		if (new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(blob)) {
			found.add(brand);
		}
	}
	return [...found];
}

export function applyBrandCorrectionsToText(text: string, activeBrands: string[]): string {
	let t = text;
	const allowed = new Set(activeBrands);
	for (const { brand, patterns } of ASR_TO_BRAND) {
		if (!allowed.has(brand)) continue;
		for (const p of patterns) {
			t = t.replace(p, brand);
		}
	}
	return t;
}

export function applyBrandCorrectionsToSegments<T extends { text: string }>(
	segments: T[],
	ctx: VideoTextContext,
): T[] {
	const brands = extractBrandsFromContext(ctx);
	if (!brands.length) return segments;
	return segments.map((s) => ({
		...s,
		text: applyBrandCorrectionsToText(s.text, brands),
	}));
}

export function formatVideoContextForPrompt(ctx: VideoTextContext): string {
	const parts: string[] = [];
	if (ctx.title?.trim()) parts.push(`Título: ${ctx.title.trim()}`);
	if (ctx.description?.trim()) {
		const d = ctx.description.trim().slice(0, 1200);
		parts.push(`Descripción: ${d}`);
	}
	if (ctx.tags?.length) parts.push(`Etiquetas: ${ctx.tags.slice(0, 20).join(", ")}`);
	const brands = extractBrandsFromContext(ctx);
	if (brands.length) parts.push(`Marcas/productos del video: ${brands.join(", ")}`);
	return parts.join("\n");
}
