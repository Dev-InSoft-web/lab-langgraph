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

export async function uploadBufferToImgbb(
	filename: string,
	buf: Buffer,
): Promise<ImgbbUploadResult> {
	const crypto = await import("node:crypto");
	const sha1 = crypto.createHash("sha1").update(buf).digest("hex");
	const body = new FormData();
	body.append("key", imgbbApiKey());
	body.append("image", buf.toString("base64"));
	body.append("name", filename.replace(/\.[^.]+$/, ""));
	const res = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body });
	const json = (await res.json()) as {
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
	if (!json.success || !json.data) {
		throw new Error(`imgbb: ${json.error?.message ?? JSON.stringify(json)}`);
	}
	return {
		sha1,
		url: json.data.url,
		display_url: json.data.display_url,
		thumb: json.data.thumb?.url,
		delete_url: json.data.delete_url,
		width: Number(json.data.width),
		height: Number(json.data.height),
		size: json.data.size,
	};
}
