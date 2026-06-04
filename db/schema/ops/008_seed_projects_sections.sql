-- Proyectos y secciones (esquema BD_LAB · nomenclatura INSOFT)
INSERT INTO bd_lab.lab_store_project (slug, name, description, sortkey) VALUES
	('isa-doc', 'ISA-DOC', 'Documentación, tickets, bitácora y datos editoriales del front estático.', 10),
	('patyia', 'PatyIA', 'Asistente IA: conversaciones, prompts, caches y catálogo API.', 20),
	('clientesis', 'ClientesIS · ContaPymeU', 'Capacitación ContaPymeU y snapshots Postman para gh-pages.', 30)
ON CONFLICT (slug) DO UPDATE SET
	name = EXCLUDED.name,
	description = EXCLUDED.description,
	sortkey = EXCLUDED.sortkey,
	fhultact = now();

INSERT INTO bd_lab.lab_store_section (projectslug, slug, name, sortkey) VALUES
	('isa-doc', 'tickets', 'Tickets', 10),
	('isa-doc', 'postman', 'Postman / API', 20),
	('isa-doc', 'bitacora', 'Bitácora', 30),
	('isa-doc', 'patyia', 'PatyIA (datos)', 40),
	('isa-doc', 'openai', 'OpenAI storage', 50),
	('isa-doc', 'clientesis-schema', 'Esquema ClientesIS', 60),
	('isa-doc', 'codegen', 'Codegen DER', 70),
	('patyia', 'api', 'Catálogo API', 10),
	('patyia', 'prompts', 'Prompts', 20),
	('patyia', 'caches', 'Caches', 30),
	('patyia', 'postman-catalog', 'Postman (UI)', 40),
	('clientesis', 'capacitacion', 'Capacitación', 10),
	('clientesis', 'postman-catalog', 'Postman (UI)', 20)
ON CONFLICT (projectslug, slug) DO UPDATE SET
	name = EXCLUDED.name,
	sortkey = EXCLUDED.sortkey,
	fhultact = now();
