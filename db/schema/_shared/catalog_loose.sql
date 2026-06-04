-- Catálogo (sin FK). `details` en JSON es solo representativo.
CREATE SCHEMA IF NOT EXISTS lab;

CREATE SEQUENCE IF NOT EXISTS lab.seq_store_project AS bigint START 1;
CREATE SEQUENCE IF NOT EXISTS lab.seq_store_section AS bigint START 1;
CREATE SEQUENCE IF NOT EXISTS lab.seq_entity_definition AS bigint START 1;

CREATE TABLE IF NOT EXISTS lab.store_project (
	id bigint PRIMARY KEY DEFAULT nextval('lab.seq_store_project'),
	slug text NOT NULL UNIQUE,
	name text NOT NULL,
	description text,
	sort_key int NOT NULL DEFAULT 0,
	meta jsonb NOT NULL DEFAULT '{}',
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab.store_section (
	id bigint PRIMARY KEY DEFAULT nextval('lab.seq_store_section'),
	project_slug text NOT NULL,
	slug text NOT NULL,
	name text NOT NULL,
	description text,
	sort_key int NOT NULL DEFAULT 0,
	meta jsonb NOT NULL DEFAULT '{}',
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now(),
	UNIQUE (project_slug, slug)
);

CREATE TABLE IF NOT EXISTS lab.entity_definition (
	id bigint PRIMARY KEY DEFAULT nextval('lab.seq_entity_definition'),
	project_slug text NOT NULL,
	section_slug text NOT NULL,
	entity_slug text NOT NULL,
	name text NOT NULL,
	description text,
	primary_keys jsonb NOT NULL,
	columns jsonb NOT NULL,
	details jsonb NOT NULL DEFAULT '[]',
	search_fields jsonb NOT NULL DEFAULT '[]',
	sort_key int NOT NULL DEFAULT 0,
	meta jsonb NOT NULL DEFAULT '{}',
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now(),
	UNIQUE (project_slug, section_slug, entity_slug)
);

CREATE INDEX IF NOT EXISTS idx_entity_definition_segment ON lab.entity_definition (project_slug, section_slug);
