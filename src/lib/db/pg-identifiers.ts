/**
 * Nomenclatura PostgreSQL alineada a INSOFT / ispgen.
 *
 * - Esquemas con prefijo BD_: `bd_paty`, `bd_lab`, `bd_clientesis`, `bd_rag`
 * - Tablas: DOMINIO_NOMBRE (minúsculas en PG sin comillas)
 * - Columnas: sin `_` (ej. parentproject, fhultact); ids con prefijo I
 */

/** Esquema (= dominio lógico de BD en la misma instancia Render). */
export const PG_SCHEMA_PATY = "bd_paty";
export const PG_SCHEMA_LAB = "bd_lab";
export const PG_SCHEMA_CLIENTESIS = "bd_clientesis";
export const PG_SCHEMA_RAG = "bd_rag";

/** @deprecated Usar PG_SCHEMA_* */
export const PG_SCHEMA_OPS = PG_SCHEMA_PATY;

export function qualified(schema: string, table: string): string {
	return `${schema}.${table}`;
}

// --- PatyIA (bd_paty) ---
export const T_PATY_TDCONSULTA = "paty_tdconsulta";
export const T_PATY_INSTRUCCION = "paty_instruccion";
export const T_PATY_TDCONSULTA_INSTRUCCION = "paty_tdconsulta_instruccion";
export const T_PATY_TDCONSULTA_CORPUS = "paty_tdconsulta_corpus";
export const T_PATY_CONVERSACION = "paty_conversacion";
export const T_PATY_CONVERSACION_TURNO = "paty_conversacion_turno";
export const T_PATY_MENSAJE_CALIFICADO = "paty_mensaje_calificado";
export const T_PATY_CONVERSACION_TURNO_LOCK = "paty_conversacion_turno_lock";
export const T_PATY_CONVERSACION_TURNO_TIMING = "paty_conversacion_turno_timing";

export const Q_PATY_INSTRUCCION = qualified(PG_SCHEMA_PATY, T_PATY_INSTRUCCION);
export const Q_PATY_TDCONSULTA = qualified(PG_SCHEMA_PATY, T_PATY_TDCONSULTA);
export const Q_PATY_TDCONSULTA_INSTRUCCION = qualified(PG_SCHEMA_PATY, T_PATY_TDCONSULTA_INSTRUCCION);
export const Q_PATY_TDCONSULTA_CORPUS = qualified(PG_SCHEMA_PATY, T_PATY_TDCONSULTA_CORPUS);
export const Q_PATY_CONVERSACION = qualified(PG_SCHEMA_PATY, T_PATY_CONVERSACION);
export const Q_PATY_CONVERSACION_TURNO = qualified(PG_SCHEMA_PATY, T_PATY_CONVERSACION_TURNO);
export const Q_PATY_MENSAJE_CALIFICADO = qualified(PG_SCHEMA_PATY, T_PATY_MENSAJE_CALIFICADO);
export const Q_PATY_CONVERSACION_TURNO_LOCK = qualified(PG_SCHEMA_PATY, T_PATY_CONVERSACION_TURNO_LOCK);
export const Q_PATY_CONVERSACION_TURNO_TIMING = qualified(PG_SCHEMA_PATY, T_PATY_CONVERSACION_TURNO_TIMING);

// --- Lab / catálogo / entity store (bd_lab) ---
export const T_LAB_ENTITY_ROW = "lab_entity_row";
export const T_LAB_STORE_PROJECT = "lab_store_project";
export const T_LAB_STORE_SECTION = "lab_store_section";
export const T_LAB_ENTITY_DEFINITION = "lab_entity_definition";
export const T_LAB_API_CATALOG_MANIFEST = "lab_api_catalog_manifest";
export const T_LAB_BITACORA_REVISADO = "lab_bitacora_revisado";
export const T_LAB_API_KEY_SLOT = "lab_api_key_slot";
export const T_LAB_ORCHESTRATOR_LEASE = "lab_orchestrator_lease";
export const T_LAB_CAPABILITY_TIMING = "lab_capability_timing";
export const T_LAB_ORCHESTRATOR_ROTATION_LOG = "lab_orchestrator_rotation_log";

export const SEQ_LAB_STORE_PROJECT = "seq_lab_store_project";
export const SEQ_LAB_STORE_SECTION = "seq_lab_store_section";
export const SEQ_LAB_ENTITY_DEFINITION = "seq_lab_entity_definition";

export const Q_LAB_ENTITY_ROW = qualified(PG_SCHEMA_LAB, T_LAB_ENTITY_ROW);
export const Q_LAB_STORE_PROJECT = qualified(PG_SCHEMA_LAB, T_LAB_STORE_PROJECT);
export const Q_LAB_STORE_SECTION = qualified(PG_SCHEMA_LAB, T_LAB_STORE_SECTION);
export const Q_LAB_ENTITY_DEFINITION = qualified(PG_SCHEMA_LAB, T_LAB_ENTITY_DEFINITION);
export const Q_LAB_API_CATALOG_MANIFEST = qualified(PG_SCHEMA_LAB, T_LAB_API_CATALOG_MANIFEST);
export const Q_LAB_BITACORA_REVISADO = qualified(PG_SCHEMA_LAB, T_LAB_BITACORA_REVISADO);
export const Q_LAB_API_KEY_SLOT = qualified(PG_SCHEMA_LAB, T_LAB_API_KEY_SLOT);
export const Q_LAB_ORCHESTRATOR_LEASE = qualified(PG_SCHEMA_LAB, T_LAB_ORCHESTRATOR_LEASE);
export const Q_LAB_CAPABILITY_TIMING = qualified(PG_SCHEMA_LAB, T_LAB_CAPABILITY_TIMING);
export const Q_LAB_ORCHESTRATOR_ROTATION_LOG = qualified(PG_SCHEMA_LAB, T_LAB_ORCHESTRATOR_ROTATION_LOG);

// --- ClientesIS store (bd_clientesis) ---
export const T_CIS_ENTITY_ROW = "cis_entity_row";
export const Q_CIS_ENTITY_ROW = qualified(PG_SCHEMA_CLIENTESIS, T_CIS_ENTITY_ROW);

// --- RAG (bd_rag) ---
export const T_RAG_INDEX_RUN = "rag_index_run";
export const T_RAG_VEC_CONTAPYME = "rag_vec_contapyme";
export const T_RAG_VEC_FITDOCS = "rag_vec_fitdocs";

export const Q_RAG_INDEX_RUN = qualified(PG_SCHEMA_RAG, T_RAG_INDEX_RUN);
export const Q_RAG_VEC_CONTAPYME = qualified(PG_SCHEMA_RAG, T_RAG_VEC_CONTAPYME);
export const Q_RAG_VEC_FITDOCS = qualified(PG_SCHEMA_RAG, T_RAG_VEC_FITDOCS);

/** Columnas lab_entity_row / cis_entity_row (sin guiones bajos). */
export const COL_ER = {
	PROJECT: "project",
	PAGE: "page",
	ENTITY: "entity",
	PK: "pk",
	BODY: "body",
	PARENTPROJECT: "parentproject",
	PARENTPAGE: "parentpage",
	PARENTENTITY: "parententity",
	PARENTPK: "parentpk",
	SORTKEY: "sortkey",
	TAGS: "tags",
	FHCRE: "fhcre",
	FHULTACT: "fhultact",
} as const;

/** Columnas lab_bitacora_revisado */
export const COL_REV = {
	KEY: "revisadokey",
	BCHECKED: "bchecked",
	FHULTACT: "fhultact",
} as const;
