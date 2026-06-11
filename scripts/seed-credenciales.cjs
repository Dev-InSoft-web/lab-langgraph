// Crea la tabla credenciales en langlab y registra todas las credenciales del entorno.
// Uso: node scripts/seed-credenciales.cjs
const { Client } = require("pg");
const vals = require("../local.settings.json").Values;

const URL = vals.LANGLAB_DATABASE_URL;

const filas = [
  ["LAB_JWT_SECRET", "Secreto para firmar JWT del lab-langgraph (auth local y staging)", vals.LAB_JWT_SECRET],
  ["LAB_AUTH_REQUIRED", "Exigir autenticación JWT en endpoints del lab", vals.LAB_AUTH_REQUIRED],
  ["SIGNALR_HUB_NAME", "Nombre del hub SignalR del lab", vals.SIGNALR_HUB_NAME],
  ["LANGLAB_DATABASE_URL", "PostgreSQL principal del lab (Neon, BD neondb) — migrado desde Render", URL],
  ["NEON_DATABASE_URL", "PostgreSQL en Neon (neondb, pooler us-east-1)", vals.NEON_DATABASE_URL],
  ["LANGLAB_DATABASE_URL_RENDER_OLD", "Antiguo PostgreSQL en Render (langlab) — reemplazado por Neon", vals.LANGLAB_DATABASE_URL_RENDER_OLD],
  ["CLOUDFLARE_ACCOUNT_ID", "Cuenta Cloudflare (Workers/R2/Images) — proyecto flsjeff", vals.FILESTORE_ACCOUNT_ID],
  ["CLOUDFLARE_API_TOKEN", "API token Cloudflare (Workers/R2/Images) — proyecto flsjeff", vals.FILESTORE_API_TOKEN],
  ["FILESTORE_PROVIDER", "Proveedor de almacenamiento de archivos (flsjeff)", vals.FILESTORE_PROVIDER],
  ["FILESTORE_BUCKET", "Bucket R2 para binarios (flsjeff)", vals.FILESTORE_BUCKET],
  ["FLSJEFF_API_URL", "URL pública del Worker flsjeff (workers.dev) — la actualiza el workflow al desplegar", vals.FLSJEFF_API_URL],
  ["CLIENTESIS_MSSQL_HOST", "Servidor MSSQL de ClientesIS", vals.CLIENTESIS_MSSQL_HOST],
  ["CLIENTESIS_MSSQL_PORT", "Puerto MSSQL de ClientesIS", vals.CLIENTESIS_MSSQL_PORT],
  ["CLIENTESIS_MSSQL_USER", "Usuario MSSQL de ClientesIS", vals.CLIENTESIS_MSSQL_USER],
  ["CLIENTESIS_MSSQL_PASS", "Contraseña MSSQL de ClientesIS", vals.CLIENTESIS_MSSQL_PASS],
  ["CLIENTESIS_MSSQL_DB", "Base de datos MSSQL de ClientesIS", vals.CLIENTESIS_MSSQL_DB],
  ["PATY_MSSQL_HOST", "Servidor MSSQL de PatyIA (AyudasCP)", vals.PATY_MSSQL_HOST],
  ["PATY_MSSQL_PORT", "Puerto MSSQL de PatyIA", vals.PATY_MSSQL_PORT],
  ["PATY_MSSQL_USER", "Usuario MSSQL de PatyIA", vals.PATY_MSSQL_USER],
  ["PATY_MSSQL_PASS", "Contraseña MSSQL de PatyIA", vals.PATY_MSSQL_PASS],
  ["PATY_MSSQL_DB", "Base de datos MSSQL de PatyIA (staging)", vals.PATY_MSSQL_DB],
  ["CEREBRAS_API_KEY", "API key Cerebras (inferencia LLM) — principal", vals.CEREBRAS_API_KEY],
  ["CEREBRAS_API_KEY_2", "API key Cerebras — respaldo/rotación", vals.CEREBRAS_API_KEY_2],
  ["COHERE_API_KEY", "API key Cohere (embeddings/rerank) — principal", vals.COHERE_API_KEY],
  ["COHERE_API_KEY_2", "API key Cohere — respaldo/rotación", vals.COHERE_API_KEY_2],
  ["DEEPSEEK_API_KEY", "API key DeepSeek (LLM) — principal", vals.DEEPSEEK_API_KEY],
  ["DEEPSEEK_API_KEY_2", "API key DeepSeek — respaldo/rotación", vals.DEEPSEEK_API_KEY_2],
  ["GEMINI_API_KEY", "API key Google Gemini — principal", vals.GEMINI_API_KEY],
  ["GEMINI_API_KEY_2", "API key Google Gemini — respaldo/rotación", vals.GEMINI_API_KEY_2],
  ["GROQ_API_KEY", "API key Groq (LLM/whisper) — principal", vals.GROQ_API_KEY],
  ["GROQ_API_KEY_2", "API key Groq — respaldo/rotación", vals.GROQ_API_KEY_2],
  ["HUGGINGFACE_API_KEY", "API key Hugging Face (embeddings/modelos) — principal", vals.HUGGINGFACE_API_KEY],
  ["HUGGINGFACE_API_KEY_2", "API key Hugging Face — respaldo/rotación", vals.HUGGINGFACE_API_KEY_2],
  ["MINIMAX_API_KEY", "API key MiniMax (LLM)", vals.MINIMAX_API_KEY],
  ["OPENROUTER_API_KEY", "API key OpenRouter (router multi-modelo) — principal", vals.OPENROUTER_API_KEY],
  ["OPENROUTER_API_KEY_2", "API key OpenRouter — respaldo/rotación", vals.OPENROUTER_API_KEY_2],
];

async function main() {
  const client = new Client({ connectionString: URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  // Nomenclatura: tablas y columnas en MAYÚSCULA SOSTENIDA (requieren comillas dobles en Postgres).
  await client.query('DROP TABLE IF EXISTS credenciales');
  await client.query(`
    CREATE TABLE IF NOT EXISTS "CREDENCIALES" (
      "ID" SERIAL PRIMARY KEY,
      "NOMBRE" TEXT NOT NULL UNIQUE,
      "DESCRIPCION" TEXT NOT NULL,
      "VALOR" TEXT NOT NULL,
      "CREADO_EN" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "ACTUALIZADO_EN" TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
  let n = 0;
  for (const [nombre, descripcion, valor] of filas) {
    if (!valor) continue;
    await client.query(
      `INSERT INTO "CREDENCIALES" ("NOMBRE","DESCRIPCION","VALOR") VALUES ($1,$2,$3)
       ON CONFLICT ("NOMBRE") DO UPDATE SET "DESCRIPCION"=EXCLUDED."DESCRIPCION", "VALOR"=EXCLUDED."VALOR", "ACTUALIZADO_EN"=now()`,
      [nombre, descripcion, valor]
    );
    n++;
  }
  const { rows } = await client.query('SELECT count(*)::int AS total FROM "CREDENCIALES"');
  console.log(`OK: ${n} credenciales upsert. Total en tabla: ${rows[0].total}`);
  await client.end();
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
