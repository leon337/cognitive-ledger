#!/usr/bin/env bash
set -euo pipefail

if [[ "${COGNITIVE_LEDGER_LAB_CONFIRM:-}" != "1" ]]; then
  echo "Defina COGNITIVE_LEDGER_LAB_CONFIRM=1 para confirmar o banco descartável de laboratório." >&2
  exit 2
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL é obrigatória." >&2
  exit 2
fi

case "$DATABASE_URL" in
  postgresql://*127.0.0.1*/*lab*|postgres://*127.0.0.1*/*lab*|postgresql://*localhost*/*lab*|postgres://*localhost*/*lab*) ;;
  *)
    echo "Recusado: o validador aceita somente banco local cujo nome contenha 'lab'." >&2
    exit 2
    ;;
esac

raiz_script="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

for migration in "$raiz_script"/supabase/migrations/*.sql; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration"
done

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$raiz_script/supabase/seed.sql"

fingerprint_antes="$(psql "$DATABASE_URL" -At -v ON_ERROR_STOP=1 -c \
  "select md5(string_agg(row_to_json(e)::text, '|' order by e.id)) from public.eventos_cognitivos e")"

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$raiz_script/supabase/tests/000_lab_invariants.sql"

fingerprint_depois="$(psql "$DATABASE_URL" -At -v ON_ERROR_STOP=1 -c \
  "select md5(string_agg(row_to_json(e)::text, '|' order by e.id)) from public.eventos_cognitivos e")"

if [[ "$fingerprint_antes" != "$fingerprint_depois" ]]; then
  echo "Falha: a validação read-only alterou Eventos Cognitivos." >&2
  exit 1
fi

echo "Banco lab validado: 3 eventos sintéticos, 0 embeddings e fingerprint imutável."
