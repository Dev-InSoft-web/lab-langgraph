import { query, queryOne } from "../../db/pg.js";
import {
	Q_PATY_INSTRUCCION,
	Q_PATY_TDCONSULTA,
	Q_PATY_TDCONSULTA_CORPUS,
	Q_PATY_TDCONSULTA_INSTRUCCION,
} from "../../db/pg-identifiers.js";
import { sqlCol } from "../../db/pg-quote.js";
import { interpolatePromptVars } from "../prompts/vars.js";
import { wrapAgentPrompt } from "../prompts/prompt-common.js";
import type { ConsultaTipo } from "../prompts/types.js";
import { ensureLanglabSchema } from "./ensureSchema.js";

const BASE_KEY = "LANGLAB_BASE";

export async function upsertInstruccion(row: {
	iinstruccion: string;
	ninstruccion: string;
	instruccion: string;
	descripcion?: string;
	modelo?: string;
	version?: string;
}): Promise<void> {
	await ensureLanglabSchema();
	await query(
		`INSERT INTO ${Q_PATY_INSTRUCCION} (${sqlCol("iinstruccion")}, ${sqlCol("ninstruccion")}, ${sqlCol("modelo")}, ${sqlCol("instruccion")}, ${sqlCol("descripcion")}, ${sqlCol("version")}, ${sqlCol("fhultact")})
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (${sqlCol("iinstruccion")}) DO UPDATE SET
       ${sqlCol("ninstruccion")} = EXCLUDED.${sqlCol("ninstruccion")},
       ${sqlCol("modelo")} = EXCLUDED.${sqlCol("modelo")},
       ${sqlCol("instruccion")} = EXCLUDED.${sqlCol("instruccion")},
       ${sqlCol("descripcion")} = EXCLUDED.${sqlCol("descripcion")},
       ${sqlCol("version")} = EXCLUDED.${sqlCol("version")},
       ${sqlCol("fhultact")} = NOW()`,
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
	await ensureLanglabSchema();
	await query(
		`INSERT INTO ${Q_PATY_TDCONSULTA} (${sqlCol("itdconsulta")}, ${sqlCol("nconsulta")}, ${sqlCol("descripcion")})
     VALUES ($1, $2, $3)
     ON CONFLICT (${sqlCol("itdconsulta")}) DO UPDATE SET
       ${sqlCol("nconsulta")} = EXCLUDED.${sqlCol("nconsulta")},
       ${sqlCol("descripcion")} = EXCLUDED.${sqlCol("descripcion")}`,
		[row.itdconsulta, row.nconsulta ?? row.itdconsulta, row.descripcion ?? ""],
	);
}

export async function linkTdInstruccion(itdconsulta: string, iinstruccion: string, orden = 1): Promise<void> {
	await query(
		`INSERT INTO ${Q_PATY_TDCONSULTA_INSTRUCCION} (${sqlCol("itdconsulta")}, ${sqlCol("iinstruccion")}, ${sqlCol("iorden")})
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
		[itdconsulta, iinstruccion, orden],
	);
}

export async function setTdCorpus(itdconsulta: string, corpusList: string[]): Promise<void> {
	await query(`DELETE FROM ${Q_PATY_TDCONSULTA_CORPUS} WHERE ${sqlCol("itdconsulta")} = $1`, [itdconsulta]);
		for (let i = 0; i < corpusList.length; i += 1) {
		await query(
			`INSERT INTO ${Q_PATY_TDCONSULTA_CORPUS} (${sqlCol("itdconsulta")}, ${sqlCol("corpus")}, ${sqlCol("iorden")}) VALUES ($1, $2, $3)`,
			[itdconsulta, corpusList[i], i + 1],
		);
	}
}

export async function getBasePromptMarkdown(): Promise<string> {
	await ensureLanglabSchema();
	const row = await queryOne<{ instruccion: string }>(
		`SELECT ${sqlCol("instruccion")} AS instruccion FROM ${Q_PATY_INSTRUCCION} WHERE ${sqlCol("iinstruccion")} = $1`,
		[BASE_KEY],
	);
	return row?.instruccion ?? "";
}

export async function getAgentSystemPromptFromDb(
	tipo: ConsultaTipo,
	nombreUsuario: string,
): Promise<string> {
	await ensureLanglabSchema();
	const base = await getBasePromptMarkdown();
	const agent = await queryOne<{ instruccion: string }>(
		`SELECT ${sqlCol("instruccion")} AS instruccion FROM ${Q_PATY_INSTRUCCION} WHERE ${sqlCol("iinstruccion")} = $1`,
		[tipo],
	);
	if (!agent) {
		throw new Error(
			`Agente no encontrado en PG: ${tipo}. Sincroniza prompts: npm run lab:langlab:sync-prompts`,
		);
	}
	const merged = wrapAgentPrompt(base, agent.instruccion);
	return interpolatePromptVars(merged, { nombre_usuario: nombreUsuario });
}

export async function listAgentTipos(): Promise<ConsultaTipo[]> {
	await ensureLanglabSchema();
	const rows = await query<{ iinstruccion: string }>(
		`SELECT ${sqlCol("iinstruccion")} AS iinstruccion FROM ${Q_PATY_INSTRUCCION}
     WHERE ${sqlCol("iinstruccion")} <> 'LANGLAB_BASE'
     ORDER BY ${sqlCol("iinstruccion")}`,
	);
	return rows.map((r) => r.iinstruccion as ConsultaTipo);
}

export async function getCorpusForTipo(tipo: ConsultaTipo): Promise<string[]> {
	await ensureLanglabSchema();
	const rows = await query<{ corpus: string }>(
		`SELECT ${sqlCol("corpus")} AS corpus FROM ${Q_PATY_TDCONSULTA_CORPUS} WHERE ${sqlCol("itdconsulta")} = $1 ORDER BY ${sqlCol("iorden")}`,
		[tipo],
	);
	return rows.map((r) => r.corpus);
}
