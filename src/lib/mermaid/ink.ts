import { createHash } from "node:crypto";

const MERMAID_FLOWCHART_INIT =
	'%%{init: {"flowchart": {"curve": "stepAfter", "htmlLabels": true, "nodeSpacing": 44, "rankSpacing": 52, "padding": 18}}}%%';

/** Normaliza diagrama (mismo criterio que ISA-DOC ticket-assets-lib). */
export function prepareMermaidDiagram(diagram: string): string {
	const trimmed = diagram.trim();
	if (/^%%\{init:/i.test(trimmed)) return trimmed;
	if (!/^(flowchart|graph)\s/im.test(trimmed)) return trimmed;
	return `${MERMAID_FLOWCHART_INIT}\n${trimmed}`;
}

function utf8ToBase64Url(text: string): string {
	return Buffer.from(text, "utf8")
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}

/** URL estable de mermaid.ink para un diagrama (clave de deduplicación). */
export function mermaidInkUrl(diagram: string, format: "img" | "svg" = "img"): string {
	const prepared = prepareMermaidDiagram(diagram);
	const encoded = utf8ToBase64Url(prepared);
	return `https://mermaid.ink/${format}/${encoded}`;
}

/** SHA1 del texto fuente normalizado (deduplicación alternativa). */
export function mermaidSourceSha1(diagram: string): string {
	return createHash("sha1").update(prepareMermaidDiagram(diagram), "utf8").digest("hex");
}
