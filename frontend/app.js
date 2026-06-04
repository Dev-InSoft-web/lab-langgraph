const API = (window.FITDOCS_API_BASE || "http://127.0.0.1:5500/api").replace(/\/$/, "");
const CHAT_KEY = "fitdocs_chat_v1";

const $ = (id) => document.getElementById(id);

function loadChat() {
  try {
    return JSON.parse(sessionStorage.getItem(CHAT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveChat(messages) {
  sessionStorage.setItem(CHAT_KEY, JSON.stringify(messages));
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Extrae números de "Fragmento 2" o "Fragmento 1, Fragmento 2". */
function parseFragmentNums(inner) {
  const nums = [];
  const re = /Fragmento\s+(\d+)/gi;
  let m;
  while ((m = re.exec(inner)) !== null) {
    const n = parseInt(m[1], 10);
    if (n > 0 && !nums.includes(n)) nums.push(n);
  }
  return nums;
}

const CITE_ICON_SVG = `<svg class="cite-badge__icon" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" focusable="false"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2 5 5h-5V4zM8 12h8v2H8v-2zm0 4h5v2H8v-2z"/></svg>`;

function sourceSummary(s) {
  if (!s) return "Sin datos de este fragmento";
  const loc = s.kind === "youtube" ? (s.title ? `${s.title} · ${s.page}` : `${s.source} · ${s.page}`) : `${s.source} · pág. ${s.page}`;
  return s.url ? `${loc} · Ver video` : loc;
}

function citeBadgeHtml(n, sources) {
  const has = sources?.[n - 1];
  const title = sourceSummary(has);
  return `<button type="button" class="cite-badge" data-fragment="${n}" title="${escapeHtml(title)}" aria-label="Fuente ${n}: ${escapeHtml(title)}">${CITE_ICON_SVG}<span class="cite-badge__num">${n}</span></button>`;
}

/** Convierte [Fragmento N] y [Fragmento 1, Fragmento 2, …] en badges con icono + número. */
function linkFragmentCitations(text, sources) {
  return escapeHtml(text).replace(/\[([^\]]+)\]/g, (full, inner) => {
    if (!/Fragmento\s+\d/i.test(inner)) return full;
    const nums = parseFragmentNums(inner);
    if (!nums.length) return full;
    const badges = nums.map((n) => citeBadgeHtml(n, sources));
    return `<span class="cite-group">${badges.join("")}</span>`;
  });
}

function fillCiteBadge(btn, n, sources) {
  const has = sources?.[n - 1];
  const title = sourceSummary(has);
  btn.className = "cite-badge";
  btn.dataset.fragment = String(n);
  btn.title = title;
  btn.setAttribute("aria-label", `Fuente ${n}: ${title}`);
  btn.innerHTML = `${CITE_ICON_SVG}<span class="cite-badge__num">${n}</span>`;
}

function showFragmentModal(index, sources) {
  const s = sources?.[index - 1];
  if (!window.Swal) {
    alert(s ? `${s.source} · pág. ${s.page}\n\n${s.content}` : `Fragmento ${index} no disponible`);
    return;
  }

  if (!s) {
    Swal.fire({
      icon: "warning",
      title: `Fuente ${index}`,
      text: "No hay datos de esta fuente en la última respuesta.",
      customClass: { popup: "fitdocs-swal" },
    });
    return;
  }

  const imgs =
    s.images?.length > 0
      ? `<div class="swal-fragment-images">${s.images
          .map(
            (im) =>
              `<figure><img src="${escapeHtml(im.url)}" alt="Imagen pág. ${escapeHtml(s.page)}" width="${im.width}" height="${im.height}" loading="lazy" /><figcaption>Figura en pág. ${escapeHtml(s.page)}</figcaption></figure>`,
          )
          .join("")}</div>`
      : "";

  const ytLink = s.url
    ? `<p class="swal-fragment-yt"><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">▶ Abrir en YouTube (${escapeHtml(s.page)})</a></p>`
    : "";
  const meta =
    s.kind === "youtube"
      ? `<strong>${escapeHtml(s.title || s.source)}</strong> · ${escapeHtml(s.page)}`
      : `<strong>${escapeHtml(s.source)}</strong> · pág. ${escapeHtml(s.page)}`;

  Swal.fire({
    icon: "info",
    title: `Fuente ${index}`,
    html: `<p class="swal-fragment-meta">${meta}</p>${ytLink}${imgs}<div class="swal-fragment-body">${escapeHtml(s.content)}</div>`,
    width: Math.min(720, s.images?.length ? 640 : 560),
    confirmButtonText: "Cerrar",
    customClass: { popup: "fitdocs-swal" },
  });
}

function renderChat(messages) {
  const chat = $("chat");
  chat.innerHTML = "";

  for (const msg of messages) {
    const div = document.createElement("div");
    div.className = `msg ${msg.role}`;

    const role = document.createElement("div");
    role.className = "role";
    role.textContent = msg.role === "user" ? "Tú" : "Asistente";
    div.appendChild(role);

    const body = document.createElement("div");
    body.className = "msg-body";

    if (msg.role === "assistant" && msg.sources?.length) {
      div._fitdocsSources = msg.sources;
      body.innerHTML = linkFragmentCitations(msg.content, msg.sources);
    } else {
      body.textContent = msg.content;
    }
    div.appendChild(body);

    if (msg.sources?.length) {
      const details = document.createElement("details");
      details.className = "sources";
      const summary = document.createElement("summary");
      summary.textContent = `📚 Fuentes (${msg.sources.length} fragmentos)`;
      details.appendChild(summary);
      const ul = document.createElement("ul");
      for (const s of msg.sources) {
        const li = document.createElement("li");
        const n = s.index ?? msg.sources.indexOf(s) + 1;
        const btn = document.createElement("button");
        btn.type = "button";
        fillCiteBadge(btn, n, msg.sources);
        li.appendChild(btn);
        const label = document.createElement("span");
        label.textContent = ` — ${sourceSummary(s)}`;
        li.appendChild(label);
        if (s.url) {
          const a = document.createElement("a");
          a.href = s.url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.textContent = " Abrir en YouTube";
          a.className = "source-yt-link";
          li.appendChild(a);
        }
        ul.appendChild(li);
      }
      details.appendChild(ul);
      div.appendChild(details);
    }

    chat.appendChild(div);
  }

  chat.scrollTop = chat.scrollHeight;
}

$("chat").addEventListener("click", (ev) => {
  const btn = ev.target.closest(".cite-badge");
  if (!btn) return;
  const msg = btn.closest(".msg");
  const n = parseInt(btn.dataset.fragment, 10);
  if (!n || !msg?._fitdocsSources) return;
  showFragmentModal(n, msg._fitdocsSources);
});

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function checkHealth() {
  try {
    await api("/health");
    $("apiStatus").textContent = `API: ${API}`;
    $("apiStatus").className = "status ok";
  } catch (e) {
    $("apiStatus").textContent = `Sin conexión: ${e.message}`;
    $("apiStatus").className = "status err";
  }
}

async function refreshDocuments() {
  try {
    const data = await api("/documents");
    const list = $("docList");
    list.innerHTML = "";
    const docs = data.documents || [];
    $("noIndexBanner").hidden = docs.length > 0;
    for (const name of docs) {
      const li = document.createElement("li");
      li.textContent = name;
      list.appendChild(li);
    }
  } catch (e) {
    $("indexStatus").textContent = e.message;
    $("indexStatus").className = "status err";
  }
}

$("btnIndex").addEventListener("click", async () => {
  const input = $("pdfInput");
  if (!input.files?.length) {
    $("indexStatus").textContent = "Selecciona al menos un PDF.";
    $("indexStatus").className = "status err";
    return;
  }
  const form = new FormData();
  for (const f of input.files) form.append("files", f, f.name);

  $("btnIndex").disabled = true;
  $("indexStatus").textContent = "Cargando y troceando…";
  $("indexStatus").className = "status";

  try {
    const data = await api("/index", { method: "POST", body: form });
    $("indexStatus").textContent = `✅ ${data.message}`;
    $("indexStatus").className = "status ok";
    saveChat([]);
    renderChat([]);
    await refreshDocuments();
  } catch (e) {
    $("indexStatus").textContent = e.message;
    $("indexStatus").className = "status err";
  } finally {
    $("btnIndex").disabled = false;
  }
});

$("btnRefreshDocs").addEventListener("click", refreshDocuments);

$("btnResetChat").addEventListener("click", () => {
  saveChat([]);
  renderChat([]);
});

$("btnResetIndex").addEventListener("click", async () => {
  if (!confirm("¿Vaciar todos los embeddings en PostgreSQL?")) return;
  try {
    await api("/reset", { method: "DELETE" });
    $("indexStatus").textContent = "Índice vaciado.";
    $("indexStatus").className = "status ok";
    await refreshDocuments();
  } catch (e) {
    $("indexStatus").textContent = e.message;
    $("indexStatus").className = "status err";
  }
});

$("chatForm").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const q = $("questionInput").value.trim();
  if (!q) return;

  const messages = loadChat();
  messages.push({ role: "user", content: q });
  saveChat(messages);
  renderChat(messages);
  $("questionInput").value = "";
  $("btnSend").disabled = true;

  const thinking = { role: "assistant", content: "Buscando en tus documentos…" };
  messages.push(thinking);
  renderChat(messages);

  try {
    const data = await api("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, k: 4 }),
    });
    messages.pop();
    messages.push({
      role: "assistant",
      content: data.answer,
      sources: data.sources,
    });
    saveChat(messages);
    renderChat(messages);
  } catch (e) {
    messages.pop();
    messages.push({ role: "assistant", content: `Error: ${e.message}` });
    saveChat(messages);
    renderChat(messages);
  } finally {
    $("btnSend").disabled = false;
  }
});

renderChat(loadChat());
checkHealth();
refreshDocuments();

/** Azure SignalR — avisos del server sin socket local. */
(async function connectLabSignalR() {
  const el = $("signalrStatus");
  if (!el || !window.LabSignalR) return;
  const userId = sessionStorage.getItem("lab_signalr_user") || `web-${crypto.randomUUID().slice(0, 8)}`;
  sessionStorage.setItem("lab_signalr_user", userId);
  try {
    const client = await LabSignalR.connect({ apiBase: API, userId });
    el.textContent = `SignalR: conectado (${userId})`;
    client.on(LabSignalR.DEFAULT_EVENT, (payload) => {
      const msg =
        typeof payload === "object" && payload !== null
          ? JSON.stringify(payload)
          : String(payload);
      if (window.Swal) Swal.fire({ toast: true, position: "top-end", icon: "info", title: "Lab", text: msg, timer: 5000 });
      else el.textContent = `SignalR: ${msg}`;
    });
  } catch (e) {
    el.textContent = `SignalR: ${e.message}`;
  }
})();
