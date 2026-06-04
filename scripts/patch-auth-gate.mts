import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "src/functions");
const skip = new Set(["auth.ts", "health.ts", "swagger.ts"]);

for (const f of fs.readdirSync(dir)) {
	if (!f.endsWith(".ts") || skip.has(f)) continue;
	const file = path.join(dir, f);
	let s = fs.readFileSync(file, "utf8");
	if (!s.includes("optionsResponse") || s.includes("beginHttpRequest")) continue;

	s = s.replace(/import \{([^}]+)\} from "\.\.\/lib\/core\/http\.js";/, (_m, g: string) => {
		const parts = g.split(",").map((x) => x.trim()).filter(Boolean);
		if (!parts.includes("beginHttpRequest")) parts.push("beginHttpRequest");
		return `import { ${parts.join(", ")} } from "../lib/core/http.js";`;
	});

	const re =
		/const origin = request\.headers\.get\("origin"\);\s*\n\s*if \(request\.method === "OPTIONS"\) return optionsResponse\(origin\);/g;
	if (!re.test(s)) {
		console.log("skip pattern", f);
		continue;
	}
	s = s.replace(
		re,
		'const origin = request.headers.get("origin");\n\tconst authBlock = await beginHttpRequest(request, origin);\n\tif (authBlock) return authBlock;',
	);
	fs.writeFileSync(file, s);
	console.log("patched", f);
}
