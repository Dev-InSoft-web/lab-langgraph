CREATE TABLE IF NOT EXISTS bd_lab.lab_bitacora_revisado (
	revisadokey TEXT PRIMARY KEY,
	bchecked BOOLEAN NOT NULL DEFAULT false,
	fhultact TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_lab_bitacora_revisado_checked
	ON bd_lab.lab_bitacora_revisado (bchecked)
	WHERE bchecked = true;
