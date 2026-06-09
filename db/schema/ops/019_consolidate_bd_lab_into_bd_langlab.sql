-- Unifica BD_LAB → BD_LANGLAB (un solo esquema operacional LangLab).
-- Paty/ISA-DOC usa ENTITY_ROW y catálogo en el mismo esquema (proyecto isa-doc, rutas /api/patyia/…).

CREATE SCHEMA IF NOT EXISTS "BD_LANGLAB";

DO $$
DECLARE
	r RECORD;
BEGIN
	FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'BD_LAB' LOOP
		IF NOT EXISTS (
			SELECT 1 FROM pg_tables
			WHERE schemaname = 'BD_LANGLAB' AND tablename = r.tablename
		) THEN
			EXECUTE format('ALTER TABLE "BD_LAB".%I SET SCHEMA "BD_LANGLAB"', r.tablename);
		ELSE
			EXECUTE format('DROP TABLE "BD_LAB".%I', r.tablename);
		END IF;
	END LOOP;

	FOR r IN SELECT sequencename FROM pg_sequences WHERE schemaname = 'BD_LAB' LOOP
		IF NOT EXISTS (
			SELECT 1 FROM pg_sequences
			WHERE schemaname = 'BD_LANGLAB' AND sequencename = r.sequencename
		) THEN
			EXECUTE format('ALTER SEQUENCE "BD_LAB".%I SET SCHEMA "BD_LANGLAB"', r.sequencename);
		ELSE
			EXECUTE format('DROP SEQUENCE "BD_LAB".%I', r.sequencename);
		END IF;
	END LOOP;

	IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'BD_LAB') THEN
		DROP SCHEMA "BD_LAB" CASCADE;
	END IF;
END;
$$;

CREATE OR REPLACE FUNCTION "BD_LANGLAB"."ORCHESTRATOR_EXPIRESTALORCHESTRATORLEASES"()
RETURNS INT LANGUAGE plpgsql AS $$
DECLARE n INT;
BEGIN
	UPDATE "BD_LANGLAB"."ORCHESTRATOR_LEASE"
	SET "RELEASEDAT" = NOW(), "BOK" = FALSE,
		"LASTERROR" = COALESCE("LASTERROR", 'expired_stale_lease')
	WHERE "RELEASEDAT" IS NULL AND "EXPIRESAT" < NOW();
	GET DIAGNOSTICS n = ROW_COUNT;
	DELETE FROM "BD_LANGLAB"."CONVERSACION_TURNOLOCK" WHERE "LOCKEDUNTIL" < NOW();
	RETURN n;
END;
$$;
