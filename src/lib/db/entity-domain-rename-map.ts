/**
 * Renombres PATY_/LAB_/CIS_/RAG_ → prefijo de dominio de entidad.
 * Usado por scripts/migrate-entity-domain-prefix.mts
 */

export type TableRename = { schema: string; oldTable: string; newTable: string };

export const ENTITY_DOMAIN_TABLE_RENAMES: TableRename[] = [
	// BD_PATY — conversación
	{ schema: "BD_PATY", oldTable: "PATY_CONVERSACION", newTable: "CONVERSACION_CONVERSACION" },
	{ schema: "BD_PATY", oldTable: "PATY_CONVERSACIONTURNO", newTable: "CONVERSACION_CONVERSACIONTURNO" },
	{ schema: "BD_PATY", oldTable: "PATY_MENSAJECALIFICADO", newTable: "CONVERSACION_MENSAJECALIFICADO" },
	{ schema: "BD_PATY", oldTable: "PATY_CONVERSACIONTURNOLOCK", newTable: "CONVERSACION_CONVERSACIONTURNOLOCK" },
	{ schema: "BD_PATY", oldTable: "PATY_CONVERSACIONTURNOTIMING", newTable: "CONVERSACION_CONVERSACIONTURNOTIMING" },
	// BD_PATY — instrucción / tipo consulta
	{ schema: "BD_PATY", oldTable: "PATY_INSTRUCCION", newTable: "INSTRUCCION_INSTRUCCION" },
	{ schema: "BD_PATY", oldTable: "PATY_TDCONSULTA", newTable: "TDCONSULTA_TDCONSULTA" },
	{ schema: "BD_PATY", oldTable: "PATY_TDCONSULTAINSTRUCCION", newTable: "TDCONSULTA_TDCONSULTAINSTRUCCION" },
	{ schema: "BD_PATY", oldTable: "PATY_TDCONSULTACORPUS", newTable: "TDCONSULTA_TDCONSULTACORPUS" },
	// BD_LAB — entity store / catálogo / orquestador / auth
	{ schema: "BD_LAB", oldTable: "LAB_ENTITYROW", newTable: "ENTITY_ENTITYROW" },
	{ schema: "BD_LAB", oldTable: "LAB_STOREPROJECT", newTable: "STORE_STOREPROJECT" },
	{ schema: "BD_LAB", oldTable: "LAB_STORESECTION", newTable: "STORE_STORESECTION" },
	{ schema: "BD_LAB", oldTable: "LAB_ENTITYDEFINITION", newTable: "ENTITY_ENTITYDEFINITION" },
	{ schema: "BD_LAB", oldTable: "LAB_APICATALOGMANIFEST", newTable: "APICATALOG_APICATALOGMANIFEST" },
	{ schema: "BD_LAB", oldTable: "LAB_BITACORAREVISADO", newTable: "BITACORA_BITACORAREVISADO" },
	{ schema: "BD_LAB", oldTable: "LAB_APIKEYSLOT", newTable: "ORCHESTRATOR_APIKEYSLOT" },
	{ schema: "BD_LAB", oldTable: "LAB_ORCHESTRATORLEASE", newTable: "ORCHESTRATOR_ORCHESTRATORLEASE" },
	{ schema: "BD_LAB", oldTable: "LAB_CAPABILITYTIMING", newTable: "ORCHESTRATOR_CAPABILITYTIMING" },
	{ schema: "BD_LAB", oldTable: "LAB_ORCHESTRATORROTATIONLOG", newTable: "ORCHESTRATOR_ORCHESTRATORROTATIONLOG" },
	{ schema: "BD_LAB", oldTable: "LAB_AUTHUSER", newTable: "AUTH_AUTHUSER" },
	// BD_CLIENTESIS
	{ schema: "BD_CLIENTESIS", oldTable: "CIS_ENTITYROW", newTable: "ENTITY_ENTITYROW" },
	// BD_RAG
	{ schema: "BD_RAG", oldTable: "RAG_INDEXRUN", newTable: "INDEX_INDEXRUN" },
	{ schema: "BD_RAG", oldTable: "RAG_VECCONTAPYME", newTable: "VECTOR_VECCONTAPYME" },
	{ schema: "BD_RAG", oldTable: "RAG_VECFITDOCS", newTable: "VECTOR_VECFITDOCS" },
];

export const ENTITY_DOMAIN_SEQUENCE_RENAMES: Array<{ schema: string; oldSeq: string; newSeq: string }> = [
	{ schema: "BD_LAB", oldSeq: "SEQ_LAB_STOREPROJECT", newSeq: "SEQ_STORE_STOREPROJECT" },
	{ schema: "BD_LAB", oldSeq: "SEQ_LAB_STORESECTION", newSeq: "SEQ_STORE_STORESECTION" },
	{ schema: "BD_LAB", oldSeq: "SEQ_LAB_ENTITYDEFINITION", newSeq: "SEQ_ENTITY_ENTITYDEFINITION" },
];

/** Esquemas huérfanos a eliminar si quedan vacíos tras migraciones. */
export const LEGACY_SCHEMAS_TO_DROP = [
	"paty",
	"lab",
	"clientesis",
	"bd_paty",
	"bd_lab",
	"bd_clientesis",
	"bd_rag",
] as const;
