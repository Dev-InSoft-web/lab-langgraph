INSERT INTO bd_clientesis.cis_entity_row (
	project, page, entity, pk, body,
	parentproject, parentpage, parententity, parentpk,
	sortkey, tags, fhcre, fhultact
)
SELECT
	project, page, entity, pk, body,
	parentproject, parentpage, parententity, parentpk,
	sortkey, tags, fhcre, fhultact
FROM bd_lab.lab_entity_row
WHERE project = 'clientesis'
ON CONFLICT (project, page, entity, pk) DO UPDATE SET
	body = EXCLUDED.body,
	fhultact = EXCLUDED.fhultact;

DELETE FROM bd_lab.lab_entity_row WHERE project = 'clientesis';
