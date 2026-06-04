-- PatyIA operacional · esquema BD_PATY (nomenclatura INSOFT, columnas sin _)

CREATE SCHEMA IF NOT EXISTS bd_paty;

CREATE TABLE IF NOT EXISTS bd_paty.paty_tdconsulta (
	itdconsulta TEXT PRIMARY KEY,
	nconsulta TEXT NOT NULL DEFAULT '',
	descripcion TEXT NOT NULL DEFAULT '',
	bactivo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS bd_paty.paty_instruccion (
	iinstruccion TEXT PRIMARY KEY,
	ninstruccion TEXT NOT NULL,
	modelo TEXT NOT NULL DEFAULT '',
	instruccion TEXT NOT NULL,
	descripcion TEXT NOT NULL DEFAULT '',
	version TEXT NOT NULL DEFAULT 'ultra',
	bactivo BOOLEAN NOT NULL DEFAULT TRUE,
	fhini TIMESTAMPTZ,
	fhfin TIMESTAMPTZ,
	fhultact TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bd_paty.paty_tdconsulta_instruccion (
	itdconsulta TEXT NOT NULL,
	iinstruccion TEXT NOT NULL,
	iorden INT NOT NULL DEFAULT 1,
	PRIMARY KEY (itdconsulta, iinstruccion)
);

CREATE TABLE IF NOT EXISTS bd_paty.paty_tdconsulta_corpus (
	itdconsulta TEXT NOT NULL,
	corpus TEXT NOT NULL,
	iorden INT NOT NULL DEFAULT 1,
	PRIMARY KEY (itdconsulta, corpus)
);

CREATE TABLE IF NOT EXISTS bd_paty.paty_conversacion (
	iconversacion BIGSERIAL PRIMARY KEY,
	itercero TEXT NOT NULL DEFAULT 'lab',
	icontacto TEXT NOT NULL DEFAULT 'lab',
	nombreusuario TEXT NOT NULL DEFAULT 'Usuario',
	titulo TEXT NOT NULL DEFAULT '',
	hilo TEXT NOT NULL DEFAULT '',
	modeloia TEXT NOT NULL DEFAULT '',
	versionayuda TEXT NOT NULL DEFAULT 'lab-langgraph',
	itdestado SMALLINT NOT NULL DEFAULT 0,
	bautorizavisualizacion BOOLEAN NOT NULL DEFAULT FALSE,
	imodulo TEXT NOT NULL DEFAULT '',
	prompt TEXT NOT NULL DEFAULT '',
	respuesta TEXT NOT NULL DEFAULT '',
	qtokens BIGINT NOT NULL DEFAULT 0,
	qmensajes INT NOT NULL DEFAULT 0,
	fhcre TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	fhultact TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bd_paty.paty_conversacion_turno (
	iturno BIGSERIAL PRIMARY KEY,
	iconversacion BIGINT NOT NULL,
	ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	prompttext TEXT NOT NULL,
	responsetext TEXT NOT NULL,
	prompttipo TEXT,
	corpus TEXT[],
	bjailbreak BOOLEAN NOT NULL DEFAULT FALSE,
	latencyms INT,
	meta JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS ix_paty_conv_turno_iconversacion
	ON bd_paty.paty_conversacion_turno (iconversacion, ts);

CREATE TABLE IF NOT EXISTS bd_paty.paty_mensaje_calificado (
	imensaje BIGSERIAL PRIMARY KEY,
	iconversacion BIGINT NOT NULL,
	ireferencia BIGINT,
	butil BOOLEAN,
	contenido TEXT NOT NULL DEFAULT '',
	calificacion INT,
	comentario TEXT,
	fhcre TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_paty_mensaje_iconversacion ON bd_paty.paty_mensaje_calificado (iconversacion);
