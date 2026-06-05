-- Definiciones de entidad (generado; no editar a mano)
-- Regenerar: npx tsx scripts/generate-catalog-sql.mts

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('isa-doc', 'tickets', 'ticket', 'Ticket', NULL,
  '["ITICKET"]'::jsonb, '[{"name":"ITICKET","kind":"string","required":true},{"name":"titulo","kind":"string"},{"name":"solicitante","kind":"string"},{"name":"fechaSolicitud","kind":"string"},{"name":"fechaEntrega","kind":"string"},{"name":"resumen","kind":"string"},{"name":"estado","kind":"string"},{"name":"proyecto","kind":"string"},{"name":"pagina","kind":"string"},{"name":"bodyModule","kind":"string"},{"name":"sqlModule","kind":"string"},{"name":"normativa","kind":"json"},{"name":"commits","kind":"json"},{"name":"cambiosBd","kind":"json"},{"name":"meta","kind":"json"}]'::jsonb, '[{"key":"assets","child":{"project":"isa-doc","page":"tickets","entity":"imgbb-asset"},"fk":{"ITICKET":"ITICKET"},"cascadeDelete":true}]'::jsonb, '["ITICKET","titulo","solicitante","resumen"]'::jsonb, 10)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('isa-doc', 'tickets', 'imgbb-asset', 'Asset imgbb', NULL,
  '["IIMGBB"]'::jsonb, '[{"name":"IIMGBB","kind":"string","required":true},{"name":"ITICKET","kind":"string"},{"name":"sha1","kind":"string"},{"name":"url","kind":"string"},{"name":"display_url","kind":"string"},{"name":"thumb","kind":"string"},{"name":"width","kind":"number"},{"name":"height","kind":"number"},{"name":"size","kind":"number"}]'::jsonb, '[]'::jsonb, '["IIMGBB","ITICKET"]'::jsonb, 20)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('isa-doc', 'postman', 'endpoint', 'Endpoint API', NULL,
  '["IAPIPROJECT","IENDPOINT"]'::jsonb, '[{"name":"IAPIPROJECT","kind":"string","required":true},{"name":"IENDPOINT","kind":"string","required":true},{"name":"name","kind":"string"},{"name":"method","kind":"string"},{"name":"path","kind":"string"},{"name":"folder","kind":"string"},{"name":"tags","kind":"json"},{"name":"body","kind":"json"},{"name":"overrides","kind":"json"}]'::jsonb, '[]'::jsonb, '["name","path","IAPIPROJECT"]'::jsonb, 10)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('isa-doc', 'bitacora', 'revisado', 'Revisado bitácora', NULL,
  '["IREVISADOKEY"]'::jsonb, '[{"name":"IREVISADOKEY","kind":"string","required":true},{"name":"revisado","kind":"boolean"},{"name":"proyecto","kind":"string"},{"name":"pagina","kind":"string"}]'::jsonb, '[]'::jsonb, '["IREVISADOKEY"]'::jsonb, 10)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('isa-doc', 'patyia', 'prompt', 'Prompt PatyIA', NULL,
  '["IPROMPTPATH"]'::jsonb, '[{"name":"IPROMPTPATH","kind":"string","required":true},{"name":"title","kind":"string"},{"name":"body","kind":"string"},{"name":"tags","kind":"json"}]'::jsonb, '[]'::jsonb, '["IPROMPTPATH","title"]'::jsonb, 10)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('isa-doc', 'openai', 'file-meta', 'Metadato archivo OpenAI', NULL,
  '["IOAIFILEID"]'::jsonb, '[{"name":"IOAIFILEID","kind":"string","required":true},{"name":"filename","kind":"string"},{"name":"purpose","kind":"string"},{"name":"meta","kind":"json"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 10)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('isa-doc', 'clientesis-schema', 'table', 'Tabla DER', NULL,
  '["ITABLEID"]'::jsonb, '[{"name":"ITABLEID","kind":"string","required":true},{"name":"tableref","kind":"string"},{"name":"rowname","kind":"string"},{"name":"columns","kind":"json"}]'::jsonb, '[]'::jsonb, '["tableref","rowname"]'::jsonb, 10)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('isa-doc', 'codegen', 'state', 'Estado codegen', NULL,
  '["ICODEGENSTATE"]'::jsonb, '[{"name":"ICODEGENSTATE","kind":"string","required":true},{"name":"body","kind":"json"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 10)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('patyia', 'api', 'catalog-endpoint', 'Endpoint catálogo', NULL,
  '["ICATALOGENDPOINT"]'::jsonb, '[{"name":"ICATALOGENDPOINT","kind":"string","required":true},{"name":"entity","kind":"string"},{"name":"name","kind":"string"},{"name":"method","kind":"string"},{"name":"pathTemplate","kind":"string"},{"name":"hostVar","kind":"string"},{"name":"description","kind":"string"},{"name":"bodyTemplate","kind":"string"},{"name":"authBearer","kind":"boolean"}]'::jsonb, '[]'::jsonb, '["name","entity"]'::jsonb, 10)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('patyia', 'prompts', 'prompt-file', 'Archivo prompt', NULL,
  '["IPROMPTFILE"]'::jsonb, '[{"name":"IPROMPTFILE","kind":"string","required":true},{"name":"content","kind":"string"},{"name":"hash","kind":"string"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 10)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('patyia', 'caches', 'conversaciones', 'Cache conversaciones', NULL,
  '["ICONVCACHEID"]'::jsonb, '[{"name":"ICONVCACHEID","kind":"string","required":true},{"name":"body","kind":"json"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 10)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('patyia', 'caches', 'identidades', 'Cache identidades', NULL,
  '["IIDENTCACHEID"]'::jsonb, '[{"name":"IIDENTCACHEID","kind":"string","required":true},{"name":"body","kind":"json"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 20)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('clientesis', 'capacitacion', 'driver', 'Driver', NULL,
  '["idriver"]'::jsonb, '[{"name":"idriver","kind":"number","required":true},{"name":"ndriver","kind":"string"},{"name":"descripcion","kind":"string"},{"name":"qniveles","kind":"number"}]'::jsonb, '[{"key":"atributos","child":{"project":"clientesis","page":"capacitacion","entity":"atributo-x-driver"},"fk":{"idriver":"idriver"},"cascadeDelete":true}]'::jsonb, '["ndriver"]'::jsonb, 10)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('clientesis', 'capacitacion', 'atributo-x-driver', 'Atributo × Driver', NULL,
  '["idriver","iatributo"]'::jsonb, '[{"name":"idriver","kind":"number","required":true},{"name":"iatributo","kind":"number","required":true},{"name":"qnivel","kind":"number"},{"name":"natributo","kind":"string"},{"name":"tdatributo","kind":"number"},{"name":"brequerido","kind":"boolean"},{"name":"jconfig","kind":"json"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 20)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('clientesis', 'capacitacion', 'plan-estudio', 'Plan de estudio', NULL,
  '["iplanestudio"]'::jsonb, '[{"name":"iplanestudio","kind":"string","required":true},{"name":"nombre","kind":"string"},{"name":"descripcionplan","kind":"string"},{"name":"ttdvisualizacion","kind":"string"},{"name":"bgeneracertificados","kind":"boolean"},{"name":"bactivo","kind":"boolean"}]'::jsonb, '[{"key":"cursosdeplanestudio","child":{"project":"clientesis","page":"capacitacion","entity":"curso-de-plan"},"fk":{"iplanestudio":"iplanestudio"},"cascadeDelete":true},{"key":"prerrequisitos","child":{"project":"clientesis","page":"capacitacion","entity":"curso-prerequisito"},"fk":{"iplanestudio":"iplanestudio"},"cascadeDelete":true}]'::jsonb, '["nombre","iplanestudio"]'::jsonb, 30)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('clientesis', 'capacitacion', 'curso-de-plan', 'Curso de plan', NULL,
  '["iplanestudio","icurso"]'::jsonb, '[{"name":"iplanestudio","kind":"string","required":true},{"name":"icurso","kind":"string","required":true},{"name":"qorden","kind":"number"},{"name":"brequerido","kind":"boolean"},{"name":"curso","kind":"json"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 40)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('clientesis', 'capacitacion', 'curso-prerequisito', 'Prerrequisito curso', NULL,
  '["icurso","icursorequerido","iplanestudio"]'::jsonb, '[{"name":"icurso","kind":"string","required":true},{"name":"icursorequerido","kind":"string","required":true},{"name":"iplanestudio","kind":"string","required":true}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 50)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('clientesis', 'capacitacion', 'curso', 'Curso', NULL,
  '["icurso"]'::jsonb, '[{"name":"icurso","kind":"string","required":true},{"name":"ncurso","kind":"string"},{"name":"itema","kind":"string"},{"name":"idriver","kind":"number"},{"name":"descripcion","kind":"string"},{"name":"bactivo","kind":"boolean"},{"name":"bgeneracertificado","kind":"boolean"}]'::jsonb, '[{"key":"seguridades","child":{"project":"clientesis","page":"capacitacion","entity":"seguridad-curso"},"fk":{"icurso":"icurso"},"cascadeDelete":true},{"key":"estructuras","child":{"project":"clientesis","page":"capacitacion","entity":"estructura-curso"},"fk":{"icurso":"icurso"},"cascadeDelete":true},{"key":"planescurso","child":{"project":"clientesis","page":"capacitacion","entity":"plan-curso"},"fk":{"icurso":"icurso"}}]'::jsonb, '["icurso","ncurso"]'::jsonb, 60)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('clientesis', 'capacitacion', 'plan-curso', 'Plan curso (árbol)', NULL,
  '["iplan","icurso"]'::jsonb, '[{"name":"iplan","kind":"string","required":true},{"name":"icurso","kind":"string","required":true},{"name":"itema","kind":"string"},{"name":"titulo","kind":"string"},{"name":"irecurso","kind":"number"},{"name":"recurso","kind":"json"},{"name":"atributosplan","kind":"json"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 70)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('clientesis', 'capacitacion', 'atributos-plan', 'Atributos plan', NULL,
  '["iatributo","icurso","iplan"]'::jsonb, '[{"name":"iatributo","kind":"number","required":true},{"name":"icurso","kind":"string","required":true},{"name":"iplan","kind":"string","required":true},{"name":"valor","kind":"string"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 80)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('clientesis', 'capacitacion', 'seguridad-curso', 'Seguridad curso', NULL,
  '["icurso","ipermiso"]'::jsonb, '[{"name":"icurso","kind":"string","required":true},{"name":"ipermiso","kind":"string","required":true},{"name":"permiso","kind":"json"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 90)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('clientesis', 'capacitacion', 'estructura-curso', 'Estructura curso', NULL,
  '["icurso","qnivel"]'::jsonb, '[{"name":"icurso","kind":"string","required":true},{"name":"qnivel","kind":"number","required":true},{"name":"nnivel","kind":"string"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 100)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('clientesis', 'capacitacion', 'permiso', 'Permiso', NULL,
  '["ipermiso"]'::jsonb, '[{"name":"ipermiso","kind":"string","required":true},{"name":"npermiso","kind":"string"}]'::jsonb, '[]'::jsonb, '["ipermiso","npermiso"]'::jsonb, 110)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('clientesis', 'capacitacion', 'tema', 'Tema soporte', NULL,
  '["itema"]'::jsonb, '[{"name":"itema","kind":"string","required":true},{"name":"ntema","kind":"string"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 120)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('clientesis', 'postman-catalog', 'cursos', 'cursos', NULL,
  '["ICATALOGSLUG"]'::jsonb, '[{"name":"ICATALOGSLUG","kind":"string","required":true},{"name":"name","kind":"string"},{"name":"itemCount","kind":"number"},{"name":"payload","kind":"json"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 10)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('clientesis', 'postman-catalog', 'planes-de-estudio', 'planes de estudio', NULL,
  '["ICATALOGSLUG"]'::jsonb, '[{"name":"ICATALOGSLUG","kind":"string","required":true},{"name":"name","kind":"string"},{"name":"itemCount","kind":"number"},{"name":"payload","kind":"json"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 11)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('clientesis', 'postman-catalog', 'drivers', 'drivers', NULL,
  '["ICATALOGSLUG"]'::jsonb, '[{"name":"ICATALOGSLUG","kind":"string","required":true},{"name":"name","kind":"string"},{"name":"itemCount","kind":"number"},{"name":"payload","kind":"json"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 12)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('clientesis', 'postman-catalog', 'permisos', 'permisos', NULL,
  '["ICATALOGSLUG"]'::jsonb, '[{"name":"ICATALOGSLUG","kind":"string","required":true},{"name":"name","kind":"string"},{"name":"itemCount","kind":"number"},{"name":"payload","kind":"json"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 13)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('patyia', 'postman-catalog', 'conversacion', 'conversacion', NULL,
  '["ICATALOGSLUG"]'::jsonb, '[{"name":"ICATALOGSLUG","kind":"string","required":true},{"name":"name","kind":"string"},{"name":"itemCount","kind":"number"},{"name":"payload","kind":"json"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 10)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('patyia', 'postman-catalog', 'jwt', 'jwt', NULL,
  '["ICATALOGSLUG"]'::jsonb, '[{"name":"ICATALOGSLUG","kind":"string","required":true},{"name":"name","kind":"string"},{"name":"itemCount","kind":"number"},{"name":"payload","kind":"json"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 11)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('patyia', 'postman-catalog', 'mensaje', 'mensaje', NULL,
  '["ICATALOGSLUG"]'::jsonb, '[{"name":"ICATALOGSLUG","kind":"string","required":true},{"name":"name","kind":"string"},{"name":"itemCount","kind":"number"},{"name":"payload","kind":"json"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 12)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();

INSERT INTO "BD_LAB"."ENTITY_ENTITYDEFINITION" ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG", "NAME", "DESCRIPTION", "PRIMARYKEYS", "COLUMNS", "DETAILS", "SEARCHFIELDS", "SORTKEY")
VALUES ('patyia', 'postman-catalog', 'tiquete', 'tiquete', NULL,
  '["ICATALOGSLUG"]'::jsonb, '[{"name":"ICATALOGSLUG","kind":"string","required":true},{"name":"name","kind":"string"},{"name":"itemCount","kind":"number"},{"name":"payload","kind":"json"}]'::jsonb, '[]'::jsonb, '[]'::jsonb, 13)
ON CONFLICT ("PROJECTSLUG", "SECTIONSLUG", "ENTITYSLUG") DO UPDATE SET
  "NAME" = EXCLUDED."NAME", "DESCRIPTION" = EXCLUDED."DESCRIPTION",
  "PRIMARYKEYS" = EXCLUDED."PRIMARYKEYS", "COLUMNS" = EXCLUDED."COLUMNS",
  "DETAILS" = EXCLUDED."DETAILS", "SEARCHFIELDS" = EXCLUDED."SEARCHFIELDS",
  "SORTKEY" = EXCLUDED."SORTKEY", "FHULTACT" = now();
