import { query, queryOne } from "../../db/pg.js";
import {
	Q_PATY_CONVERSACION,
	Q_PATY_CONVERSACION_TURNO,
	Q_PATY_MENSAJE_CALIFICADO,
} from "../../db/pg-identifiers.js";
import { sqlCol } from "../../db/pg-quote.js";
import type { ConversationTurnMeta } from "../conversation/turnLog.js";
import type { ConversationRecord, ConversationTurn, RatedMessage } from "../conversation/types.js";
import type { PatyPromptTipo } from "../prompts/types.js";
import { ensurePatyiaSchema } from "./ensureSchema.js";
import { nextTurnIndex } from "./turnControl.js";

type ConvRow = {
	iconversacion: string;
	itercero: string;
	icontacto: string;
	nombreusuario: string;
	titulo: string;
	hilo: string;
	modeloia: string;
	versionayuda: string;
	itdestado: number;
	prompt: string;
	respuesta: string;
	qtokens: string;
	qmensajes: number;
	fhcre: Date;
	fhultact: Date;
};

type TurnRow = {
	ts: Date;
	prompttext: string;
	responsetext: string;
	prompttipo: string | null;
	corpus: string[] | null;
	bjailbreak: boolean;
	latencyms: number | null;
	iturnindex: number | null;
	ilease: string | null;
	provider: string | null;
	keylabel: string | null;
	metalog: ConversationTurnMeta | null;
};

function rowToRecord(row: ConvRow, turnos: ConversationTurn[]): ConversationRecord {
	return {
		iconversacion: Number(row.iconversacion),
		itercero: row.itercero,
		icontacto: row.icontacto,
		nombreUsuario: row.nombreusuario,
		titulo: row.titulo,
		prompt: row.prompt,
		respuesta: row.respuesta,
		hilo: row.hilo,
		modelo: row.modeloia,
		itdestado: row.itdestado as ConversationRecord["itdestado"],
		qtokens: Number(row.qtokens),
		qmensajes: row.qmensajes,
		fhcre: row.fhcre.toISOString(),
		fhultact: row.fhultact.toISOString(),
		version_ayuda: row.versionayuda,
		turnos,
	};
}

async function loadTurnos(iconversacion: number): Promise<ConversationTurn[]> {
	const rows = await query<TurnRow>(
		`SELECT ${sqlCol("ts")} AS ts, ${sqlCol("prompttext")} AS prompttext, ${sqlCol("responsetext")} AS responsetext,
            ${sqlCol("prompttipo")} AS prompttipo, ${sqlCol("corpus")} AS corpus, ${sqlCol("bjailbreak")} AS bjailbreak,
            ${sqlCol("latencyms")} AS latencyms, ${sqlCol("iturnindex")} AS iturnindex, ${sqlCol("ilease")} AS ilease,
            ${sqlCol("provider")} AS provider, ${sqlCol("keylabel")} AS keylabel,
            ${sqlCol("metalog")} AS metalog
     FROM ${Q_PATY_CONVERSACION_TURNO} WHERE ${sqlCol("iconversacion")} = $1 ORDER BY ${sqlCol("ts")}`,
		[iconversacion],
	);
	return rows.map((t) => ({
		ts: t.ts.toISOString(),
		promptText: t.prompttext,
		responseText: t.responsetext,
		promptTipo: (t.prompttipo as PatyPromptTipo | undefined) ?? undefined,
		itdconsulta: t.prompttipo ?? undefined,
		corpus: t.corpus ?? undefined,
		jailbreak: t.bjailbreak,
		latencyMs: t.latencyms ?? undefined,
		turnIndex: t.iturnindex ?? undefined,
		leaseId: t.ilease ?? undefined,
		provider: t.provider ?? undefined,
		keyLabel: t.keylabel ?? undefined,
		meta: t.metalog ?? undefined,
	}));
}

export async function listConversationTurnLogsPg(iconversacion: number): Promise<
	Array<{
		turnIndex: number;
		ts: string;
		promptText: string;
		responseText: string;
		promptTipo: string;
		meta: ConversationTurnMeta;
	}>
> {
	await ensurePatyiaSchema();
	const rows = await query<TurnRow>(
		`SELECT ${sqlCol("ts")} AS ts, ${sqlCol("prompttext")} AS prompttext, ${sqlCol("responsetext")} AS responsetext,
            ${sqlCol("prompttipo")} AS prompttipo, ${sqlCol("iturnindex")} AS iturnindex, ${sqlCol("metalog")} AS metalog
     FROM ${Q_PATY_CONVERSACION_TURNO} WHERE ${sqlCol("iconversacion")} = $1 ORDER BY ${sqlCol("iturnindex")}, ${sqlCol("ts")}`,
		[iconversacion],
	);
	return rows.map((t) => ({
		turnIndex: t.iturnindex ?? 0,
		ts: t.ts.toISOString(),
		promptText: t.prompttext,
		responseText: t.responsetext,
		promptTipo: t.prompttipo ?? "REQUIERE_CONTEXTO",
		meta: (t.metalog ?? {}) as ConversationTurnMeta,
	}));
}

