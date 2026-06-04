DO $$
DECLARE
	r record;
BEGIN
	FOR r IN
		SELECT n.nspname AS schema_name, c.relname AS table_name, con.conname AS constraint_name
		FROM pg_constraint con
		JOIN pg_class c ON c.oid = con.conrelid
		JOIN pg_namespace n ON n.oid = c.relnamespace
		WHERE con.contype = 'f'
		  AND n.nspname IN (
				'paty', 'lab', 'clientesis', 'rag',
				'bd_paty', 'bd_lab', 'bd_clientesis', 'bd_rag'
			)
	LOOP
		EXECUTE format(
			'ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I',
			r.schema_name,
			r.table_name,
			r.constraint_name
		);
	END LOOP;
END $$;
