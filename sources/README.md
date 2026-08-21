# Source Storage

This directory is reserved for provenance records and approved raw-source material that supports Cognitive Events.

## Principle

A Cognitive Record answers:

> What did this mean?

A Source Record answers:

> What was actually said or observed, and where did it come from?

These must remain separable.

## Proposed path convention

```text
sources/YYYY/MM/<source-id>.md
```

or, for larger/raw artifacts, a metadata file that references an external durable source instead of duplicating content.

## Source metadata

Suggested fields:

```yaml
schema_version: 1
id: src-...
timestamp: ISO-8601
source_type: chat | document | meeting | note | web | repository | other
provider: string | null
conversation_ref: string | null
external_ref: string | null
capture_scope: excerpt | message | conversation | document
content_hash: string | null
raw_content_in_repo: false
```

## Privacy and copyright

Raw sources can contain private, sensitive or third-party material. They must not be copied into a public repository by default.

When source content should not be stored directly, preserve provenance metadata and a stable reference instead.