export async function insertConversationPg(record: Omit<ConversationRecord, "iconversacion" | "turnos">): Promise<number> {
	await ensurePatyiaSchema();
	const row = await queryOne<{ iconversacion: string }>(
		`INSERT INTO ${Q_PATY_CONVERSACION} (
       ${sqlCol("itercero")}, ${sqlCol("icontacto")}, ${sqlCol("nombreusuario")}, ${sqlCol("titulo")}, ${sqlCol("hilo")}, ${sqlCol("modeloia")}, ${sqlCol("versionayuda")},
       ${sqlCol("prompt")}, ${sqlCol("respuesta")}, ${sqlCol("qtokens")}, ${sqlCol("qmensajes")}, ${sqlCol("fhcre")}, ${sqlCol("fhultact")}
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW())
     RETURNING ${sqlCol("iconversacion")} AS iconversacion`,
		[
			record.itercero,
			record.icontacto,
			record.nombreUsuario,
			record.titulo,
			record.hilo,
			record.modelo,
			record.version_ayuda,
			record.prompt,
			record.respuesta ?? "",
			record.qtokens,
			record.qmensajes,
		],
	);
	return Number(row!.iconversacion);
}

export async function updateConversationPg(record: ConversationRecord): Promise<void> {
	await ensurePatyiaSchema();
	await query(
		`UPDATE ${Q_PATY_CONVERSACION} SET
       ${sqlCol("itercero")}=$2, ${sqlCol("icontacto")}=$3, ${sqlCol("nombreusuario")}=$4, ${sqlCol("titulo")}=$5, ${sqlCol("hilo")}=$6, ${sqlCol("modeloia")}=$7,
       ${sqlCol("prompt")}=$8, ${sqlCol("respuesta")}=$9, ${sqlCol("qtokens")}=$10, ${sqlCol("qmensajes")}=$11, ${sqlCol("fhultact")}=NOW()
     WHERE ${sqlCol("iconversacion")}=$1`,
		[
			record.iconversacion,
			record.itercero,
			record.icontacto,
			record.nombreUsuario,
			record.titulo,
			record.hilo,
			record.modelo,
			record.prompt,
			record.respuesta ?? "",
			record.qtokens,
			record.qmensajes,
		],
	);
}

export async function loadConversationPg(id: number): Promise<ConversationRecord | null> {
	await ensurePatyiaSchema();
	const row = await queryOne<ConvRow>(
		`SELECT ${sqlCol("iconversacion")} AS iconversacion, ${sqlCol("itercero")} AS itercero, ${sqlCol("icontacto")} AS icontacto,
       ${sqlCol("nombreusuario")} AS nombreusuario, ${sqlCol("titulo")} AS titulo, ${sqlCol("hilo")} AS hilo, ${sqlCol("modeloia")} AS modeloia,
       ${sqlCol("versionayuda")} AS versionayuda, ${sqlCol("itdestado")} AS itdestado, ${sqlCol("prompt")} AS prompt, ${sqlCol("respuesta")} AS respuesta,
       ${sqlCol("qtokens")} AS qtokens, ${sqlCol("qmensajes")} AS qmensajes, ${sqlCol("fhcre")} AS fhcre, ${sqlCol("fhultact")} AS fhultact
     FROM ${Q_PATY_CONVERSACION} WHERE ${sqlCol("iconversacion")} = $1`,
		[id],
	);
	if (!row) return null;
	const turnos = await loadTurnos(id);
	return rowToRecord(row, turnos);
}

export async function appendTurnPg(
	iconversacion: number,
	turn: ConversationTurn,
): Promise<void> {
	const idx = turn.turnIndex ?? (await nextTurnIndex(iconversacion));

	await query(
		`INSERT INTO ${Q_PATY_CONVERSACION_TURNO} (
       ${sqlCol("iconversacion")}, ${sqlCol("ts")}, ${sqlCol("prompttext")}, ${sqlCol("responsetext")}, ${sqlCol("prompttipo")}, ${sqlCol("corpus")}, ${sqlCol("bjailbreak")}, ${sqlCol("latencyms")},
       ${sqlCol("iturnindex")}, ${sqlCol("ilease")}, ${sqlCol("provider")}, ${sqlCol("keylabel")}, ${sqlCol("metalog")}
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb)`,
		[
			iconversacion,
			turn.ts,
			turn.promptText,
			turn.responseText,
			turn.promptTipo ?? null,
			turn.corpus ?? null,
			turn.jailbreak ?? false,
			turn.latencyMs ?? null,
			idx,
			turn.leaseId ?? null,
			turn.provider ?? null,
			turn.keyLabel ?? null,
			JSON.stringify(turn.meta ?? {}),
		],
	);
}

