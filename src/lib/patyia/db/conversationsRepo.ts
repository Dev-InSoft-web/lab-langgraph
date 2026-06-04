import { query, queryOne } from "../../db/pg.js";
import {
	Q_PATY_CONVERSACION,
	Q_PATY_CONVERSACION_TURNO,
	Q_PATY_MENSAJE_CALIFICADO,
} from "../../db/pg-identifiers.js";
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
		`SELECT ts, prompttext, responsetext, prompttipo, corpus, bjailbreak, latencyms,
            iturnindex, ilease, provider, keylabel
     FROM ${Q_PATY_CONVERSACION_TURNO} WHERE iconversacion = $1 ORDER BY ts`,
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
	}));
}

export async function insertConversationPg(record: Omit<ConversationRecord, "iconversacion" | "turnos">): Promise<number> {
	await ensurePatyiaSchema();
	const row = await queryOne<{ iconversacion: string }>(
		`INSERT INTO ${Q_PATY_CONVERSACION} (
       itercero, icontacto, nombreusuario, titulo, hilo, modeloia, versionayuda,
       prompt, respuesta, qtokens, qmensajes, fhcre, fhultact
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW())
     RETURNING iconversacion`,
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
       itercero=$2, icontacto=$3, nombreusuario=$4, titulo=$5, hilo=$6, modeloia=$7,
       prompt=$8, respuesta=$9, qtokens=$10, qmensajes=$11, fhultact=NOW()
     WHERE iconversacion=$1`,
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
		`SELECT * FROM ${Q_PATY_CONVERSACION} WHERE iconversacion = $1`,
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
       iconversacion, ts, prompttext, responsetext, prompttipo, corpus, bjailbreak, latencyms,
       iturnindex, ilease, provider, keylabel
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
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
		],
	);
}

export async function appendRatingPg(msg: RatedMessage): Promise<void> {
	await ensurePatyiaSchema();
	const texto = msg.comentario?.trim() || `calificacion=${msg.calificacion ?? ""}`;
	await query(
		`INSERT INTO ${Q_PATY_MENSAJE_CALIFICADO} (iconversacion, contenido, calificacion, comentario)
     VALUES ($1, $2, $3, $4)`,
		[msg.iconversacion, texto, msg.calificacion ?? null, msg.comentario ?? null],
	);
}
