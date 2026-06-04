CREATE SCHEMA IF NOT EXISTS bd_lab;

CREATE SEQUENCE IF NOT EXISTS bd_lab.seq_lab_store_project AS bigint START 1;
CREATE SEQUENCE IF NOT EXISTS bd_lab.seq_lab_store_section AS bigint START 1;
CREATE SEQUENCE IF NOT EXISTS bd_lab.seq_lab_entity_definition AS bigint START 1;

CREATE TABLE IF NOT EXISTS bd_lab.lab_store_project (
	iid BIGINT PRIMARY KEY DEFAULT nextval('bd_lab.seq_lab_store_project'),
	slug TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	description TEXT,
	sortkey INT NOT NULL DEFAULT 0,
	meta JSONB NOT NULL DEFAULT '{}',
	fhcre TIMESTAMPTZ NOT NULL DEFAULT now(),
	fhultact TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bd_lab.lab_store_section (
	iid BIGINT PRIMARY KEY DEFAULT nextval('bd_lab.seq_lab_store_section'),
	projectslug TEXT NOT NULL,
	slug TEXT NOT NULL,
	name TEXT NOT NULL,
	description TEXT,
	sortkey INT NOT NULL DEFAULT 0,
	meta JSONB NOT NULL DEFAULT '{}',
	fhcre TIMESTAMPTZ NOT NULL DEFAULT now(),
	fhultact TIMESTAMPTZ NOT NULL DEFAULT now(),
	UNIQUE (projectslug, slug)
);

CREATE TABLE IF NOT EXISTS bd_lab.lab_entity_definition (
	iid BIGINT PRIMARY KEY DEFAULT nextval('bd_lab.seq_lab_entity_definition'),
	projectslug TEXT NOT NULL,
	sectionslug TEXT NOT NULL,
	entityslug TEXT NOT NULL,
	name TEXT NOT NULL,
	description TEXT,
	primarykeys JSONB NOT NULL,
	columns JSONB NOT NULL,
	details JSONB NOT NULL DEFAULT '[]',
	searchfields JSONB NOT NULL DEFAULT '[]',
	sortkey INT NOT NULL DEFAULT 0,
	meta JSONB NOT NULL DEFAULT '{}',
	fhcre TIMESTAMPTZ NOT NULL DEFAULT now(),
	fhultact TIMESTAMPTZ NOT NULL DEFAULT now(),
	UNIQUE (projectslug, sectionslug, entityslug)
);

CREATE INDEX IF NOT EXISTS ix_lab_entity_definition_segment ON bd_lab.lab_entity_definition (projectslug, sectionslug);
