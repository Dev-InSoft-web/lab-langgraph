-- Elimina esquemas legacy duplicados (minúsculas / bd_*).
-- Canónicos: BD_ISADOC (entity store), BD_LANGLAB (runtime LangLab). BD_PATY → 021.
-- RAG: instancia separada (RAG_DATABASE_URL).

DO $$
DECLARE s TEXT;
	legacy TEXT[] := ARRAY[
		'bd_langlab', 'bd_paty', 'paty',
		'bd_lab', 'lab',
		'bd_clientesis', 'clientesis',
		'bd_rag', 'BD_RAG'
	];
BEGIN
	FOREACH s IN ARRAY legacy LOOP
		IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = s) THEN
			EXECUTE format('DROP SCHEMA %I CASCADE', s);
		END IF;
	END LOOP;
END;
$$;

-- Quitar tablas con nomenclatura intermedia dentro de BD_LANGLAB (si quedaron duplicadas).
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'INSTRUCCION')
	   AND EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'INSTRUCCION_INSTRUCCION') THEN
		DROP TABLE "BD_LANGLAB"."INSTRUCCION_INSTRUCCION";
	END IF;
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'CONVERSACION')
	   AND EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'CONVERSACION_CONVERSACION') THEN
		DROP TABLE "BD_LANGLAB"."CONVERSACION_CONVERSACION";
	END IF;
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'CONVERSACION_TURNO')
	   AND EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'CONVERSACION_CONVERSACIONTURNO') THEN
		DROP TABLE "BD_LANGLAB"."CONVERSACION_CONVERSACIONTURNO";
	END IF;
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'ENTITY_ROW')
	   AND EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'ENTITY_ENTITYROW') THEN
		DROP TABLE "BD_LANGLAB"."ENTITY_ENTITYROW";
	END IF;
END;
$$;

-- Tablas huérfanas en inglés/snake (sustituidas por CONVERSACION_TURNO, CONVERSACION_TURNOLOCK, …).
DROP TABLE IF EXISTS "BD_LANGLAB"."conversacion_turn_lock";
DROP TABLE IF EXISTS "BD_LANGLAB"."conversacion_turn_timing";
DROP TABLE IF EXISTS "BD_LANGLAB"."conversacion_turnos";
DROP TABLE IF EXISTS "BD_LANGLAB"."paty_conversacion";
DROP TABLE IF EXISTS "BD_LANGLAB"."paty_conversacion_turno";
DROP TABLE IF EXISTS "BD_LANGLAB"."paty_conversacion_turno_lock";
DROP TABLE IF EXISTS "BD_LANGLAB"."paty_conversacion_turno_timing";
DROP TABLE IF EXISTS "BD_LANGLAB"."paty_instruccion";
DROP TABLE IF EXISTS "BD_LANGLAB"."paty_mensaje_calificado";
DROP TABLE IF EXISTS "BD_LANGLAB"."paty_tdconsulta";
DROP TABLE IF EXISTS "BD_LANGLAB"."paty_tdconsulta_corpus";
DROP TABLE IF EXISTS "BD_LANGLAB"."paty_tdconsulta_instruccion";

