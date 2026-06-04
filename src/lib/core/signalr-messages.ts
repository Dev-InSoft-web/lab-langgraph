/** Mensaje para el binding de salida `signalR` (Azure Functions). */
export type SignalROutputMessage = {
	target: string;
	arguments: unknown[];
	userId?: string;
	groupName?: string;
};

export type LabNotifyBody = {
	/** Nombre del evento en el cliente (`connection.on(event, …)`). */
	event?: string;
	/** Payload JSON-serializable enviado al cliente. */
	payload?: unknown;
	/** Si se define, solo ese usuario (mismo id que en negotiate `?userId=`). */
	userId?: string;
	/** Grupo SignalR (opcional). */
	groupName?: string;
};

export function toSignalROutput(body: LabNotifyBody): SignalROutputMessage {
	const target = body.event?.trim() || "lab:notify";
	return {
		target,
		arguments: [body.payload ?? {}],
		...(body.userId ? { userId: body.userId } : {}),
		...(body.groupName ? { groupName: body.groupName } : {}),
	};
}
