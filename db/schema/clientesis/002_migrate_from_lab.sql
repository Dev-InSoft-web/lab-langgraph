-- Migración legacy clientesis desde lab entity_row (solo si existen tablas antiguas).

DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.tables
		WHERE table_schema = 'bd_lab' AND table_name = 'lab_entity_row'
	) AND EXISTS (
		SELECT 1 FROM information_schema.tables
		WHERE table_schema = 'bd_clientesis' AND table_name = 'cis_entity_row'
	) THEN
		INSERT INTO bd_clientesis.cis_entity_row (
			project, page, entity, pk, body,
			parentproject, parentpage, parententity, parentpk,
			sortkey, tags, fhcre, fhultact
		)
		SELECT
			project, page, entity, pk, body,
			parentproject, parentpage, parententity, parentpk,
			sortkey, tags, fhcre, fhultact
		FROM bd_lab.lab_entity_row
		WHERE project = 'clientesis'
		ON CONFLICT (project, page, entity, pk) DO UPDATE SET
			body = EXCLUDED.body,
			fhultact = EXCLUDED.fhultact;

		DELETE FROM bd_lab.lab_entity_row WHERE project = 'clientesis';
	ELSIF EXISTS (
		SELECT 1 FROM information_schema.tables
		WHERE table_schema = 'BD_LANGLAB' AND table_name = 'ENTITY_ROW'
	) AND EXISTS (
		SELECT 1 FROM information_schema.tables
		WHERE table_schema = 'BD_CLIENTESIS' AND table_name = 'ENTITY_ROW'
	) THEN
		INSERT INTO "BD_CLIENTESIS"."ENTITY_ROW" (
			"PROJECT", "PAGE", "ENTITY", "IENTITYID", "BODY",
			"PARENTPROJECT", "PARENTPAGE", "PARENTENTITY", "IPARENTENTITYID",
			"SORTKEY", "TAGS", "FHCRE", "FHULTACT"
		)
		SELECT
			"PROJECT", "PAGE", "ENTITY", "IENTITYID", "BODY",
			"PARENTPROJECT", "PARENTPAGE", "PARENTENTITY", "IPARENTENTITYID",
			"SORTKEY", "TAGS", "FHCRE", "FHULTACT"
		FROM "BD_LANGLAB"."ENTITY_ROW"
		WHERE "PROJECT" = 'clientesis'
		ON CONFLICT ("PROJECT", "PAGE", "ENTITY", "IENTITYID") DO UPDATE SET
			"BODY" = EXCLUDED."BODY",
			"FHULTACT" = EXCLUDED."FHULTACT";

		DELETE FROM "BD_LANGLAB"."ENTITY_ROW" WHERE "PROJECT" = 'clientesis';
	END IF;
END;
$$;
