/** Hub y settings de Azure SignalR Service (modo serverless). */

export const SIGNALR_HUB_NAME = process.env.SIGNALR_HUB_NAME?.trim() || "lab";

export const SIGNALR_CONNECTION_SETTING = "AzureSignalRConnectionString";

export function signalRConfigured(): boolean {
	return Boolean(process.env[SIGNALR_CONNECTION_SETTING]?.trim());
}

/** Token opcional para POST /api/signalr/notify (avisos desde el server). */
export function notifyTokenOk(request: { headers: { get(name: string): string | null } }): boolean {
	const expected = process.env.LAB_NOTIFY_TOKEN?.trim();
	if (!expected) return true;
	const got =
		request.headers.get("x-lab-notify-token")?.trim() ||
		request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
	return got === expected;
}
