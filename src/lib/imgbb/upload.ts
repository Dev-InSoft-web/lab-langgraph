export type ImgbbUploadResult = {
	sha1: string;
	url: string;
	display_url?: string;
	thumb?: string;
	delete_url?: string;
	width: number;
	height: number;
	size?: number;
};

export function imgbbApiKey(): string {
	const key = process.env.IMGBB_API_KEY?.trim();
	if (!key) throw new Error("IMGBB_API_KEY no configurada");
	return key;
}

type ImgbbApiJson = {
	success?: boolean;
	data?: {
		url: string;
		display_url: string;
		thumb?: { url: string };
		delete_url?: string;
		width: number;
		height: number;
		size?: number;
	};
	error?: { message?: string };
};

function parseImgbbResponse(json: ImgbbApiJson, contentSha1: string): ImgbbUploadResult {
	if (!json.success || !json.data) {
		throw new Error(`imgbb: ${json.error?.message ?? JSON.stringify(json)}`);
	}
	return {
		sha1: contentSha1,
		url: json.data.url,
		display_url: json.data.display_url,
		thumb: json.data.thumb?.url,
		delete_url: json.data.delete_url,
		width: Number(json.data.width),
		height: Number(json.data.height),
		size: json.data.size,
	};
}

async function postImgbb(image: string, name: string): Promise<ImgbbApiJson> {
	const body = new FormData();
	body.append("key", imgbbApiKey());
	body.append("image", image);
	body.append("name", name);
	const res = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body });
	return (await res.json()) as ImgbbApiJson;
}

export async function uploadBufferToImgbb(
	filename: string,
	buf: Buffer,
): Promise<ImgbbUploadResult> {
	const crypto = await import("node:crypto");
	const sha1 = crypto.createHash("sha1").update(buf).digest("hex");
	const json = await postImgbb(buf.toString("base64"), filename.replace(/\.[^.]+$/, ""));
	return parseImgbbResponse(json, sha1);
}

/**
 * Sube a imgbb desde URL remota (p. ej. mermaid.ink).
 * La API acepta URL en el campo `image` (POST, hasta 32 MB).
 */
export async function uploadUrlToImgbb(
	filename: string,
	imageUrl: string,
): Promise<ImgbbUploadResult> {
	const crypto = await import("node:crypto");
	const sha1 = crypto.createHash("sha1").update(imageUrl, "utf8").digest("hex");
	const json = await postImgbb(imageUrl, filename.replace(/\.[^.]+$/, ""));
	return parseImgbbResponse(json, sha1);
}
