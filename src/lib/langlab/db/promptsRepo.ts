import { query, queryOne } from "../../db/pg.js";
import {
	Q_CONVERSACION_TIPOCONSULTA,
	Q_PATY_INSTRUCCION,
} from "../../db/pg-identifiers.js";
import { sqlCol } from "../../db/pg-quote.js";
import { interpolatePromptVars } from "../prompts/vars.js";
import { wrapAgentPrompt } from "../prompts/prompt-common.js";
import type { ConsultaTipo } from "../prompts/types.js";
import { ensureLanglabSchema } from "./ensureSchema.js";

const BASE_KEY = "LANGLAB_BASE";
export const CLASSIFIER_KEY = "CLASSIFIER_TIPO_CONSULTA";

type InstruccionLink = { IINSTRUCCION: string; IORDEN: number };

function parseCorpusJson(raw: unknown): string[] {
	if (!Array.isArray(raw)) return [];
	return raw.map((v) => String(v)).filter(Boolean);
}

function parseInstruccionesJson(raw: unknown): InstruccionLink[] {
	if (!Array.isArray(raw)) return [];
	return raw
		.map((v) => {
			if (!v || typeof v !== "object") return null;
			const row = v as Record<string, unknown>;
			const iinstruccion = String(row.IINSTRUCCION ?? row.iinstruccion ?? "").trim();
			const iorden = Number(row.IORDEN ?? row.iorden ?? 1);
			if (!iinstruccion) return null;
			return { IINSTRUCCION: iinstruccion, IORDEN: iorden };
		})
		.filter((v): v is InstruccionLink => v !== null);
}

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
		`INSERT INTO ${Q_CONVERSACION_TIPOCONSULTA} (${sqlCol("itipoconsulta")}, ${sqlCol("nconsulta")}, ${sqlCol("descripcion")})
     VALUES ($1, $2, $3)
     ON CONFLICT (${sqlCol("itipoconsulta")}) DO UPDATE SET
       ${sqlCol("nconsulta")} = EXCLUDED.${sqlCol("nconsulta")},
       ${sqlCol("descripcion")} = EXCLUDED.${sqlCol("descripcion")}`,
		[row.itdconsulta, row.nconsulta ?? row.itdconsulta, row.descripcion ?? ""],
	);
}

export async function linkTdInstruccion(itdconsulta: string, iinstruccion: string, orden = 1): Promise<void> {
	await ensureLanglabSchema();
	const row = await queryOne<{ instrucciones: unknown }>(
		`SELECT ${sqlCol("instrucciones")} AS instrucciones FROM ${Q_CONVERSACION_TIPOCONSULTA} WHERE ${sqlCol("itipoconsulta")} = $1`,
		[itdconsulta],
	);
	const links = parseInstruccionesJson(row?.instrucciones).filter((l) => l.IINSTRUCCION !== iinstruccion);
	links.push({ IINSTRUCCION: iinstruccion, IORDEN: orden });
	links.sort((a, b) => a.IORDEN - b.IORDEN);
	await query(
		`INSERT INTO ${Q_CONVERSACION_TIPOCONSULTA} (${sqlCol("itipoconsulta")}, ${sqlCol("nconsulta")}, ${sqlCol("instrucciones")})
     VALUES ($1, $1, $2::jsonb)
     ON CONFLICT (${sqlCol("itipoconsulta")}) DO UPDATE SET ${sqlCol("instrucciones")} = EXCLUDED.${sqlCol("instrucciones")}`,
		[itdconsulta, JSON.stringify(links)],
	);
}

export async function setTdCorpus(itdconsulta: string, corpusList: string[]): Promise<void> {
	await ensureLanglabSchema();
	await query(
		`INSERT INTO ${Q_CONVERSACION_TIPOCONSULTA} (${sqlCol("itipoconsulta")}, ${sqlCol("nconsulta")}, ${sqlCol("corpus")})
     VALUES ($1, $1, $2::jsonb)
     ON CONFLICT (${sqlCol("itipoconsulta")}) DO UPDATE SET ${sqlCol("corpus")} = EXCLUDED.${sqlCol("corpus")}`,
		[itdconsulta, JSON.stringify(corpusList)],
	);
}

export async function getClassifierPromptFromDb(): Promise<string | null> {
	await ensureLanglabSchema();
	const row = await queryOne<{ instruccion: string }>(
		`SELECT ${sqlCol("instruccion")} AS instruccion FROM ${Q_PATY_INSTRUCCION} WHERE ${sqlCol("iinstruccion")} = $1`,
		[CLASSIFIER_KEY],
	);
	const text = row?.instruccion?.trim();
	return text || null;
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

export async function listInstruccionesFromDb(): Promise<
	Array<{ iinstruccion: string; instruccion: string; descripcion: string | null }>
> {
	await ensureLanglabSchema();
	return query<{ iinstruccion: string; instruccion: string; descripcion: string | null }>(
		`SELECT ${sqlCol("iinstruccion")} AS iinstruccion, ${sqlCol("instruccion")} AS instruccion,
		        ${sqlCol("descripcion")} AS descripcion
		 FROM ${Q_PATY_INSTRUCCION}
		 ORDER BY ${sqlCol("iinstruccion")}`,
	);
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
	const row = await queryOne<{ corpus: unknown }>(
		`SELECT ${sqlCol("corpus")} AS corpus FROM ${Q_CONVERSACION_TIPOCONSULTA} WHERE ${sqlCol("itipoconsulta")} = $1`,
		[tipo],
	);
	return parseCorpusJson(row?.corpus);
}
