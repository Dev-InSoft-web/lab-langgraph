-- Copia datos desde esquemas legacy (paty, lab, clientesis, rag) → bd_* (idempotente).

-- Paty · instrucciones
INSERT INTO BD_LANGLAB.paty_instruccion (iinstruccion, ninstruccion, modelo, instruccion, descripcion, version, fhultact)
SELECT iinstruccion, ninstruccion, modelo, instruccion, descripcion, version, COALESCE(updated_at, NOW())
FROM paty.instruccion
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'paty' AND table_name = 'instruccion')
ON CONFLICT (iinstruccion) DO UPDATE SET
	ninstruccion = EXCLUDED.ninstruccion,
	modelo = EXCLUDED.modelo,
	instruccion = EXCLUDED.instruccion,
	descripcion = EXCLUDED.descripcion,
	version = EXCLUDED.version,
	fhultact = EXCLUDED.fhultact;

-- Paty · conversaciones
INSERT INTO BD_LANGLAB.paty_conversacion (
	iconversacion, itercero, icontacto, nombreusuario, titulo, hilo, modeloia, versionayuda,
	itdestado, bautorizavisualizacion, imodulo, prompt, respuesta, qtokens, qmensajes, fhcre, fhultact
)
SELECT
	iconversacion, itercero, icontacto, nombre_usuario, titulo, hilo, modelo_ia, version_ayuda,
	itdestado, COALESCE(bautorizavisualizacion, FALSE), COALESCE(imodulo, ''), prompt, respuesta,
	qtokens, qmensajes, fhcre, COALESCE(fhultact, fhcre)
FROM paty.conversaciones
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'paty' AND table_name = 'conversaciones')
ON CONFLICT (iconversacion) DO NOTHING;

SELECT setval(
	pg_get_serial_sequence('BD_LANGLAB.paty_conversacion', 'iconversacion'),
	COALESCE((SELECT MAX(iconversacion) FROM BD_LANGLAB.paty_conversacion), 1)
);

-- Paty · turnos
INSERT INTO BD_LANGLAB.paty_conversacion_turno (
	iturno, iconversacion, ts, prompttext, responsetext, prompttipo, corpus, bjailbreak, latencyms,
	iturnindex, ilease, provider, keylabel
)
SELECT
	iturno, iconversacion, ts, prompt_text, response_text, prompt_tipo, corpus, jailbreak, latency_ms,
	turn_index, lease_id, provider, key_label
FROM paty.conversacion_turnos
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'paty' AND table_name = 'conversacion_turnos')
ON CONFLICT (iturno) DO NOTHING;

SELECT setval(
	pg_get_serial_sequence('BD_LANGLAB.paty_conversacion_turno', 'iturno'),
	COALESCE((SELECT MAX(iturno) FROM BD_LANGLAB.paty_conversacion_turno), 1)
);

-- Lab · catálogo
INSERT INTO bd_lab.lab_store_project (slug, name, description, sortkey, meta, fhcre, fhultact)
SELECT slug, name, description, sort_key, meta, created_at, updated_at
FROM lab.store_project
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'lab' AND table_name = 'store_project')
ON CONFLICT (slug) DO UPDATE SET
	name = EXCLUDED.name,
	description = EXCLUDED.description,
	sortkey = EXCLUDED.sortkey,
	meta = EXCLUDED.meta,
	fhultact = EXCLUDED.fhultact;

INSERT INTO bd_lab.lab_store_section (projectslug, slug, name, description, sortkey, meta, fhcre, fhultact)
SELECT project_slug, slug, name, description, sort_key, meta, created_at, updated_at
FROM lab.store_section
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'lab' AND table_name = 'store_section')
ON CONFLICT (projectslug, slug) DO UPDATE SET
	name = EXCLUDED.name,
	description = EXCLUDED.description,
	sortkey = EXCLUDED.sortkey,
	meta = EXCLUDED.meta,
	fhultact = EXCLUDED.fhultact;

INSERT INTO bd_lab.lab_entity_definition (
	projectslug, sectionslug, entityslug, name, description,
	primarykeys, columns, details, searchfields, sortkey, meta, fhcre, fhultact
)
SELECT
	project_slug, section_slug, entity_slug, name, description,
	primary_keys, columns, details, search_fields, sort_key, meta, created_at, updated_at
