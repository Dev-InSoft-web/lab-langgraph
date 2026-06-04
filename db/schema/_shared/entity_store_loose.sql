-- Entity row (sin FK). Esquema BD_LAB / BD_CLIENTESIS; columnas INSOFT (sin _ en nombres de columna).
CREATE SCHEMA IF NOT EXISTS bd_lab;

CREATE TABLE IF NOT EXISTS bd_lab.lab_entity_row (
	project TEXT NOT NULL,
	page TEXT NOT NULL,
	entity TEXT NOT NULL,
	pk TEXT NOT NULL,
	body JSONB NOT NULL DEFAULT '{}',
	parentproject TEXT,
	parentpage TEXT,
	parententity TEXT,
	parentpk TEXT,
	sortkey INT NOT NULL DEFAULT 0,
	tags TEXT[] NOT NULL DEFAULT '{}',
	fhcre TIMESTAMPTZ NOT NULL DEFAULT now(),
	fhultact TIMESTAMPTZ NOT NULL DEFAULT now(),
	PRIMARY KEY (project, page, entity, pk)
);

CREATE INDEX IF NOT EXISTS ix_lab_entity_row_segment ON bd_lab.lab_entity_row (project, page, entity);
CREATE INDEX IF NOT EXISTS ix_lab_entity_row_parent ON bd_lab.lab_entity_row (parentproject, parentpage, parententity, parentpk) WHERE parentpk IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_lab_entity_row_tags ON bd_lab.lab_entity_row USING gin (tags);
