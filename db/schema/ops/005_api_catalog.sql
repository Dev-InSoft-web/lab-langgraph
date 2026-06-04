CREATE SCHEMA IF NOT EXISTS bd_lab;

CREATE TABLE IF NOT EXISTS bd_lab.lab_api_catalog_manifest (
	id TEXT PRIMARY KEY,
	version INT NOT NULL,
	generatedat TIMESTAMPTZ NOT NULL DEFAULT now(),
	source TEXT NOT NULL DEFAULT 'bundled',
	body JSONB NOT NULL
);

COMMENT ON TABLE bd_lab.lab_api_catalog_manifest IS
	'Manifiesto Postman PatyIA/ClientesIS. Fuente runtime si API_CATALOG_SOURCE=postgres.';
