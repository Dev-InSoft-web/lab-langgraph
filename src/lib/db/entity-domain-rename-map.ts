/**
 * Renombres PATY_/LAB_/CIS_/RAG_ → nomenclatura simplificada (sin duplicar dominio).
 * Usado por scripts/migrate-entity-domain-prefix.mts
 */

export type TableRename = { schema: string; oldTable: string; newTable: string };

export const ENTITY_DOMAIN_TABLE_RENAMES: TableRename[] = [
	// BD_LANGLAB — conversación
	{ schema: "BD_LANGLAB", oldTable: "PATY_CONVERSACION", newTable: "CONVERSACION" },
	{ schema: "BD_LANGLAB", oldTable: "CONVERSACION_CONVERSACION", newTable: "CONVERSACION" },
	{ schema: "BD_LANGLAB", oldTable: "PATY_CONVERSACIONTURNO", newTable: "CONVERSACION_TURNO" },
	{ schema: "BD_LANGLAB", oldTable: "CONVERSACION_CONVERSACIONTURNO", newTable: "CONVERSACION_TURNO" },
	{ schema: "BD_LANGLAB", oldTable: "PATY_MENSAJECALIFICADO", newTable: "CONVERSACION_MENSAJE" },
	{ schema: "BD_LANGLAB", oldTable: "CONVERSACION_MENSAJECALIFICADO", newTable: "CONVERSACION_MENSAJE" },
	{ schema: "BD_LANGLAB", oldTable: "PATY_CONVERSACIONTURNOLOCK", newTable: "CONVERSACION_TURNOLOCK" },
	{ schema: "BD_LANGLAB", oldTable: "CONVERSACION_CONVERSACIONTURNOLOCK", newTable: "CONVERSACION_TURNOLOCK" },
	{ schema: "BD_LANGLAB", oldTable: "PATY_CONVERSACIONTURNOTIMING", newTable: "CONVERSACION_TURNOTIMING" },
	{ schema: "BD_LANGLAB", oldTable: "CONVERSACION_CONVERSACIONTURNOTIMING", newTable: "CONVERSACION_TURNOTIMING" },
	// BD_LANGLAB — instrucción / tipo consulta
	{ schema: "BD_LANGLAB", oldTable: "PATY_INSTRUCCION", newTable: "INSTRUCCION" },
	{ schema: "BD_LANGLAB", oldTable: "INSTRUCCION_INSTRUCCION", newTable: "INSTRUCCION" },
	{ schema: "BD_LANGLAB", oldTable: "PATY_TDCONSULTA", newTable: "TDCONSULTA" },
	{ schema: "BD_LANGLAB", oldTable: "TDCONSULTA_TDCONSULTA", newTable: "TDCONSULTA" },
	{ schema: "BD_LANGLAB", oldTable: "PATY_TDCONSULTAINSTRUCCION", newTable: "TDCONSULTA_INSTRUCCION" },
	{ schema: "BD_LANGLAB", oldTable: "TDCONSULTA_TDCONSULTAINSTRUCCION", newTable: "TDCONSULTA_INSTRUCCION" },
	{ schema: "BD_LANGLAB", oldTable: "PATY_TDCONSULTACORPUS", newTable: "TDCONSULTA_CORPUS" },
	{ schema: "BD_LANGLAB", oldTable: "TDCONSULTA_TDCONSULTACORPUS", newTable: "TDCONSULTA_CORPUS" },
	// BD_PATY (ISA-DOC store)
	{ schema: "BD_PATY", oldTable: "ENTITY_ENTITYROW", newTable: "ENTITY_ROW" },
	{ schema: "BD_PATY", oldTable: "STORE_STOREPROJECT", newTable: "STORE_PROJECT" },
	{ schema: "BD_PATY", oldTable: "STORE_STORESECTION", newTable: "STORE_SECTION" },
	{ schema: "BD_PATY", oldTable: "ENTITY_ENTITYDEFINITION", newTable: "ENTITY_DEFINITION" },
	{ schema: "BD_PATY", oldTable: "BITACORA_BITACORAREVISADO", newTable: "BITACORA_REVISADO" },
	{ schema: "BD_PATY", oldTable: "APICATALOG_APICATALOGMANIFEST", newTable: "APICATALOG_MANIFEST" },
	// BD_LAB (legacy → BD_PATY vía 020)
	{ schema: "BD_LAB", oldTable: "LAB_ENTITYROW", newTable: "ENTITY_ROW" },
	{ schema: "BD_LAB", oldTable: "ENTITY_ENTITYROW", newTable: "ENTITY_ROW" },
	{ schema: "BD_LAB", oldTable: "LAB_STOREPROJECT", newTable: "STORE_PROJECT" },
	{ schema: "BD_LAB", oldTable: "STORE_STOREPROJECT", newTable: "STORE_PROJECT" },
	{ schema: "BD_LAB", oldTable: "LAB_STORESECTION", newTable: "STORE_SECTION" },
	{ schema: "BD_LAB", oldTable: "STORE_STORESECTION", newTable: "STORE_SECTION" },
	{ schema: "BD_LAB", oldTable: "LAB_ENTITYDEFINITION", newTable: "ENTITY_DEFINITION" },
	{ schema: "BD_LAB", oldTable: "ENTITY_ENTITYDEFINITION", newTable: "ENTITY_DEFINITION" },
	{ schema: "BD_LAB", oldTable: "LAB_APICATALOGMANIFEST", newTable: "APICATALOG_MANIFEST" },
	{ schema: "BD_LAB", oldTable: "APICATALOG_APICATALOGMANIFEST", newTable: "APICATALOG_MANIFEST" },
	{ schema: "BD_LAB", oldTable: "LAB_BITACORAREVISADO", newTable: "BITACORA_REVISADO" },
	{ schema: "BD_LAB", oldTable: "BITACORA_BITACORAREVISADO", newTable: "BITACORA_REVISADO" },
	{ schema: "BD_LAB", oldTable: "LAB_APIKEYSLOT", newTable: "ORCHESTRATOR_SLOT" },
	{ schema: "BD_LAB", oldTable: "ORCHESTRATOR_APIKEYSLOT", newTable: "ORCHESTRATOR_SLOT" },
	{ schema: "BD_LAB", oldTable: "LAB_ORCHESTRATORLEASE", newTable: "ORCHESTRATOR_LEASE" },
	{ schema: "BD_LAB", oldTable: "ORCHESTRATOR_ORCHESTRATORLEASE", newTable: "ORCHESTRATOR_LEASE" },
	{ schema: "BD_LAB", oldTable: "LAB_CAPABILITYTIMING", newTable: "ORCHESTRATOR_CAPABILITY" },
	{ schema: "BD_LAB", oldTable: "ORCHESTRATOR_CAPABILITYTIMING", newTable: "ORCHESTRATOR_CAPABILITY" },
	{ schema: "BD_LAB", oldTable: "LAB_ORCHESTRATORROTATIONLOG", newTable: "ORCHESTRATOR_ROTATIONLOG" },
	{ schema: "BD_LAB", oldTable: "ORCHESTRATOR_ORCHESTRATORROTATIONLOG", newTable: "ORCHESTRATOR_ROTATIONLOG" },
	{ schema: "BD_LAB", oldTable: "LAB_AUTHUSER", newTable: "AUTH_USER" },
	{ schema: "BD_LAB", oldTable: "AUTH_AUTHUSER", newTable: "AUTH_USER" },
	// BD_CLIENTESIS
	{ schema: "BD_CLIENTESIS", oldTable: "CIS_ENTITYROW", newTable: "ENTITY_ROW" },
	{ schema: "BD_CLIENTESIS", oldTable: "ENTITY_ENTITYROW", newTable: "ENTITY_ROW" },
	// BD_RAG
	{ schema: "BD_RAG", oldTable: "RAG_INDEXRUN", newTable: "INDEX_RUN" },
	{ schema: "BD_RAG", oldTable: "INDEX_INDEXRUN", newTable: "INDEX_RUN" },
	{ schema: "BD_RAG", oldTable: "RAG_VECCONTAPYME", newTable: "VECTOR_CONTAPYME" },
	{ schema: "BD_RAG", oldTable: "VECTOR_VECCONTAPYME", newTable: "VECTOR_CONTAPYME" },
	{ schema: "BD_RAG", oldTable: "RAG_VECFITDOCS", newTable: "VECTOR_FITDOCS" },
	{ schema: "BD_RAG", oldTable: "VECTOR_VECFITDOCS", newTable: "VECTOR_FITDOCS" },
];

