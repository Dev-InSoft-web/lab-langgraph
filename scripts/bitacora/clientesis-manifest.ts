import type { BitacoraLayoutNode } from "../../src/lib/bitacora/types.js";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export const CLIENTESIS_BITACORA_DATA = "data/bitacora/clientesis";

export type MdRef = { id: string; path: string; dayId?: string };
export type SqlRef = {
	id: string;
	sqlPath: string;
	title: string;
	desc: string;
	checkKey: string;
	confirmKind?: "warning" | "danger" | "info";
	confirmMessage?: string;
	height?: string;
	dbTarget?: "paty" | "clientesis";
};

/** `daily/2026-05/03/foo.md` → `md.2026-05-03.foo`; `topics/a/b.md` → `md.topics.a.b` */
export function mdRelToSegmentId(rel: string): string {
	const norm = rel.replace(/\\/g, "/");
	if (norm.startsWith("daily/")) {
		const parts = norm.slice(6).replace(/\.md$/i, "").split("/");
		if (parts.length >= 3) {
			const [ym, dd, ...rest] = parts;
			const [y, m] = ym.split("-");
			return `md.${y}-${m}-${dd}.${rest.join("-")}`;
		}
	}
	if (norm.startsWith("topics/")) {
		return `md.topics.${norm.slice(7).replace(/\.md$/i, "").replace(/\//g, ".")}`;
	}
	throw new Error(`Ruta md no reconocida: ${rel}`);
}

export function dayIdFromMdPath(rel: string): string | undefined {
	const norm = rel.replace(/\\/g, "/");
	const m = /^daily\/(\d{4}-\d{2})\/(\d{2})\//.exec(norm);
	return m ? `${m[1]}-${m[2]}` : undefined;
}

function walkMd(dir: string, base = ""): MdRef[] {
	const out: MdRef[] = [];
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		const rel = base ? `${base}/${name}` : name;
		if (statSync(full).isDirectory()) {
			out.push(...walkMd(full, rel));
			continue;
		}
		if (!name.endsWith(".md")) continue;
		out.push({
			id: mdRelToSegmentId(rel),
			path: rel,
			dayId: dayIdFromMdPath(rel),
		});
	}
	return out.sort((a, b) => a.path.localeCompare(b.path));
}

export function listClientesisMdSegments(root: string): MdRef[] {
	return [
		...walkMd(join(root, "md", "daily"), "daily"),
		...walkMd(join(root, "md", "topics"), "topics"),
	];
}

