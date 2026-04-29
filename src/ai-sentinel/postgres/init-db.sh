#!/usr/bin/env bash
set -e

echo "==> Ejecutando script manual con EMBEDDING_SIZE=${EMBEDDING_SIZE}"

psql -v ON_ERROR_STOP=1 \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" <<SQL

-- Crear extensión vector
CREATE EXTENSION IF NOT EXISTS vector;

-- Crear tabla documents
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY,
  "pageContent" text,
  metadata jsonb,
  embedding vector(${EMBEDDING_SIZE})
);

-- Crear índice vectorial
CREATE INDEX IF NOT EXISTS documents_embedding_idx
ON public.documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

ANALYZE public.documents;

SQL

echo "==> Script finalizado correctamente."
echo ">>> INIT POSTGRES TERMINADO <<<"
