import { query, queryOne } from "../../db/pg.js";
import {
	Q_PATY_INSTRUCCION,
	Q_PATY_TDCONSULTA,
	Q_PATY_TDCONSULTA_CORPUS,
	Q_PATY_TDCONSULTA_INSTRUCCION,
} from "../../db/pg-identifiers.js";
import { interpolatePromptVars } from "../prompts/vars.js";
import type { PatyPromptTipo } from "../prompts/types.js";
import { ensurePatyiaSchema } from "./ensureSchema.js";

const BASE_KEY = "PATY_BASE";

export async function upsertInstruccion(row: {
	iinstruccion: string;
	ninstruccion: string;
	instruccion: string;
	descripcion?: string;
	modelo?: string;
	version?: string;
}): Promise<void> {
	await ensurePatyiaSchema();
	await query(
		`INSERT INTO ${Q_PATY_INSTRUCCION} (iinstruccion, ninstruccion, modelo, instruccion, descripcion, version, fhultact)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (iinstruccion) DO UPDATE SET
       ninstruccion = EXCLUDED.ninstruccion,
       modelo = EXCLUDED.modelo,
       instruccion = EXCLUDED.instruccion,
       descripcion = EXCLUDED.descripcion,
       version = EXCLUDED.version,
       fhultact = NOW()`,
		[
			row.iinstruccion,
			row.ninstruccion,
			row.modelo ?? "",
			row.instruccion,
			row.descripcion ?? "",
			row.version ?? "ultra",
		],
	);
}

export async function upsertTdConsulta(row: {
	itdconsulta: string;
	nconsulta?: string;
	descripcion?: string;
}): Promise<void> {
	await ensurePatyiaSchema();
	await query(
		`INSERT INTO ${Q_PATY_TDCONSULTA} (itdconsulta, nconsulta, descripcion)
     VALUES ($1, $2, $3)
     ON CONFLICT (itdconsulta) DO UPDATE SET
       nconsulta = EXCLUDED.nconsulta,
       descripcion = EXCLUDED.descripcion`,
		[row.itdconsulta, row.nconsulta ?? row.itdconsulta, row.descripcion ?? ""],
	);
}

export async function linkTdInstruccion(itdconsulta: string, iinstruccion: string, orden = 1): Promise<void> {
	await query(
		`INSERT INTO ${Q_PATY_TDCONSULTA_INSTRUCCION} (itdconsulta, iinstruccion, iorden)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
		[itdconsulta, iinstruccion, orden],
	);
}

export async function setTdCorpus(itdconsulta: string, corpusList: string[]): Promise<void> {
	await query(`DELETE FROM ${Q_PATY_TDCONSULTA_CORPUS} WHERE itdconsulta = $1`, [itdconsulta]);
	for (let i = 0; i < corpusList.length; i += 1) {
		await query(
			`INSERT INTO ${Q_PATY_TDCONSULTA_CORPUS} (itdconsulta, corpus, iorden) VALUES ($1, $2, $3)`,
			[itdconsulta, corpusList[i], i + 1],
		);
	}
}

export async function getBasePromptMarkdown(): Promise<string> {
	await ensurePatyiaSchema();
	const row = await queryOne<{ instruccion: string }>(
		`SELECT instruccion FROM ${Q_PATY_INSTRUCCION} WHERE iinstruccion = $1`,
		[BASE_KEY],
	);
	return row?.instruccion ?? "";
}

export async function getAgentSystemPromptFromDb(
	tipo: PatyPromptTipo,
	nombreUsuario: string,
): Promise<string> {
	await ensurePatyiaSchema();
	const base = await getBasePromptMarkdown();
	const agent = await queryOne<{ instruccion: string }>(
		`SELECT instruccion FROM ${Q_PATY_INSTRUCCION} WHERE iinstruccion = $1`,
		[tipo],
	);
	if (!agent) {
		throw new Error(
			`Agente no encontrado en PG: ${tipo}. Desde ISA-DOC: npm run lab:patyia:sync-prompts`,
		);
	}
	const merged = base
		? `${base.trim()}\n\n---\n\n## Agente activo\n\n${agent.instruccion.trim()}`
		: agent.instruccion.trim();
	return interpolatePromptVars(merged, { nombre_usuario: nombreUsuario });
}

export async function listAgentTipos(): Promise<PatyPromptTipo[]> {
	await ensurePatyiaSchema();
	const rows = await query<{ iinstruccion: string }>(
		`SELECT iinstruccion FROM ${Q_PATY_INSTRUCCION}
     WHERE iinstruccion <> 'PATY_BASE'
     ORDER BY iinstruccion`,
	);
	return rows.map((r) => r.iinstruccion as PatyPromptTipo);
}

export async function getCorpusForTipo(tipo: PatyPromptTipo): Promise<string[]> {
	await ensurePatyiaSchema();
	const rows = await query<{ corpus: string }>(
		`SELECT corpus FROM ${Q_PATY_TDCONSULTA_CORPUS} WHERE itdconsulta = $1 ORDER BY iorden`,
		[tipo],
	);
	return rows.map((r) => r.corpus);
}
