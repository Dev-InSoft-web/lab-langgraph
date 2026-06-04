/**
 * Cliente Azure SignalR (serverless) para lab-langgraph.
 * Requiere @microsoft/signalr (CDN en index.html o bundler).
 *
 * Uso:
 *   const lab = await LabSignalR.connect({ apiBase: window.FITDOCS_API_BASE, userId: "juan" });
 *   lab.on("lab:notify", (payload) => console.log(payload));
 */
(function (global) {
	const DEFAULT_EVENT = "lab:notify";

	async function loadSignalR() {
		if (global.signalR?.HubConnectionBuilder) return global.signalR;
		throw new Error("Cargue @microsoft/signalr antes que signalr-lab.js");
	}

	/**
	 * @param {{ apiBase: string, userId?: string, onReconnecting?: () => void }} opts
	 */
	async function connect(opts) {
		const signalR = await loadSignalR();
		const base = opts.apiBase.replace(/\/$/, "");
		const q = opts.userId ? `?userId=${encodeURIComponent(opts.userId)}` : "";
		const negotiateUrl = `${base}/signalr/negotiate${q}`;

		const connection = new signalR.HubConnectionBuilder()
			.withUrl(negotiateUrl)
			.withAutomaticReconnect([0, 2000, 5000, 10000])
			.configureLogging(signalR.LogLevel.Information)
			.build();

		if (opts.onReconnecting) {
			connection.onreconnecting(opts.onReconnecting);
			connection.onreconnected(() => opts.onReconnecting?.());
		}

		await connection.start();
		return {
			connection,
			on(event, handler) {
				connection.on(event || DEFAULT_EVENT, handler);
			},
			async disconnect() {
				await connection.stop();
			},
		};
	}

	global.LabSignalR = { connect, DEFAULT_EVENT };
})(typeof window !== "undefined" ? window : globalThis);
