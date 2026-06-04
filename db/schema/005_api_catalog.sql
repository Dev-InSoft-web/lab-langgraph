-- Catálogo API consolidado (Postman → JSON → opcional PG)
CREATE SCHEMA IF NOT EXISTS lab;

CREATE TABLE IF NOT EXISTS lab.api_catalog_manifest (
	id text PRIMARY KEY,
	version int NOT NULL,
	generated_at timestamptz NOT NULL DEFAULT now(),
	source text NOT NULL DEFAULT 'bundled',
	body jsonb NOT NULL
);

COMMENT ON TABLE lab.api_catalog_manifest IS
	'Manifiesto único: hosts, variables, entornos y endpoints PatyIA/ClientesIS. Fuente runtime si API_CATALOG_SOURCE=postgres.';
