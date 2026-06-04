-- Turnos, locks y auditoría orquestador (BD_PATY + BD_LAB)

ALTER TABLE bd_paty.paty_conversacion_turno
	ADD COLUMN IF NOT EXISTS iturnindex INT,
	ADD COLUMN IF NOT EXISTS ilease UUID,
	ADD COLUMN IF NOT EXISTS provider TEXT,
	ADD COLUMN IF NOT EXISTS keylabel TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS ux_paty_conv_turn_index
	ON bd_paty.paty_conversacion_turno (iconversacion, iturnindex)
	WHERE iturnindex IS NOT NULL;

CREATE TABLE IF NOT EXISTS bd_paty.paty_conversacion_turno_lock (
	iconversacion BIGINT PRIMARY KEY,
	lockedat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	lockeduntil TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '4 minutes'),
	holder TEXT NOT NULL DEFAULT 'lab-langgraph',
	meta JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS ix_paty_conv_turn_lock_until
	ON bd_paty.paty_conversacion_turno_lock (lockeduntil);

CREATE TABLE IF NOT EXISTS bd_lab.lab_capability_timing (
	capability TEXT PRIMARY KEY,
	minturngapms INT NOT NULL DEFAULT 0,
	maxleaseminutes INT NOT NULL DEFAULT 45,
	maxconcurrentleases INT NOT NULL DEFAULT 12,
	fhultact TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO bd_lab.lab_capability_timing (capability, minturngapms, maxleaseminutes, maxconcurrentleases)
VALUES
	('chat', 300, 45, 12),
	('proofread', 0, 45, 8),
	('whisper', 15000, 45, 4),
	('embeddings', 0, 30, 6),
	('rerank', 0, 30, 6)
ON CONFLICT (capability) DO UPDATE SET
	minturngapms = EXCLUDED.minturngapms,
	maxleaseminutes = EXCLUDED.maxleaseminutes,
	maxconcurrentleases = EXCLUDED.maxconcurrentleases,
	fhultact = NOW();

CREATE TABLE IF NOT EXISTS bd_lab.lab_orchestrator_rotation_log (
	ilog BIGSERIAL PRIMARY KEY,
	ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	capability TEXT NOT NULL,
	provider TEXT NOT NULL,
	keylabel TEXT NOT NULL,
	ilease UUID,
	iconversacion BIGINT,
	iturnindex INT,
	event TEXT NOT NULL,
	waitms INT,
	meta JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS ix_rotation_log_ts
	ON bd_lab.lab_orchestrator_rotation_log (ts DESC);

CREATE INDEX IF NOT EXISTS ix_rotation_log_conv
	ON bd_lab.lab_orchestrator_rotation_log (iconversacion)
	WHERE iconversacion IS NOT NULL;

CREATE TABLE IF NOT EXISTS bd_paty.paty_conversacion_turno_timing (
	iconversacion BIGINT PRIMARY KEY,
	lastturnat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	lastcapability TEXT NOT NULL DEFAULT 'chat',
	fhultact TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION bd_paty.paty_next_turn_index(p_iconversacion BIGINT)
RETURNS INT
LANGUAGE sql
STABLE
AS $$
	SELECT COALESCE(MAX(iturnindex), 0) + 1
	FROM bd_paty.paty_conversacion_turno
	WHERE iconversacion = p_iconversacion;
$$;

CREATE OR REPLACE FUNCTION bd_paty.paty_expire_stale_orchestrator_leases()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
	n INT;
BEGIN
	UPDATE bd_lab.lab_orchestrator_lease
	SET
		releasedat = NOW(),
		bok = FALSE,
		lasterror = COALESCE(lasterror, 'expired_stale_lease')
	WHERE releasedat IS NULL AND expiresat < NOW();

	GET DIAGNOSTICS n = ROW_COUNT;

	DELETE FROM bd_paty.paty_conversacion_turno_lock
	WHERE lockeduntil < NOW();

	RETURN n;
END;
$$;