FROM lab.entity_definition
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'lab' AND table_name = 'entity_definition')
ON CONFLICT (projectslug, sectionslug, entityslug) DO UPDATE SET
	name = EXCLUDED.name,
	description = EXCLUDED.description,
	primarykeys = EXCLUDED.primarykeys,
	columns = EXCLUDED.columns,
	details = EXCLUDED.details,
	searchfields = EXCLUDED.searchfields,
	sortkey = EXCLUDED.sortkey,
	meta = EXCLUDED.meta,
	fhultact = EXCLUDED.fhultact;

-- Lab · entity_row (columnas ya sin _ en legacy reciente, o con parent_*)
INSERT INTO bd_lab.lab_entity_row (
	project, page, entity, pk, body,
	parentproject, parentpage, parententity, parentpk,
	sortkey, tags, fhcre, fhultact
)
SELECT
	project, page, entity, pk, body,
	COALESCE(parentproject, parent_project),
	COALESCE(parentpage, parent_page),
	COALESCE(parententity, parent_entity),
	COALESCE(parentpk, parent_pk),
	COALESCE(sortkey, sort_key, 0),
	tags,
	COALESCE(fhcre, created_at, now()),
	COALESCE(fhultact, updated_at, now())
FROM lab.entity_row
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'lab' AND table_name = 'entity_row')
ON CONFLICT (project, page, entity, pk) DO UPDATE SET
	body = EXCLUDED.body,
	fhultact = EXCLUDED.fhultact;

-- Clientesis · entity_row
INSERT INTO bd_clientesis.cis_entity_row (
	project, page, entity, pk, body,
	parentproject, parentpage, parententity, parentpk,
	sortkey, tags, fhcre, fhultact
)
SELECT
	project, page, entity, pk, body,
	COALESCE(parentproject, parent_project),
	COALESCE(parentpage, parent_page),
	COALESCE(parententity, parent_entity),
	COALESCE(parentpk, parent_pk),
	COALESCE(sortkey, sort_key, 0),
	tags,
	COALESCE(fhcre, created_at, now()),
	COALESCE(fhultact, updated_at, now())
FROM clientesis.entity_row
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'clientesis' AND table_name = 'entity_row')
ON CONFLICT (project, page, entity, pk) DO UPDATE SET
	body = EXCLUDED.body,
	fhultact = EXCLUDED.fhultact;

-- Lab · orquestador
INSERT INTO bd_lab.lab_api_key_slot (
	provider, capability, keylabel, sortorder, benabled,
	cooldownuntil, lastusedat, lasthttpstatus, lasterror, waitmshint, consecutivefailures, meta, fhultact
)
SELECT
	provider, capability, key_label, sort_order, enabled,
	cooldown_until, last_used_at, last_http_status, last_error, wait_ms_hint, consecutive_failures, meta, updated_at
FROM lab.api_key_slot
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'lab' AND table_name = 'api_key_slot')
ON CONFLICT (provider, capability, keylabel) DO UPDATE SET
	sortorder = EXCLUDED.sortorder,
	benabled = EXCLUDED.benabled,
	fhultact = EXCLUDED.fhultact;

INSERT INTO bd_lab.lab_orchestrator_lease (
	ilease, provider, capability, keylabel, acquiredat, expiresat, releasedat, bok, lasterror, waitmsapplied, meta
)
SELECT
	lease_id, provider, capability, key_label, acquired_at, expires_at, released_at, ok, last_error, wait_ms_applied, meta
FROM lab.orchestrator_lease
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'lab' AND table_name = 'orchestrator_lease')
ON CONFLICT (ilease) DO NOTHING;

INSERT INTO bd_lab.lab_bitacora_revisado (revisadokey, bchecked, fhultact)
SELECT revisado_key, COALESCE(bchecked, checked, false), COALESCE(fhultact, updated_at, NOW())
FROM lab.bitacora_revisado
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'lab' AND table_name = 'bitacora_revisado')
ON CONFLICT (revisadokey) DO UPDATE SET
	bchecked = EXCLUDED.bchecked,
	fhultact = EXCLUDED.fhultact;

INSERT INTO bd_lab.lab_api_catalog_manifest (id, version, generatedat, source, body)
SELECT id, version, generated_at, source, body
FROM lab.api_catalog_manifest
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'lab' AND table_name = 'api_catalog_manifest')
ON CONFLICT (id) DO UPDATE SET
	version = EXCLUDED.version,
	generatedat = EXCLUDED.generatedat,
	source = EXCLUDED.source,
	body = EXCLUDED.body;
