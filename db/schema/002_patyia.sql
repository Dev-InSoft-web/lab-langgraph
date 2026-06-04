-- PatyIA operacional · lab-langgraph (solo PostgreSQL)
-- Prompts: paty.instruccion (+ sync desde ISA-DOC). RAG: paty.tdconsulta_corpus + pgvector.

CREATE SCHEMA IF NOT EXISTS paty;

CREATE TABLE IF NOT EXISTS paty.tdconsulta (
	itdconsulta TEXT PRIMARY KEY,
	nconsulta TEXT NOT NULL DEFAULT '',
	descripcion TEXT NOT NULL DEFAULT '',
	bactivo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS paty.instruccion (
	iinstruccion TEXT PRIMARY KEY,
	ninstruccion TEXT NOT NULL,
	modelo TEXT NOT NULL DEFAULT '',
	instruccion TEXT NOT NULL,
	descripcion TEXT NOT NULL DEFAULT '',
	version TEXT NOT NULL DEFAULT 'ultra',
	bactivo BOOLEAN NOT NULL DEFAULT TRUE,
	fhini TIMESTAMPTZ,
	fhfin TIMESTAMPTZ,
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS paty.tdconsulta_x_instruccion (
	itdconsulta TEXT NOT NULL,
	iinstruccion TEXT NOT NULL,
	orden INT NOT NULL DEFAULT 1,
	PRIMARY KEY (itdconsulta, iinstruccion)
);

CREATE TABLE IF NOT EXISTS paty.tdconsulta_corpus (
	itdconsulta TEXT NOT NULL,
	corpus TEXT NOT NULL,
	orden INT NOT NULL DEFAULT 1,
	PRIMARY KEY (itdconsulta, corpus)
);

CREATE TABLE IF NOT EXISTS paty.conversaciones (
	iconversacion BIGSERIAL PRIMARY KEY,
	itercero TEXT NOT NULL DEFAULT 'lab',
	icontacto TEXT NOT NULL DEFAULT 'lab',
	nombre_usuario TEXT NOT NULL DEFAULT 'Usuario',
	titulo TEXT NOT NULL DEFAULT '',
	hilo TEXT NOT NULL DEFAULT '',
	modelo_ia TEXT NOT NULL DEFAULT '',
	version_ayuda TEXT NOT NULL DEFAULT 'lab-langgraph',
	itdestado SMALLINT NOT NULL DEFAULT 0,
	bautoriza_visualizacion BOOLEAN NOT NULL DEFAULT FALSE,
	imodulo TEXT NOT NULL DEFAULT '',
	prompt TEXT NOT NULL DEFAULT '',
	respuesta TEXT NOT NULL DEFAULT '',
	qtokens BIGINT NOT NULL DEFAULT 0,
	qmensajes INT NOT NULL DEFAULT 0,
	fhcre TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	fhultact TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS paty.conversacion_turnos (
	id BIGSERIAL PRIMARY KEY,
	iconversacion BIGINT NOT NULL,
	ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	prompt_text TEXT NOT NULL,
	response_text TEXT NOT NULL,
	prompt_tipo TEXT,
	corpus TEXT[],
	jailbreak BOOLEAN NOT NULL DEFAULT FALSE,
	latency_ms INT,
	meta JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS ix_conv_turnos_iconversacion
	ON paty.conversacion_turnos (iconversacion, ts);

CREATE TABLE IF NOT EXISTS paty.mensajes_calificados (
	imensaje BIGSERIAL PRIMARY KEY,
	iconversacion BIGINT NOT NULL,
	ireferencia BIGINT,
	butil BOOLEAN,
	contenido TEXT NOT NULL DEFAULT '',
	calificacion INT,
	comentario TEXT,
	fhcre TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_mensajes_iconversacion ON paty.mensajes_calificados (iconversacion);

-- Turnos de conversación (histórico de chat por iconversacion).