export const ENTITY_DOMAIN_SEQUENCE_RENAMES: Array<{ schema: string; oldSeq: string; newSeq: string }> = [
	{ schema: "BD_PATY", oldSeq: "SEQ_STORE_STOREPROJECT", newSeq: "SEQ_STORE_PROJECT" },
	{ schema: "BD_PATY", oldSeq: "SEQ_STORE_STORESECTION", newSeq: "SEQ_STORE_SECTION" },
	{ schema: "BD_PATY", oldSeq: "SEQ_ENTITY_ENTITYDEFINITION", newSeq: "SEQ_ENTITY_DEFINITION" },
	{ schema: "BD_LAB", oldSeq: "SEQ_LAB_STOREPROJECT", newSeq: "SEQ_STORE_PROJECT" },
	{ schema: "BD_LAB", oldSeq: "SEQ_STORE_STOREPROJECT", newSeq: "SEQ_STORE_PROJECT" },
	{ schema: "BD_LAB", oldSeq: "SEQ_LAB_STORESECTION", newSeq: "SEQ_STORE_SECTION" },
	{ schema: "BD_LAB", oldSeq: "SEQ_STORE_STORESECTION", newSeq: "SEQ_STORE_SECTION" },
	{ schema: "BD_LAB", oldSeq: "SEQ_LAB_ENTITYDEFINITION", newSeq: "SEQ_ENTITY_DEFINITION" },
	{ schema: "BD_LAB", oldSeq: "SEQ_ENTITY_ENTITYDEFINITION", newSeq: "SEQ_ENTITY_DEFINITION" },
];

/** Esquemas huérfanos a eliminar si quedan vacíos tras migraciones. */
export const LEGACY_SCHEMAS_TO_DROP = [
	"paty",
	"lab",
	"clientesis",
	"bd_lab",
	"bd_clientesis",
	"bd_rag",
] as const;
