import type { ConversationPostBody } from "../conversation/types.js";

/** Sesión simulada (sin auth PatyIA / DSCLIENTES). */
export interface SimulatedLabSession {
	itercero: string;
	icontacto: string;
	nombreUsuario: string;
	empresa?: string;
}

export function resolveSimulatedSession(body: ConversationPostBody): SimulatedLabSession {
	const nombre =
		String(body.nombre_usuario ?? body.nombres ?? body.nombre ?? "Usuario").trim() || "Usuario";
	return {
		itercero: String(body.itercero ?? "lab-tercero"),
		icontacto: String(body.icontacto ?? "lab-contacto"),
		nombreUsuario: nombre.slice(0, 80),
		empresa: body.empresa ? String(body.empresa).slice(0, 120) : undefined,
	};
}
