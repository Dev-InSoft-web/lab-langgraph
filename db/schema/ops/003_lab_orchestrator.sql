-- Orquestador · esquema BD_LAB

CREATE SCHEMA IF NOT EXISTS bd_lab;

CREATE TABLE IF NOT EXISTS bd_lab.lab_api_key_slot (
	provider TEXT NOT NULL,
	capability TEXT NOT NULL,
	keylabel TEXT NOT NULL,
	sortorder INT NOT NULL DEFAULT 0,
	benabled BOOLEAN NOT NULL DEFAULT TRUE,
	cooldownuntil TIMESTAMPTZ,
	lastusedat TIMESTAMPTZ,
	lasthttpstatus INT,
	lasterror TEXT,
	waitmshint INT,
	consecutivefailures INT NOT NULL DEFAULT 0,
	meta JSONB NOT NULL DEFAULT '{}',
	fhultact TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	PRIMARY KEY (provider, capability, keylabel)
);

CREATE INDEX IF NOT EXISTS ix_lab_slot_pick
	ON bd_lab.lab_api_key_slot (capability, provider, benabled, cooldownuntil, sortorder);

CREATE TABLE IF NOT EXISTS bd_lab.lab_orchestrator_lease (
	ilease UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	provider TEXT NOT NULL,
	capability TEXT NOT NULL,
	keylabel TEXT NOT NULL,
	acquiredat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	expiresat TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '45 minutes'),
	releasedat TIMESTAMPTZ,
	bok BOOLEAN,
	lasterror TEXT,
	waitmsapplied INT,
	meta JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS ix_lab_lease_active
	ON bd_lab.lab_orchestrator_lease (capability, provider, releasedat)
	WHERE releasedat IS NULL;
