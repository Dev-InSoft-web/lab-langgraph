export const LAB_JWT_EXPIRY_DAYS = 30;

export type LabJwtClaims = {
	sub: string;
	username: string;
	exp?: number;
	iat?: number;
	[key: string]: unknown;
};

async function jose() {
	return import("jose");
}

function secretBytes(): Uint8Array {
	const raw = process.env.LAB_JWT_SECRET?.trim();
	if (!raw) {
		throw new Error("LAB_JWT_SECRET no configurado");
	}
	return new TextEncoder().encode(raw);
}

export function labAuthRequired(): boolean {
	const v = process.env.LAB_AUTH_REQUIRED?.trim().toLowerCase();
	if (v === "false" || v === "0" || v === "off") return false;
	return true;
}

export async function signLabJwt(username: string): Promise<{ token: string; expiresAt: string }> {
	const now = Math.floor(Date.now() / 1000);
	const exp = now + LAB_JWT_EXPIRY_DAYS * 24 * 60 * 60;
	const { SignJWT } = await jose();
	const token = await new SignJWT({ username })
		.setProtectedHeader({ alg: "HS256" })
		.setSubject(username)
		.setIssuedAt(now)
		.setExpirationTime(exp)
		.sign(secretBytes());
	return { token, expiresAt: new Date(exp * 1000).toISOString() };
}

export async function verifyLabJwt(token: string): Promise<LabJwtClaims> {
	const { jwtVerify } = await jose();
	const { payload } = await jwtVerify(token, secretBytes(), { algorithms: ["HS256"] });
	const username = String(payload.username ?? payload.sub ?? "").trim();
	if (!username) throw new Error("JWT sin usuario");
	return { ...payload, sub: String(payload.sub ?? username), username };
}

export function bearerTokenFromRequest(authHeader: string | null): string | null {
	if (!authHeader) return null;
	const m = authHeader.match(/^Bearer\s+(.+)$/i);
	return m?.[1]?.trim() || null;
}
