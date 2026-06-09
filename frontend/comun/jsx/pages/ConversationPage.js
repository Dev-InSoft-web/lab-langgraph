const { useState, useEffect, useCallback } = React;
const {
	Box, Typography, TextField, Button, Alert, List, ListItemButton, ListItemText, Grid, CircularProgress, IconButton,
	Chip, Divider,
} = window.Lab.mui;
const LabPage = window.Lab.LabPage;
const { useAuth } = window.Lab;
const {
	listConversations, createConversation, getConversation, deleteConversation, patchConversation, postMessage,
	getConversationLogs, truncateConversation,
} = window.Lab.conversationApi;
const { readState, patchState, onStateChange } = window.Lab.urlState;

function turnsToMsgs(turnos = []) {
	const out = [];
	for (const t of turnos) {
		if (t.promptText) out.push({ role: "user", content: t.promptText });
		if (t.responseText) out.push({ role: "assistant", content: t.responseText });
	}
	return out;
}

function convFromUrl() {
	const c = Number(readState().conv);
	return Number.isFinite(c) && c > 0 ? c : null;
}

function formatUsd(n) {
	if (n == null || !Number.isFinite(n)) return "—";
	return n < 0.001 ? "<$0.001" : `$${n.toFixed(4)}`;
}

function formatMs(ms) {
	if (ms == null || !Number.isFinite(ms)) return "—";
	return ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${Math.round(ms)} ms`;
}

function truncatePreview(text, max = 48) {
	const s = String(text ?? "").replace(/\s+/g, " ").trim();
	if (!s) return "(vacío)";
	return s.length > max ? `${s.slice(0, max)}…` : s;
}

function costThroughTurn(logs, throughIndex) {
	let usd = 0;
	let ms = 0;
	for (const row of logs) {
		if (row.turnIndex > throughIndex) break;
		usd += row.meta?.totalEstimatedCostUsd ?? 0;
		ms += row.meta?.totalLatencyMs ?? 0;
	}
	return { usd, ms };
}

const RAG_SKIP_LABELS = {
	no_rag_database: "RAG_DATABASE_URL no configurada",
	empty_corpus: "Tipo sin corpus asignado",
	skip_flag: "Omitido (skipRag)",
	no_chunks: "Búsqueda sin fragmentos",
	not_run: "No ejecutado",
};

function parseClassifierRaw(raw) {
	if (!raw?.trim()) return null;
	try {
		return JSON.parse(raw.replace(/```json|```/g, "").trim());
	} catch {
		return { _texto: raw };
	}
}

function LogKv({ label, value }) {
	if (value == null || value === "") return null;
	return (
		<Typography variant="caption" display="block" sx={{ fontSize: "0.68rem", color: "text.secondary", pl: 1 }}>
			<b>{label}:</b> {typeof value === "object" ? JSON.stringify(value) : String(value)}
		</Typography>
	);
}

function ProcessStepBlock({ step }) {
	if (!step) return null;
	const d = step.detail || {};
	return (
		<Box sx={{ mb: 1, pl: 1, borderLeft: "2px solid", borderColor: "divider" }}>
			<Typography variant="caption" fontWeight={700} display="block">
				{step.label}
				{step.latencyMs != null ? ` · ${formatMs(step.latencyMs)}` : ""}
			</Typography>
			{step.id === "classifyMessage" && (
				<>
					<LogKv label="Identificado" value={d.identificado} />
					<LogKv label="Modelo" value={`${d.provider || "groq"} / ${d.model || "—"}`} />
					{d.override && <LogKv label="Override" value="sí (prompt_tipo forzado)" />}
					{d.jailbreak && <LogKv label="Jailbreak" value="sí" />}
					{d.parsed && (
						<Box component="pre" sx={{ fontSize: "0.65rem", m: 0.5, p: 0.5, bgcolor: "#0d1117", borderRadius: 0.5, overflow: "auto", maxHeight: 80 }}>
							{JSON.stringify(d.parsed, null, 2)}
						</Box>
					)}
					<LogKv label="Tokens in/out" value={`${d.tokensIn ?? "—"} / ${d.tokensOut ?? "—"}`} />
					<LogKv label="Coste" value={formatUsd(d.estimatedCostUsd)} />
				</>
			)}
			{step.id === "resolveCorpus" && (
				<LogKv label="Corpus" value={(d.corpus || []).join(", ") || "(ninguno)"} />
			)}
			{step.id === "retrieveRag" && (
				<>
					<LogKv label="Usado" value={d.used ? "sí" : "no"} />
					{!d.used && d.skipReason && (
						<LogKv label="Motivo" value={RAG_SKIP_LABELS[d.skipReason] || d.skipReason} />
					)}
					<LogKv label="Chunks" value={d.chunksCount ?? 0} />
					<LogKv label="Contexto" value={`${d.contextChars ?? 0} chars`} />
				</>
			)}
			{step.id === "runAgent" && (
				<>
					<LogKv label="Prompt" value={d.agentFile} />
					<LogKv label="Proveedor" value={`${d.provider || "—"} · ${d.keyLabel || ""}`} />
					<LogKv label="Modelo" value={d.model} />
					<LogKv label="Lease" value={d.leaseId ? `${String(d.leaseId).slice(0, 8)}…` : "—"} />
					<LogKv label="Con RAG en prompt" value={d.conContextoRag ? "sí" : "no"} />
					<LogKv label="Tokens in/out" value={`${d.tokensIn ?? "—"} / ${d.tokensOut ?? "—"}`} />
					<LogKv label="Coste" value={formatUsd(d.estimatedCostUsd)} />
				</>
			)}
			{step.id === "persistTurn" && (
				<>
					<LogKv label="Graph" value={d.graphVersion} />
					<LogKv label="Respuesta" value={`${d.answerChars ?? 0} chars`} />
				</>
			)}
		</Box>
	);
}

function TurnDetailPanel({ row }) {
	const m = row.meta || {};
	const cls = m.classification || {};
	const proc = m.process;
	const parsed = parseClassifierRaw(cls.raw);

	return (
		<Box sx={{ mt: 1, p: 1, bgcolor: "#0d1117", borderRadius: 1, border: 1, borderColor: "primary.dark" }}>
			<Typography variant="caption" fontWeight={700} color="primary.light" display="block" gutterBottom>
				Proceso LangGraph · {m.graphVersion || "—"}
			</Typography>
			{proc?.pipeline?.length > 0 && (
				<Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontSize: "0.65rem" }}>
					{proc.pipeline.join(" → ")}
				</Typography>
			)}
			{proc?.steps?.map((step) => (
				<ProcessStepBlock key={step.id} step={step} />
			))}
			{!proc?.steps?.length && (
				<Box>
					<Typography variant="caption" fontWeight={700}>Clasificación</Typography>
					<LogKv label="tipo_consulta" value={cls.promptTipo || row.promptTipo} />
					<LogKv label="modelo" value={cls.model} />
					{parsed && (
						<Box component="pre" sx={{ fontSize: "0.65rem", m: 0.5, p: 0.5, bgcolor: "#1a2332", borderRadius: 0.5, overflow: "auto", maxHeight: 100 }}>
							{JSON.stringify(parsed, null, 2)}
						</Box>
					)}
					{cls.raw && !parsed && <LogKv label="raw" value={cls.raw} />}
				</Box>
			)}
			<Divider sx={{ my: 1, opacity: 0.2 }} />
			<Typography variant="caption" color="text.secondary">
				Total turno: {formatMs(m.totalLatencyMs)} · {formatUsd(m.totalEstimatedCostUsd)}
			</Typography>
		</Box>
	);
}

function TurnLogPanel({ logs, summary, selectedTurn, onSelectTurn, onRestore, busy, loading }) {
	if (loading) {
		return (
			<Box
				sx={{
					p: 2, border: 1, borderColor: "divider", borderRadius: 1, minHeight: 300,
					display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
				}}
			>
				<CircularProgress size={24} />
				<Typography variant="body2" color="text.secondary">Cargando logs…</Typography>
			</Box>
		);
	}
	if (!logs?.length) {
		return (
			<Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 1, minHeight: 300 }}>
				<Typography variant="subtitle2" gutterBottom>Hilo de logs</Typography>
				<Typography variant="body2" color="text.secondary">
					Sin turnos aún. Al enviar mensajes verás clasificación, agente, tokens y coste estimado.
				</Typography>
			</Box>
		);
	}

	const selCost = selectedTurn != null ? costThroughTurn(logs, selectedTurn) : null;

	return (
		<Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, display: "flex", flexDirection: "column", maxHeight: 640 }}>
			<Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider", bgcolor: "#1a2332" }}>
				<Typography variant="subtitle2" fontWeight={700}>Hilo de logs</Typography>
				<Typography variant="caption" color="text.secondary" display="block">
					{logs.length} turno{logs.length !== 1 ? "s" : ""} · total {formatUsd(summary?.totalEstimatedCostUsd)} · {formatMs(summary?.totalLatencyMs)}
				</Typography>
				{selectedTurn != null && (
					<Typography variant="caption" color="primary.light" display="block" sx={{ mt: 0.5 }}>
						Hasta turno #{selectedTurn}: {formatUsd(selCost?.usd)} · {formatMs(selCost?.ms)}
					</Typography>
				)}
				<Button
					size="small" variant="outlined" sx={{ mt: 1 }}
					disabled={busy || selectedTurn == null}
					onClick={() => onRestore(selectedTurn)}
					title="Elimina turnos posteriores y deja la conversación lista para continuar desde aquí"
				>
					Continuar desde aquí
				</Button>
			</Box>
			<Box sx={{ overflow: "auto", flex: 1, p: 1 }}>
				{logs.map((row) => {
					const m = row.meta || {};
					const cls = m.classification || {};
					const ag = m.agent || {};
					const rag = m.rag;
					const selected = selectedTurn === row.turnIndex;
					return (
						<Box
							key={`${row.turnIndex}-${row.ts}`}
							onClick={() => onSelectTurn(row.turnIndex)}
							sx={{
								mb: 1, p: 1, borderRadius: 1, cursor: "pointer",
								border: 1,
								borderColor: selected ? "primary.main" : "divider",
								bgcolor: selected ? "rgba(25, 118, 210, 0.12)" : "transparent",
								"&:hover": { bgcolor: selected ? "rgba(25, 118, 210, 0.16)" : "rgba(255,255,255,0.04)" },
							}}
						>
							<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, mb: 0.5 }}>
								<Typography variant="caption" fontWeight={700}>#{row.turnIndex}</Typography>
								<Chip size="small" label={row.promptTipo || cls.promptTipo || "?"} sx={{ height: 20, fontSize: "0.65rem" }} />
								<Typography variant="caption" color="success.light">{formatUsd(m.totalEstimatedCostUsd)}</Typography>
							</Box>
							<Typography variant="caption" color="text.secondary" display="block">
								Usuario: {truncatePreview(row.promptText, 56)}
							</Typography>
							<Typography variant="caption" display="block" sx={{ fontSize: "0.68rem", color: "primary.light", mt: 0.25 }}>
								<b>Identificó:</b> {cls.promptTipo || row.promptTipo || "—"}
								{cls.override ? " (override)" : ""}
							</Typography>
							{!selected && (
								<Typography variant="caption" display="block" sx={{ fontSize: "0.65rem", color: "text.secondary", mt: 0.25 }}>
									{formatMs(m.totalLatencyMs)} · Clasif {formatMs(cls.latencyMs)} · Agente {formatMs(ag.latencyMs)}
									{rag?.skipReason && !rag?.used ? ` · RAG: ${RAG_SKIP_LABELS[rag.skipReason] || rag.skipReason}` : ""}
								</Typography>
							)}
							{selected && <TurnDetailPanel row={row} />}
						</Box>
					);
				})}
			</Box>
		</Box>
	);
}

function ConversationPage() {
	const { isAuthenticated, openAuth, username } = useAuth();
	const [items, setItems] = useState([]);
	const [selectedId, setSelectedId] = useState(convFromUrl);
	const [messages, setMessages] = useState([]);
	const [turnos, setTurnos] = useState([]);
	const [logs, setLogs] = useState([]);
	const [logSummary, setLogSummary] = useState(null);
	const [selectedTurn, setSelectedTurn] = useState(null);
	const [prompt, setPrompt] = useState("");
	const [busy, setBusy] = useState(false);
	const [listLoading, setListLoading] = useState(true);
	const [convLoading, setConvLoading] = useState(false);
	const [error, setError] = useState("");
	const [editTitle, setEditTitle] = useState("");

	const selectConv = useCallback((id) => {
		setSelectedId(id);
		setSelectedTurn(null);
		patchState({ conv: id || undefined, page: "conversaciones" });
	}, []);

	const loadLogs = useCallback(async (id) => {
		if (!id) {
			setLogs([]);
			setLogSummary(null);
			return;
		}
		try {
			const data = await getConversationLogs(id);
			setLogs(data.logs || []);
			setLogSummary(data.summary || null);
			const last = (data.logs || [])[data.logs.length - 1];
			if (last) setSelectedTurn((prev) => (prev == null ? last.turnIndex : prev));
		} catch (e) {
			setLogs([]);
			setLogSummary(null);
		}
	}, []);

	const loadOne = useCallback(async (id, syncUrl = true) => {
		setConvLoading(true);
		setError("");
		try {
			const data = await getConversation(id);
			const t = data.body?.turnos || [];
			setSelectedId(id);
			setEditTitle(data.body?.titulo || "");
			setTurnos(t);
			setMessages(turnsToMsgs(t));
			await loadLogs(id);
			if (syncUrl) patchState({ conv: id, page: "conversaciones" });
		} catch (e) {
			setError(e.message);
		} finally {
			setConvLoading(false);
		}
	}, [loadLogs]);

	const refresh = useCallback(async () => {
		if (!isAuthenticated) {
			setItems([]);
			setListLoading(false);
			return;
		}
		setListLoading(true);
		try {
			const data = await listConversations();
			setItems(data.items || []);
		} catch (e) {
			setError(e.message);
		} finally {
			setListLoading(false);
		}
	}, [isAuthenticated]);

	useEffect(() => { refresh(); }, [refresh]);

	useEffect(() => {
		const id = convFromUrl();
		if (id) loadOne(id, false);
	}, [loadOne]);

	useEffect(() => onStateChange(() => {
		const id = convFromUrl();
		if (id !== selectedId) {
			if (id) loadOne(id, false);
			else {
				setSelectedId(null);
				setMessages([]);
				setTurnos([]);
				setLogs([]);
				setLogSummary(null);
				setSelectedTurn(null);
				setEditTitle("");
			}
		}
	}), [selectedId, loadOne]);

	const createNew = async () => {
		if (!isAuthenticated) await openAuth();
		setBusy(true);
		setError("");
		try {
			const data = await createConversation("Nueva conversación");
			const id = data.body?.iconversacion;
			await refresh();
			if (id) {
				setEditTitle(data.body?.titulo || "Nueva conversación");
				setMessages([]);
				setTurnos([]);
				setLogs([]);
				setSelectedTurn(null);
				selectConv(id);
			}
		} catch (e) {
			setError(e.message);
		} finally {
			setBusy(false);
		}
	};

	const removeSelected = async () => {
		if (!selectedId) return;
		if (!confirm("¿Eliminar esta conversación?")) return;
		setBusy(true);
		try {
			await deleteConversation(selectedId);
			selectConv(null);
			setMessages([]);
			setTurnos([]);
			setLogs([]);
			await refresh();
		} catch (e) {
			setError(e.message);
		} finally {
			setBusy(false);
		}
	};

	const saveTitle = async () => {
		if (!selectedId || !editTitle.trim()) return;
		try {
			await patchConversation(selectedId, { titulo: editTitle.trim() });
			await refresh();
		} catch (e) {
			setError(e.message);
		}
	};

	const restoreToTurn = async (throughTurnIndex) => {
		if (!selectedId || throughTurnIndex == null) return;
		const row = logs.find((l) => l.turnIndex === throughTurnIndex);
		if (!row) return;
		if (!confirm(`¿Restaurar la conversación hasta el turno #${throughTurnIndex}? Se eliminarán los turnos posteriores.`)) return;
		setBusy(true);
		setError("");
		try {
			const data = await truncateConversation(selectedId, throughTurnIndex);
			const t = data.turnos || [];
			setTurnos(t);
			setMessages(turnsToMsgs(t));
			setSelectedTurn(throughTurnIndex);
			await loadLogs(selectedId);
			await refresh();
		} catch (e) {
			setError(e.message);
		} finally {
			setBusy(false);
		}
	};

	const send = async () => {
		const text = prompt.trim();
		if (!text || busy) return;
		if (!isAuthenticated) await openAuth();
		if (!selectedId) {
			setError("Crea o selecciona una conversación primero");
			return;
		}
		setPrompt("");
		setBusy(true);
		setError("");
		setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "…" }]);
		try {
			const data = await postMessage(selectedId, text);
			setMessages((m) => {
				const copy = [...m];
				copy[copy.length - 1] = { role: "assistant", content: data.respuesta || "" };
				return copy;
			});
			if (data.titulo) setEditTitle(data.titulo);
			await loadOne(selectedId, false);
			await refresh();
		} catch (e) {
			setError(e.message);
			setMessages((m) => m.slice(0, -1));
		} finally {
			setBusy(false);
		}
	};

	return (
		<Box sx={{ maxWidth: 1480, mx: "auto" }}>
			<LabPage
				title="Lab conversaciones"
				subtitle={`LangGraph · usuario: ${username || "—"}`}
				actions={
					<>
						<Button variant="contained" onClick={createNew} disabled={busy}>Nueva</Button>
						<Button onClick={refresh} disabled={listLoading}>
							{listLoading ? "Cargando…" : "Actualizar"}
						</Button>
					</>
				}
			>
				{error && <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError("")}>{error}</Alert>}
				<Grid container spacing={2}>
					<Grid item xs={12} md={3}>
						<List dense sx={{ maxHeight: 520, overflow: "auto", border: 1, borderColor: "divider", borderRadius: 1 }}>
							{listLoading && (
								<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 4, gap: 1 }}>
									<CircularProgress size={28} />
									<Typography variant="body2" color="text.secondary">Cargando conversaciones…</Typography>
								</Box>
							)}
							{!listLoading && items.length === 0 && (
								<Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
									{isAuthenticated ? "Sin conversaciones. Pulsa Nueva." : "Inicia sesión para ver tus conversaciones."}
								</Typography>
							)}
							{!listLoading && items.map((it) => (
								<ListItemButton
									key={it.iconversacion}
									selected={selectedId === it.iconversacion}
									disabled={convLoading}
									onClick={() => loadOne(it.iconversacion)}
								>
									<ListItemText
										primary={it.titulo || `Conversación #${it.iconversacion}`}
										secondary={`${it.qmensajes || 0} msgs · ${new Date(it.fhultact || it.fhcre).toLocaleString()}`}
									/>
								</ListItemButton>
							))}
						</List>
					</Grid>
					<Grid item xs={12} md={5}>
						{selectedId ? (
							<Box sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}>
								<TextField size="small" fullWidth label="Título" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
								<Button size="small" onClick={saveTitle}>Guardar</Button>
								<IconButton color="error" size="small" onClick={removeSelected} title="Eliminar">
									<i className="fa-solid fa-trash" />
								</IconButton>
							</Box>
						) : (
							<Alert severity="info" sx={{ mb: 1 }}>Selecciona o crea una conversación para chatear con LangGraph.</Alert>
						)}
						<Box sx={{ position: "relative", minHeight: 300, maxHeight: 420, overflow: "auto", border: 1, borderColor: "divider", borderRadius: 1, p: 1, mb: 1 }}>
							{convLoading && (
								<Box
									sx={{
										position: "absolute", inset: 0, zIndex: 1,
										display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
										gap: 1, bgcolor: "rgba(15, 20, 25, 0.72)", borderRadius: 1,
									}}
								>
									<CircularProgress size={28} />
									<Typography variant="body2" color="text.secondary">Cargando conversación…</Typography>
								</Box>
							)}
							{!convLoading && messages.length === 0 && selectedId && (
								<Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
									Sin mensajes. Escribe el primero abajo.
								</Typography>
							)}
							{messages.map((m, i) => (
								<Box key={i} sx={{ mb: 1, p: 1, bgcolor: m.role === "user" ? "#243044" : "transparent", borderRadius: 1 }}>
									<Typography variant="caption" color="text.secondary">{m.role === "user" ? "Tú" : "LangGraph"}</Typography>
									<Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{m.content}</Typography>
								</Box>
							))}
						</Box>
						<Box sx={{ display: "flex", gap: 1 }}>
							<TextField
								fullWidth size="small" value={prompt}
								onChange={(e) => setPrompt(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
								placeholder={selectedId ? "Escribe un mensaje…" : "Crea una conversación primero"}
								disabled={busy || !selectedId}
							/>
							<Button variant="contained" onClick={send} disabled={busy || !selectedId}>
								{busy ? <CircularProgress size={20} /> : "Enviar"}
							</Button>
						</Box>
					</Grid>
					<Grid item xs={12} md={4}>
						<TurnLogPanel
							logs={logs}
							summary={logSummary}
							selectedTurn={selectedTurn}
							onSelectTurn={setSelectedTurn}
							onRestore={restoreToTurn}
							busy={busy || !selectedId}
							loading={convLoading && Boolean(selectedId)}
						/>
					</Grid>
				</Grid>
			</LabPage>
		</Box>
	);
}

window.Lab.ConversationPage = ConversationPage;
