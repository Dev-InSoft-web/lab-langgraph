-- Conversación PatyIA (lab): control de turnos, tiempos y auditoría del orquestador de API keys.

-- Turnos: índice monótono, lease y proveedor usados en el turno.
ALTER TABLE paty.conversacion_turnos
	ADD COLUMN IF NOT EXISTS turn_index INT,
	ADD COLUMN IF NOT EXISTS lease_id UUID,
	ADD COLUMN IF NOT EXISTS provider TEXT,
	ADD COLUMN IF NOT EXISTS key_label TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS ux_conv_turn_index
	ON paty.conversacion_turnos (iconversacion, turn_index)
	WHERE turn_index IS NOT NULL;

-- Bloqueo por conversación (un turno a la vez; evita carreras en SSE).
CREATE TABLE IF NOT EXISTS paty.conversacion_turn_lock (
	iconversacion BIGINT PRIMARY KEY,
	locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	locked_until TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '4 minutes'),
	holder TEXT NOT NULL DEFAULT 'lab-langgraph',
	meta JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS ix_conv_turn_lock_until
	ON paty.conversacion_turn_lock (locked_until);

-- Política de tiempos por capacidad (gaps entre turnos, TTL lease).
CREATE TABLE IF NOT EXISTS paty.lab_capability_timing (
	capability TEXT PRIMARY KEY,
	min_turn_gap_ms INT NOT NULL DEFAULT 0,
	max_lease_minutes INT NOT NULL DEFAULT 45,
	max_concurrent_leases INT NOT NULL DEFAULT 12,
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO paty.lab_capability_timing (capability, min_turn_gap_ms, max_lease_minutes, max_concurrent_leases)
VALUES
	('chat', 300, 45, 12),
	('proofread', 0, 45, 8),
	('whisper', 15000, 45, 4),
	('embeddings', 0, 30, 6),
	('rerank', 0, 30, 6)
ON CONFLICT (capability) DO UPDATE SET
	min_turn_gap_ms = EXCLUDED.min_turn_gap_ms,
	max_lease_minutes = EXCLUDED.max_lease_minutes,
	max_concurrent_leases = EXCLUDED.max_concurrent_leases,
	updated_at = NOW();

-- Auditoría de permutación / rotación de keys (orquestador).
CREATE TABLE IF NOT EXISTS paty.lab_orchestrator_rotation_log (
	id BIGSERIAL PRIMARY KEY,
	ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	capability TEXT NOT NULL,
	provider TEXT NOT NULL,
	key_label TEXT NOT NULL,
	lease_id UUID,
	iconversacion BIGINT,
	turn_index INT,
	event TEXT NOT NULL,
	wait_ms INT,
	meta JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS ix_rotation_log_ts
	ON paty.lab_orchestrator_rotation_log (ts DESC);

CREATE INDEX IF NOT EXISTS ix_rotation_log_conv
	ON paty.lab_orchestrator_rotation_log (iconversacion)
	WHERE iconversacion IS NOT NULL;

-- Último turno por conversación (gap mínimo entre prompts).
CREATE TABLE IF NOT EXISTS paty.conversacion_turn_timing (
	iconversacion BIGINT PRIMARY KEY,
	last_turn_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	last_capability TEXT NOT NULL DEFAULT 'chat',
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION paty.next_conversacion_turn_index(p_iconversacion BIGINT)
RETURNS INT
LANGUAGE sql
STABLE
AS $$
	SELECT COALESCE(MAX(turn_index), 0) + 1
	FROM paty.conversacion_turnos
	WHERE iconversacion = p_iconversacion;
$$;

CREATE OR REPLACE FUNCTION paty.expire_stale_orchestrator_leases()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
	n INT;
BEGIN
	UPDATE paty.lab_orchestrator_lease
	SET
		released_at = NOW(),
		ok = FALSE,
		last_error = COALESCE(last_error, 'expired_stale_lease')
	WHERE released_at IS NULL AND expires_at < NOW();

	GET DIAGNOSTICS n = ROW_COUNT;

	DELETE FROM paty.conversacion_turn_lock
	WHERE locked_until < NOW();

	RETURN n;
END;
$$;
