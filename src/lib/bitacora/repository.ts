import {
	getEntityRow,
	listEntityRows,
	upsertEntityRow,
} from "../ispgen/repository.js";
import type { EntitySegment } from "../ispgen/types.js";
import {
	BITACORA_PAGE,
	ENTITY_LAYOUT,
	ENTITY_SEGMENT_MD,
	ENTITY_SEGMENT_SQL,
	type BitacoraBundle,
	type BitacoraLayoutBody,
	type BitacoraMdSegmentBody,
	type BitacoraSqlSegmentBody,
} from "./types.js";

function seg(project: string, entity: string): EntitySegment {
	return { project, page: BITACORA_PAGE, entity };
}

export async function loadBitacoraBundle(project: string): Promise<BitacoraBundle | null> {
	const layoutRow = await getEntityRow(seg(project, ENTITY_LAYOUT), "default");
	if (!layoutRow?.body) return null;

	const layout = layoutRow.body as unknown as BitacoraLayoutBody;
	const md: Record<string, BitacoraMdSegmentBody> = {};
	const sql: Record<string, BitacoraSqlSegmentBody> = {};

	const mdList = await listEntityRows(seg(project, ENTITY_SEGMENT_MD), { limit: 500 });
	for (const row of mdList.rows) {
		md[row.ientityid] = row.body as unknown as BitacoraMdSegmentBody;
	}

	const sqlList = await listEntityRows(seg(project, ENTITY_SEGMENT_SQL), { limit: 500 });
	for (const row of sqlList.rows) {
		sql[row.ientityid] = row.body as unknown as BitacoraSqlSegmentBody;
	}

	return { ok: true, project, layout, md, sql };
}

export async function saveBitacoraLayout(project: string, layout: BitacoraLayoutBody): Promise<void> {
	await upsertEntityRow(seg(project, ENTITY_LAYOUT), "default", {
		...layout,
		project,
		version: layout.version ?? 1,
		updatedAt: new Date().toISOString(),
	});
}

export async function saveBitacoraMdSegment(
	project: string,
	segmentId: string,
	body: BitacoraMdSegmentBody,
	sortKey = 0,
): Promise<void> {
	await upsertEntityRow(seg(project, ENTITY_SEGMENT_MD), segmentId, body, { sort_key: sortKey });
}

export async function saveBitacoraSqlSegment(
	project: string,
	segmentId: string,
	body: BitacoraSqlSegmentBody,
	sortKey = 0,
): Promise<void> {
	await upsertEntityRow(seg(project, ENTITY_SEGMENT_SQL), segmentId, body, { sort_key: sortKey });
}
