# Source of Truth — Cognitive Ledger

**Status:** `DRAFT / UNDER_STUDY`
**Date:** 2026-08-21

## Recommended model

Cognitive Ledger should use a hybrid persistence model:

```text
Git repository
user-owned durable source
        ↓
structured Markdown/YAML records
        ↓
indexer / derived database
        ↓
search, timeline and application views
```

The repository is intended to preserve portable, inspectable and versioned records. A database or search index may be added as a derived operational layer for fast queries and UI behavior.

## Canonical versus derived data

### Canonical

- cognitive events;
- source metadata;
- durable raw-source references or approved raw source copies;
- explicit decisions;
- relation identifiers;
- schema/version metadata.

### Derived

- full-text indexes;
- embeddings;
- search caches;
- UI projections;
- ranking scores;
- generated summaries that can be regenerated from canonical records.

Derived systems must not silently become the only copy of user knowledge.

## Portability principle

The user should be able to recover the ledger without depending on one AI provider, one database vendor or one UI.

The long-term architecture should therefore support:

- human-readable export;
- versioned schemas;
- stable identifiers;
- deterministic references between records;
- migration without losing provenance.

## Provenance principle

Every cognitive record should be traceable to a source or explicitly marked as a manually created reflection without external source material.

AI-generated interpretation must not be confused with the original source.

## Privacy boundary

The repository currently needs a private boundary before real personal journal entries or raw conversations are stored.

Until that boundary exists, only product/design documentation and synthetic/example records should be committed.

## Integrity principle

History should be append-oriented. Corrections and evolution should be represented through new records, metadata updates or explicit relations rather than silently rewriting the intellectual history.
