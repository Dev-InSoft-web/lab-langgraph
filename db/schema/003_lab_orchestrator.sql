-- Orquestador lab: slots de API key por proveedor/capacidad (apps volátiles → estado en PG).

CREATE TABLE IF NOT EXISTS paty.lab_api_key_slot (
	provider TEXT NOT NULL,
	capability TEXT NOT NULL,
	key_label TEXT NOT NULL,
	sort_order INT NOT NULL DEFAULT 0,
	enabled BOOLEAN NOT NULL DEFAULT TRUE,
	cooldown_until TIMESTAMPTZ,
	last_used_at TIMESTAMPTZ,
	last_http_status INT,
	last_error TEXT,
	wait_ms_hint INT,
	consecutive_failures INT NOT NULL DEFAULT 0,
	meta JSONB NOT NULL DEFAULT '{}',
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	PRIMARY KEY (provider, capability, key_label)
);

CREATE INDEX IF NOT EXISTS ix_lab_slot_pick
	ON paty.lab_api_key_slot (capability, provider, enabled, cooldown_until, sort_order);

CREATE TABLE IF NOT EXISTS paty.lab_orchestrator_lease (
	lease_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	provider TEXT NOT NULL,
	capability TEXT NOT NULL,
	key_label TEXT NOT NULL,
	acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '45 minutes'),
	released_at TIMESTAMPTZ,
	ok BOOLEAN,
	last_error TEXT,
	wait_ms_applied INT,
	meta JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS ix_lab_lease_active
	ON paty.lab_orchestrator_lease (capability, provider, released_at)
	WHERE released_at IS NULL;