export type ConversationListItem = {
	iconversacion: number;
	itercero: string;
	icontacto: string;
	nombreUsuario: string;
	titulo: string;
	hilo: string;
	prompt: string;
	qmensajes: number;
	fhcre: string;
	fhultact: string;
};

export async function listConversationsPg(
	itercero: string,
	icontacto?: string,
	limit = 200,
): Promise<ConversationListItem[]> {
	await ensurePatyiaSchema();
	const params: unknown[] = [itercero];
	let where = `${sqlCol("itercero")} = $1 AND ${sqlCol("itdestado")} <> 2`;
	if (icontacto?.trim()) {
		params.push(icontacto.trim());
		where += ` AND ${sqlCol("icontacto")} = $2`;
	}
	params.push(limit);
	const limIdx = params.length;
	const rows = await query<ConvRow>(
		`SELECT ${sqlCol("iconversacion")} AS iconversacion, ${sqlCol("itercero")} AS itercero, ${sqlCol("icontacto")} AS icontacto,
       ${sqlCol("nombreusuario")} AS nombreusuario, ${sqlCol("titulo")} AS titulo, ${sqlCol("hilo")} AS hilo,
       ${sqlCol("prompt")} AS prompt, ${sqlCol("qmensajes")} AS qmensajes, ${sqlCol("fhcre")} AS fhcre, ${sqlCol("fhultact")} AS fhultact
     FROM ${Q_PATY_CONVERSACION}
     WHERE ${where}
     ORDER BY ${sqlCol("fhultact")} DESC
     LIMIT $${limIdx}`,
		params,
	);
	return rows.map((row) => ({
		iconversacion: Number(row.iconversacion),
		itercero: row.itercero,
		icontacto: row.icontacto,
		nombreUsuario: row.nombreusuario,
		titulo: row.titulo,
		hilo: row.hilo,
		prompt: row.prompt,
		qmensajes: row.qmensajes,
		fhcre: row.fhcre.toISOString(),
		fhultact: row.fhultact.toISOString(),
	}));
}

export async function createConversationPg(input: {
	itercero: string;
	icontacto: string;
	nombreUsuario: string;
	titulo?: string;
}): Promise<number> {
	return insertConversationPg({
		itercero: input.itercero,
		icontacto: input.icontacto,
		nombreUsuario: input.nombreUsuario,
		titulo: input.titulo?.trim() || "Nueva conversación",
		prompt: "",
		respuesta: "",
		hilo: "",
		modelo: "",
		itdestado: 0,
		qtokens: 0,
		qmensajes: 0,
		fhcre: new Date().toISOString(),
		fhultact: new Date().toISOString(),
		version_ayuda: "lab-langgraph",
	});
}

export async function patchConversationPg(
	id: number,
	patch: { titulo?: string; itdestado?: number },
): Promise<boolean> {
	await ensurePatyiaSchema();
	const sets: string[] = [];
	const params: unknown[] = [id];
	let i = 2;
	if (patch.titulo !== undefined) {
		sets.push(`${sqlCol("titulo")} = $${i++}`);
		params.push(patch.titulo.trim());
	}
	if (patch.itdestado !== undefined) {
		sets.push(`${sqlCol("itdestado")} = $${i++}`);
		params.push(patch.itdestado);
	}
	if (!sets.length) return true;
	sets.push(`${sqlCol("fhultact")} = NOW()`);
	const row = await queryOne<{ iconversacion: string }>(
		`UPDATE ${Q_PATY_CONVERSACION} SET ${sets.join(", ")} WHERE ${sqlCol("iconversacion")} = $1 RETURNING ${sqlCol("iconversacion")} AS iconversacion`,
		params,
	);
	return Boolean(row);
}

export async function deleteConversationPg(id: number): Promise<boolean> {
	return patchConversationPg(id, { itdestado: 2 });
}

export async function appendRatingPg(msg: RatedMessage): Promise<void> {
	await ensurePatyiaSchema();
	const texto = msg.comentario?.trim() || `calificacion=${msg.calificacion ?? ""}`;
	await query(
		`INSERT INTO ${Q_PATY_MENSAJE_CALIFICADO} (${sqlCol("iconversacion")}, ${sqlCol("contenido")}, ${sqlCol("calificacion")}, ${sqlCol("comentario")})
     VALUES ($1, $2, $3, $4)`,
		[msg.iconversacion, texto, msg.calificacion ?? null, msg.comentario ?? null],
	);
}
