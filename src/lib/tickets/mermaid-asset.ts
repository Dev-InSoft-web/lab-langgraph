import { getEntityRow, listEntityRows, upsertEntityRow } from "../ispgen/repository.js";
import { uploadUrlToImgbb } from "../imgbb/upload.js";
import { mermaidInkUrl, mermaidSourceSha1, prepareMermaidDiagram } from "../mermaid/ink.js";

const SEGMENT = { project: "isa-doc", page: "tickets", entity: "imgbb-asset" } as const;

export type MermaidAssetRecord = {
	filename: string;
	ticketId?: string | null;
	kind: "mermaid";
	mermaidSource: string;
	mermaidInkUrl: string;
	sourceSha1: string;
	url: string;
	display_url?: string;
	thumb?: string;
	sha1?: string;
	width: number;
	height: number;
	size?: number;
	publishedAt?: string;
};

function rowToRecord(body: Record<string, unknown>): MermaidAssetRecord {
	return body as unknown as MermaidAssetRecord;
}

/** Busca asset ya publicado con la misma URL mermaid.ink (idempotente). */
export async function findMermaidByInkUrl(inkUrl: string): Promise<MermaidAssetRecord | null> {
	const { rows } = await listEntityRows(SEGMENT, {
		limit: 1,
		filter: { mermaidInkUrl: inkUrl },
	});
	if (!rows.length) return null;
	return rowToRecord(rows[0].body as Record<string, unknown>);
}

export async function getMermaidAsset(filename: string): Promise<MermaidAssetRecord | null> {
	const row = await getEntityRow(SEGMENT, filename);
	if (!row?.body) return null;
	const body = row.body as Record<string, unknown>;
	if (body.kind !== "mermaid" && !body.mermaidSource) return null;
	return rowToRecord(body);
}

export type PublishMermaidOpts = {
	filename: string;
	source: string;
	ticketId?: string;
	/** Si true, vuelve a subir a imgbb aunque exista fila con mismo mermaidInkUrl. */
	force?: boolean;
};

/**
 * Publica diagrama Mermaid → mermaid.ink → imgbb → PG.
 * Dedup: si ya hay fila con el mismo `mermaidInkUrl`, devuelve la existente.
 */
export async function publishMermaidAsset(opts: PublishMermaidOpts): Promise<{
	record: MermaidAssetRecord;
	reused: boolean;
}> {
	const filename = opts.filename.trim();
	if (!filename) throw new Error("filename requerido");
	const prepared = prepareMermaidDiagram(opts.source);
	const inkUrl = mermaidInkUrl(prepared);
	const sourceSha1 = mermaidSourceSha1(prepared);

	if (!opts.force) {
		const existing = await findMermaidByInkUrl(inkUrl);
		if (existing?.url) {
			return { record: existing, reused: true };
		}
	}

	const uploaded = await uploadUrlToImgbb(filename, inkUrl);
	const record: MermaidAssetRecord = {
		filename,
		ticketId: opts.ticketId ?? null,
		kind: "mermaid",
		mermaidSource: prepared,
		mermaidInkUrl: inkUrl,
		sourceSha1,
		url: uploaded.url,
		display_url: uploaded.display_url,
		thumb: uploaded.thumb,
		sha1: uploaded.sha1,
		width: uploaded.width,
		height: uploaded.height,
		size: uploaded.size,
		publishedAt: new Date().toISOString(),
	};

	await upsertEntityRow(SEGMENT, filename, record as unknown as Record<string, unknown>, {
		parent: opts.ticketId
			? { project: "isa-doc", page: "tickets", entity: "ticket", ientityid: opts.ticketId }
			: undefined,
		tags: opts.ticketId ? [opts.ticketId, "mermaid"] : ["mermaid"],
	});

	return { record, reused: false };
}