export const CLIENTESIS_SQL_SEGMENTS: SqlRef[] = [
	{
		id: "sql.2026-05-15.seguridad.acciones",
		sqlPath: "seed-acciones-cursos-plandeestudio.sql",
		title: "Seguridad · Alta de Consolidar, Duplicar, Eliminar y Recodificar en Cursos y PlanDeEstudio (INGCP / INGSENIOR)",
		desc: "Inserta en SEG_ACCIONESXROL las cuatro acciones extendidas para Cursos y PlanDeEstudio bajo INGCP/INGSENIOR. Idempotente.",
		checkKey: "2026-05-15.seguridad.acciones.cursos.plandeestudio",
		confirmKind: "warning",
		confirmMessage: "Se insertarán hasta 8 filas (4 acciones × 2 recursos) en SEG_ACCIONESXROL para el rol INGCP/INGSENIOR del tercero 810000630.\n\n¿Continuar?",
		height: "320px",
	},
	{
		id: "sql.2026-05-14.jconfig.v2",
		sqlPath: "update-driver-atributos-jconfig-v2.sql",
		title: "Drivers · JCONFIG v2 (renominación + iplanpadre→BtnRef, drivers 1, 2, 3)",
		desc: "Actualiza JCONFIG en CAPAC_ATRIBUTOS_X_DRIVERS para los 6 atributos en drivers 1, 2 y 3.",
		checkKey: "2026-05-14.driver.atributos.jconfig.v2",
		confirmKind: "warning",
		confirmMessage: "Se actualizará JCONFIG de los 6 atributos (IATRIBUTO 1..6) en los drivers 1, 2 y 3 de CAPAC_ATRIBUTOS_X_DRIVERS con la nueva nomenclatura.\n\n¿Continuar?",
		height: "320px",
	},
	{
		id: "sql.2026-05-14.atributos.cleanup",
		sqlPath: "delete-atributos-planes-vacios.sql",
		title: "Atributos de plan · Eliminar filas sin contenido",
		desc: "Borra filas de CAPAC_ATRIBUTOS_PLANES con VALOR vacío.",
		checkKey: "2026-05-14.atributos.planes.cleanup.vacios",
		confirmKind: "danger",
		confirmMessage: "Se eliminarán todas las filas de CAPAC_ATRIBUTOS_PLANES con VALOR vacío. La operación no puede deshacerse.\n\n¿Continuar?",
		height: "240px",
	},
	{
		id: "sql.2026-05-06.driver-recurso-codes",
		sqlPath: "replace-driver-recurso-codes.sql",
		title: "Atributos de plan · Reemplazar códigos legacy por valor numérico (IATRIBUTO=3)",
		desc: "Convierte códigos legacy TTDriverRecurso a valores numéricos 1..5 en CAPAC_ATRIBUTOS_PLANES.",
		checkKey: "2026-05-06.atributosplan.driver_recurso_codes",
		confirmKind: "warning",
		confirmMessage: "Se reemplazarán los códigos legacy de TTDriverRecurso por sus valores numéricos en CAPAC_ATRIBUTOS_PLANES (IATRIBUTO=3).\n\n¿Continuar?",
		height: "320px",
	},
	{
		id: "sql.2026-05-05.audit.add",
		sqlPath: "add-audit-columns.sql",
		title: "Auditoría · Crear columnas CRE/ULT en CAPAC_CURSOS y CAPAC_PLANES_ESTUDIO",
		desc: "Verifica cada columna; crea solo las que falten. Idempotente.",
		checkKey: "2026-05-05.audit.add_columns",
		confirmKind: "info",
		confirmMessage: "Se verificarán y crearán (si no existen) las columnas de auditoría CRE/ULT en CAPAC_CURSOS y CAPAC_PLANES_ESTUDIO.\n\n¿Continuar?",
		height: "320px",
	},
	{
		id: "sql.2026-05-05.audit.drop",
		sqlPath: "drop-audit-columns.sql",
		title: "Auditoría · Eliminar columnas CRE/ULT en entidades distintas a Cursos y Planes de Estudio",
		desc: "Elimina columnas CRE/ULT en 7 tablas de Capacitación que no las requieren.",
		checkKey: "2026-05-05.audit.drop_columns",
		confirmKind: "danger",
		confirmMessage: "Se eliminarán las 10 columnas de auditoría en 7 tablas de Capacitación.\n\n¿Continuar?",
		height: "320px",
	},
	{
		id: "sql.2026-05-05.cursos.activate",
		sqlPath: "activate-all-cursos.sql",
		title: "Cursos · Activar todos los registros (BACTIVO = 1)",
		desc: "Marca como activos todos los cursos en CAPAC_CURSOS.",
		checkKey: "2026-05-05.cursos.activate_all",
		confirmKind: "warning",
		confirmMessage: "Se actualizarán todas las filas de CAPAC_CURSOS donde BACTIVO sea NULL o distinto de 1.\n\n¿Continuar?",
		height: "200px",
	},
	{
		id: "sql.2026-05-05.cursos.delete-sin-driver",
		sqlPath: "delete-cursos-sin-driver.sql",
		title: "Cursos · Eliminar registros sin driver válido",
		desc: "Elimina cursos sin driver y dependencias.",
		checkKey: "2026-05-05.cursos.delete_sin_driver",
		confirmKind: "danger",
		confirmMessage: "Se eliminarán de forma permanente los cursos sin driver junto con sus dependencias.\n\n¿Continuar?",
		height: "280px",
	},
	{
		id: "sql.cleanup.drivers",
		sqlPath: "cleanup-drivers.sql",
		title: "Limpieza · Drivers de prueba (conservar solo IDRIVER 1, 2, 3)",
		desc: "Elimina drivers IDRIVER = 0 o > 3 y dependencias.",
		checkKey: "2026-05-04.cleanup.run",
		confirmKind: "danger",
		confirmMessage: "Se eliminarán drivers de prueba y filas dependientes.\n\n¿Continuar?",
		height: "320px",
	},
	{
		id: "sql.cleanup.atributos-planes",
		sqlPath: "cleanup-atributos-planes.sql",
		title: "Limpieza · CAPAC_ATRIBUTOS_PLANES (filas vacías o de prueba 9xx)",
		desc: "Elimina filas vacías o IATRIBUTO 900-999.",
		checkKey: "2026-05-04.cleanup.atributos_planes",
		confirmKind: "danger",
		confirmMessage: "Se eliminarán filas vacías o de prueba en CAPAC_ATRIBUTOS_PLANES.\n\n¿Continuar?",
		height: "280px",
	},
	{
		id: "sql.cleanup.drop-tablas",
		sqlPath: "cleanup-drop-tablas-obsoletas.sql",
		title: "Limpieza · Eliminar tablas obsoletas de prueba",
		desc: "DROP de tablas residuales de prueba si existen.",
		checkKey: "2026-05-04.cleanup.drop_obsoletas",
		confirmKind: "danger",
		confirmMessage: "Se eliminarán tablas obsoletas de prueba.\n\n¿Continuar?",
		height: "240px",
	},
	{
		id: "sql.iplan.seed",
		sqlPath: "iplan-seed-atributo.sql",
		title: "Fase 1 · Sembrar atributo iplanpadre en cada driver",
		desc: "Crea fila en CAPAC_ATRIBUTOS_X_DRIVERS por driver con NATRIBUTO = iplanpadre.",
		checkKey: "2026-05-04.iplanpadre.fase1",
		confirmKind: "warning",
		confirmMessage: "Se sembrará el atributo iplanpadre en cada driver.\n\n¿Continuar?",
		height: "300px",
	},
	{
		id: "sql.iplan.rollback-dato2",
		sqlPath: "iplan-rollback-dato2.sql",
		title: "Fase 2a · Rollback · Borrar valores iplanpadre migrados",
		desc: "Elimina filas previas de CAPAC_ATRIBUTOS_PLANES para iplanpadre.",
		checkKey: "2026-05-04.iplanpadre.fase2a",
		confirmKind: "danger",
		confirmMessage: "Se borrarán valores migrados de iplanpadre.\n\n¿Continuar?",
		height: "240px",
	},
	{
		id: "sql.iplan.migrar-dato2",
		sqlPath: "iplan-migrar-dato2.sql",
		title: "Fase 2 · Migrar IPLANPADRE → atributo iplanpadre",
		desc: "Inserta en CAPAC_ATRIBUTOS_PLANES desde columna IPLANPADRE.",
		checkKey: "2026-05-04.iplanpadre.fase2",
		confirmKind: "warning",
		confirmMessage: "Se migrará IPLANPADRE al atributo iplanpadre.\n\n¿Continuar?",
		height: "360px",
	},
	{
		id: "sql.iplan.drop-columna",
		sqlPath: "iplan-drop-columna.sql",
		title: "Fase 3 · DROP columna IPLANPADRE",
		desc: "Elimina columna IPLANPADRE de CAPAC_PLANES_CURSOS tras migración.",
		checkKey: "2026-05-04.iplanpadre.fase3",
		confirmKind: "danger",
		confirmMessage: "Se eliminará la columna IPLANPADRE.\n\n¿Continuar?",
		height: "280px",
	},
	{
		id: "sql.iplan.jconfig-dificultad",
		sqlPath: "iplan-jconfig-dificultad.sql",
		title: "Fase 4 · JCONFIG Dificultad (SelectObject B/M/A)",
		desc: "Actualiza JCONFIG del atributo Dificultad.",
		checkKey: "2026-05-04.iplanpadre.fase4",
		confirmKind: "warning",
		confirmMessage: "Se actualizará JCONFIG de Dificultad.\n\n¿Continuar?",
		height: "240px",
	},
	{
		id: "sql.iplan.limpiar-audit",
		sqlPath: "iplan-limpiar-audit.sql",
		title: "Fase 5 · Limpiar columnas de auditoría residuales en migración",
		desc: "Limpieza post-migración IPLANPADRE.",
		checkKey: "2026-05-04.iplanpadre.fase5",
		confirmKind: "warning",
		confirmMessage: "Se limpiarán columnas de auditoría residuales.\n\n¿Continuar?",
		height: "280px",
	},
	{
		id: "sql.imgdoc.seed-imagen",
		sqlPath: "imgdoc-seed-imagen.sql",
		title: 'Fase 1a · Sembrar "Imagen del profesor" por driver',
		desc: "Semilla atributo Imagen del profesor en cada driver.",
		checkKey: "2026-05-05.imgdoc.fase1a",
		confirmKind: "warning",
		confirmMessage: "Se sembrará Imagen del profesor por driver.\n\n¿Continuar?",
		height: "280px",
	},
	{
		id: "sql.imgdoc.seed-documento",
		sqlPath: "imgdoc-seed-documento.sql",
		title: 'Fase 1b · Crear atributo NUEVO "Documento" por driver',
		desc: "Atributo Documento en rango bajo (<100).",
		checkKey: "2026-05-05.imgdoc.fase1b",
		confirmKind: "warning",
		confirmMessage: "Se creará atributo Documento por driver.\n\n¿Continuar?",
		height: "280px",
	},
	{
		id: "sql.imgdoc.rollback",
		sqlPath: "imgdoc-rollback.sql",
		title: "Fase 2a · Rollback · Borrar valores Imagen / Documento",
		desc: "Elimina filas previas en CAPAC_ATRIBUTOS_PLANES.",
		checkKey: "2026-05-05.imgdoc.fase2a",
		confirmKind: "danger",
		confirmMessage: "Se borrarán valores Imagen/Documento migrados.\n\n¿Continuar?",
		height: "220px",
	},
	{
		id: "sql.imgdoc.migrar-imagen",
		sqlPath: "imgdoc-migrar-imagen.sql",
		title: 'Fase 2b · Migrar IMAGENDRIVER → "Imagen del profesor"',
		desc: "Inserta valores de IMAGENDRIVER en atributos plan.",
		checkKey: "2026-05-05.imgdoc.fase2b",
		confirmKind: "warning",
		confirmMessage: "Se migrará IMAGENDRIVER.\n\n¿Continuar?",
		height: "320px",
	},
	{
		id: "sql.imgdoc.migrar-documento",
		sqlPath: "imgdoc-migrar-documento.sql",
		title: 'Fase 2c · Migrar DOCUMENTODRIVER → "Documento"',
		desc: "Inserta valores de DOCUMENTODRIVER.",
		checkKey: "2026-05-05.imgdoc.fase2c",
		confirmKind: "warning",
		confirmMessage: "Se migrará DOCUMENTODRIVER.\n\n¿Continuar?",
		height: "320px",
	},
	{
		id: "sql.driverstruct.idriver",
		sqlPath: "driverstruct-actualizar-idriver.sql",
		title: "CAPAC_CURSOS · Actualizar IDRIVER desde DRIVERSTRUCT",
		desc: "Migra DRIVERSTRUCT legacy a IDRIVER numérico.",
		checkKey: "2026-05-04.driverstruct.update",
		confirmKind: "warning",
		confirmMessage: "Se actualizará IDRIVER desde DRIVERSTRUCT.\n\n¿Continuar?",
		height: "300px",
	},
	{
		id: "sql.2026-05-26.paty.ninstruccion",
		sqlPath: "paty-update-nombres-instruccion.sql",
		title: "INSTRUCCION · Poblar NINSTRUCCION con nombres semánticos en español",
		desc: "UPDATE NINSTRUCCION en AYUDASCP_IA (13 tipos).",
		checkKey: "2026-05-26.patyia.ninstruccion.update",
		confirmKind: "warning",
		confirmMessage: "Se actualizará NINSTRUCCION en los 13 registros de INSTRUCCION.\n\n¿Continuar?",
		height: "340px",
		dbTarget: "paty",
	},
];

export { CLIENTESIS_LAYOUT_NODES } from "./clientesis-layout.js";
