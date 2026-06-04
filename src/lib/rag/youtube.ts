/** Utilidades para citas de transcripciones YouTube en el RAG. */

const VIDEO_ID_RE = /^youtube:([a-zA-Z0-9_-]{11})$/;

export function parseYoutubeSource(source: string): { videoId: string } | null {
	const m = source.match(VIDEO_ID_RE);
	return m ? { videoId: m[1] } : null;
}

export function formatTimestampMs(ms: number): string {
	const totalSec = Math.floor(ms / 1000);
	const msPart = ms % 1000;
	const h = Math.floor(totalSec / 3600);
	const m = Math.floor((totalSec % 3600) / 60);
	const s = totalSec % 60;
	const pad = (n: number, w = 2) => String(n).padStart(w, "0");
	if (h > 0) return `${h}:${pad(m)}:${pad(s)}.${String(msPart).padStart(3, "0")}`;
	return `${pad(m)}:${pad(s)}.${String(msPart).padStart(3, "0")}`;
}

/** Enlace que abre el video en el instante del segmento (`&t=Ns`). */
export function buildYoutubeWatchUrl(videoId: string, startMs?: number | null): string {
	const base = `https://www.youtube.com/watch?v=${videoId}`;
	if (startMs == null || !Number.isFinite(startMs) || startMs < 0) return base;
	const sec = Math.max(0, Math.floor(startMs / 1000));
	return `${base}&t=${sec}s`;
}

export function sourceLabel(source: string, page: string, title?: string): string {
	const yt = parseYoutubeSource(source);
	if (yt) return title ? `${title} · ${page}` : `YouTube ${yt.videoId} · ${page}`;
	return `${source} · pág. ${page}`;
}
