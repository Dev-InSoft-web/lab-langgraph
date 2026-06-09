-- Elimina tablas huérfanas en BD_LANGLAB que no participan en el runtime LangLab.
-- Store ISA-DOC vive en BD_ISADOC (migración 021).

DO $$
DECLARE
	r RECORD;
	keep TEXT[] := ARRAY[
		'CONVERSACION', 'CONVERSACION_TURNO', 'CONVERSACION_MENSAJE', 'CONVERSACION_MENSAJE_METRICAS',
		'CONVERSACION_TURNOLOCK', 'CONVERSACION_TURNOTIMING',
		'INSTRUCCION', 'CONVERSACION_TIPOCONSULTA',
		'ORCHESTRATOR_SLOT', 'ORCHESTRATOR_LEASE', 'ORCHESTRATOR_CAPABILITY', 'ORCHESTRATOR_ROTATIONLOG',
		'AUTH_USER', 'AUTH_AUTHUSER'
	];
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'BD_LANGLAB') THEN
		RETURN;
	END IF;

	-- Renombrar auth legacy si aplica
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'AUTH_AUTHUSER')
	   AND NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'AUTH_USER') THEN
		ALTER TABLE "BD_LANGLAB"."AUTH_AUTHUSER" RENAME TO "AUTH_USER";
	END IF;

	-- Eliminar tabla auth duplicada tras renombre
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'AUTH_AUTHUSER')
	   AND EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'AUTH_USER') THEN
		DROP TABLE "BD_LANGLAB"."AUTH_AUTHUSER";
	END IF;

	-- Tabla de mensajes calificados absorbida por CONVERSACION_MENSAJE + METRICAS (022)
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'CONVERSACION_MENSAJECALIFICADO') THEN
		DROP TABLE "BD_LANGLAB"."CONVERSACION_MENSAJECALIFICADO";
	END IF;

	FOR r IN
		SELECT tablename FROM pg_tables WHERE schemaname = 'BD_LANGLAB'
	LOOP
		IF r.tablename = ANY(keep) THEN
			CONTINUE;
		END IF;
		EXECUTE format('DROP TABLE IF EXISTS "BD_LANGLAB".%I CASCADE', r.tablename);
	END LOOP;
END;
$$;

COMMENT ON SCHEMA "BD_LANGLAB" IS 'LangLab runtime: conversación, instrucción, orquestador, auth.';

-- BD_ISADOC: eliminar tablas legacy con nomenclatura antigua.
DO $$
DECLARE
	r RECORD;
	keep TEXT[] := ARRAY[
		'ENTITY_ROW', 'STORE_PROJECT', 'STORE_SECTION', 'ENTITY_DEFINITION',
		'BITACORA_REVISADO', 'APICATALOG_MANIFEST'
	];
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'BD_ISADOC') THEN
		RETURN;
	END IF;

	-- Migrar filas legacy ENTITY_ENTITYROW → ENTITY_ROW si aplica
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_ISADOC' AND tablename = 'ENTITY_ENTITYROW')
	   AND EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_ISADOC' AND tablename = 'ENTITY_ROW') THEN
		INSERT INTO "BD_ISADOC"."ENTITY_ROW" (
			"PROJECT", "PAGE", "ENTITY", "IENTITYID", "BODY",
			"PARENTPROJECT", "PARENTPAGE", "PARENTENTITY", "IPARENTENTITYID",
			"SORTKEY", "TAGS", "FHCRE", "FHULTACT"
		)
		SELECT
			e.project, e.page, e.entity, e.pk, e.body,
			e.parent_project, e.parent_page, e.parent_entity, e.parent_pk,
			COALESCE(e.sort_key, 0), COALESCE(e.tags, '{}'),
			COALESCE(e.created_at, now()), COALESCE(e.updated_at, now())
		FROM "BD_ISADOC"."ENTITY_ENTITYROW" e
		ON CONFLICT DO NOTHING;
		DROP TABLE "BD_ISADOC"."ENTITY_ENTITYROW";
	END IF;

	FOR r IN
		SELECT tablename FROM pg_tables WHERE schemaname = 'BD_ISADOC'
	LOOP
		IF r.tablename = ANY(keep) THEN
			CONTINUE;
		END IF;
		EXECUTE format('DROP TABLE IF EXISTS "BD_ISADOC".%I CASCADE', r.tablename);
	END LOOP;
END;
$$;
