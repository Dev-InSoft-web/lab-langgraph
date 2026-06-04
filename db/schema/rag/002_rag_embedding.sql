CREATE SCHEMA IF NOT EXISTS bd_rag;

COMMENT ON SCHEMA bd_rag IS 'Corpus vectorizado. BD dedicada RAG_DATABASE_URL.';

CREATE TABLE IF NOT EXISTS bd_rag.rag_index_run (
	iid BIGSERIAL PRIMARY KEY,
	profile TEXT NOT NULL,
	sourcetype TEXT NOT NULL DEFAULT 'unknown',
	sourceid TEXT NOT NULL DEFAULT '',
	chunksadded INT NOT NULL DEFAULT 0,
	startedat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	finishedat TIMESTAMPTZ,
	meta JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS ix_rag_index_run_profile
	ON bd_rag.rag_index_run (profile, startedat DESC);

CREATE TABLE IF NOT EXISTS bd_rag.rag_vec_contapyme (
	id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
	content TEXT,
	metadata JSONB,
	embedding vector(384)
);

CREATE INDEX IF NOT EXISTS ix_rag_vec_contapyme_embedding
	ON bd_rag.rag_vec_contapyme USING hnsw (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS bd_rag.rag_vec_fitdocs (
	id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
	content TEXT,
	metadata JSONB,
	embedding vector(384)
);

CREATE INDEX IF NOT EXISTS ix_rag_vec_fitdocs_embedding
	ON bd_rag.rag_vec_fitdocs USING hnsw (embedding vector_cosine_ops);