-- Duplicados snake_case / minúsculas cuando ya existe la tabla canónica UPPERCASE.
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'CONVERSACION') THEN
		DROP TABLE IF EXISTS "BD_LANGLAB"."conversaciones";
	END IF;
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'INSTRUCCION') THEN
		DROP TABLE IF EXISTS "BD_LANGLAB"."instruccion";
	END IF;
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'TDCONSULTA') THEN
		DROP TABLE IF EXISTS "BD_LANGLAB"."tdconsulta";
	END IF;
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'TDCONSULTA_CORPUS') THEN
		DROP TABLE IF EXISTS "BD_LANGLAB"."tdconsulta_corpus";
	END IF;
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'TDCONSULTA_INSTRUCCION') THEN
		DROP TABLE IF EXISTS "BD_LANGLAB"."tdconsulta_instruccion";
	END IF;
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename IN ('CONVERSACION_MENSAJE', 'CONVERSACION_MENSAJECALIFICADO')) THEN
		DROP TABLE IF EXISTS "BD_LANGLAB"."mensaje_calificado";
		DROP TABLE IF EXISTS "BD_LANGLAB"."mensajes_calificados";
	END IF;
	-- Tablas legacy de orquestador (nombre antiguo lab_*).
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'ORCHESTRATOR_SLOT') THEN
		DROP TABLE IF EXISTS "BD_LANGLAB"."lab_api_key_slot";
	END IF;
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'ORCHESTRATOR_LEASE') THEN
		DROP TABLE IF EXISTS "BD_LANGLAB"."lab_orchestrator_lease";
	END IF;
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'ORCHESTRATOR_CAPABILITY') THEN
		DROP TABLE IF EXISTS "BD_LANGLAB"."lab_capability_timing";
	END IF;
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'ORCHESTRATOR_ROTATIONLOG') THEN
		DROP TABLE IF EXISTS "BD_LANGLAB"."lab_orchestrator_rotation_log";
	END IF;
	IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = 'TDCONSULTA_INSTRUCCION') THEN
		DROP TABLE IF EXISTS "BD_LANGLAB"."tdconsulta_x_instruccion";
	END IF;
END;
$$;

-- Columnas → MAYÚSCULAS sin _ en tablas canónicas restantes.
DO $$
DECLARE
	r RECORD;
	new_name TEXT;
	tables TEXT[] := ARRAY[
		'CONVERSACION', 'CONVERSACION_TURNO', 'CONVERSACION_MENSAJE', 'CONVERSACION_MENSAJE_METRICAS',
		'CONVERSACION_TURNOLOCK', 'CONVERSACION_TURNOTIMING',
		'INSTRUCCION', 'CONVERSACION_TIPOCONSULTA'
	];
	t TEXT;
BEGIN
	FOREACH t IN ARRAY tables LOOP
		IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = t) THEN
			CONTINUE;
		END IF;
		FOR r IN
			SELECT column_name FROM information_schema.columns
			WHERE table_schema = 'BD_LANGLAB' AND table_name = t
		LOOP
			new_name := upper(replace(r.column_name, '_', ''));
			IF r.column_name IS DISTINCT FROM new_name THEN
				EXECUTE format(
					'ALTER TABLE "BD_LANGLAB".%I RENAME COLUMN %I TO %I',
					t, r.column_name, new_name
				);
			END IF;
		END LOOP;
	END LOOP;
	FOREACH t IN ARRAY ARRAY[
		'ENTITY_ROW', 'STORE_PROJECT', 'STORE_SECTION', 'ENTITY_DEFINITION',
		'APICATALOG_MANIFEST', 'BITACORA_REVISADO', 'ORCHESTRATOR_SLOT',
		'ORCHESTRATOR_LEASE', 'ORCHESTRATOR_CAPABILITY', 'ORCHESTRATOR_ROTATIONLOG', 'AUTH_USER'
	] LOOP
		IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'BD_LANGLAB' AND tablename = t) THEN
			CONTINUE;
		END IF;
		FOR r IN
			SELECT column_name FROM information_schema.columns
			WHERE table_schema = 'BD_LANGLAB' AND table_name = t
		LOOP
			new_name := upper(replace(r.column_name, '_', ''));
			IF r.column_name IS DISTINCT FROM new_name THEN
				EXECUTE format(
					'ALTER TABLE "BD_LANGLAB".%I RENAME COLUMN %I TO %I',
					t, r.column_name, new_name
				);
			END IF;
		END LOOP;
	END LOOP;
END;
$$;

-- Esquema BD_LAB ya no se usa (consolidado en BD_LANGLAB vía 019).
DROP SCHEMA IF EXISTS "BD_LAB" CASCADE;
