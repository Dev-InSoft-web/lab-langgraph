import type { ConversationRecord } from "./types.js";

/** Formato SSE compatible con PatyIA (`id` / `event` / `data`). */
export function conversationToPayload(record: ConversationRecord): Record<string, unknown> {
	const lastTurn = record.turnos[record.turnos.length - 1];
	return {
		iconversacion: record.iconversacion,
		itercero: record.itercero,
		icontacto: record.icontacto,
		nombre_usuario: record.nombreUsuario,
		titulo: record.titulo,
		prompt: record.prompt,
		respuesta: record.respuesta ?? "",
		hilo: record.hilo,
		modelo: record.modelo,
		itdestado: record.itdestado,
		qtokens: record.qtokens,
		qmensajes: record.qmensajes,
		fhcre: record.fhcre,
		fhultact: record.fhultact,
		version_ayuda: record.version_ayuda,
		prompt_tipo: lastTurn?.promptTipo,
	};
}

export function encodeSseEvent(id: number, event: "begin" | "message" | "end" | "error", data: unknown): string {
	return `id: ${id}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/** Emite la respuesta en trozos para simular stream del Responses API de PatyIA. */
export function* chunkText(text: string, chunkSize = 48): Generator<string> {
	for (let i = 0; i < text.length; i += chunkSize) {
		yield text.slice(i, i + chunkSize);
	}
}

export function buildPatyiaSseStream(
	record: ConversationRecord,
	answer: string,
	onDone?: () => void | Promise<void>,
): ReadableStream<Uint8Array> {
	const encoder = new TextEncoder();
	let seq = 0;
	let acc = "";

	return new ReadableStream({
		async start(controller) {
			try {
				seq += 1;
				controller.enqueue(encoder.encode(encodeSseEvent(seq, "begin", conversationToPayload(record))));
				for (const delta of chunkText(answer)) {
					acc += delta;
					record.respuesta = acc;
					seq += 1;
					controller.enqueue(
						encoder.encode(encodeSseEvent(seq, "message", conversationToPayload(record))),
					);
				}
				seq += 1;
				controller.enqueue(
					encoder.encode(
						encodeSseEvent(seq, "end", {
							...conversationToPayload(record),
							meta: { engine: "langgraph-agents", stream_ok: true },
						}),
					),
				);
				controller.close();
				if (onDone) await onDone();
			} catch (err) {
				seq += 1;
				const message = err instanceof Error ? err.message : String(err);
				controller.enqueue(encoder.encode(encodeSseEvent(seq, "error", { error: message })));
				controller.close();
			}
		},
	});
}
