-- Renombra esquema legacy BD_PATY → BD_LANGLAB (separación LangLab vs PatyIA producción).
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'BD_PATY')
	   AND NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'BD_LANGLAB') THEN
		ALTER SCHEMA "BD_PATY" RENAME TO "BD_LANGLAB";
	END IF;
END $$;
