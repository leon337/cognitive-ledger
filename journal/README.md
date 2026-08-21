# Journal Storage

This directory will contain structured Cognitive Events organized chronologically.

## Proposed path convention

```text
journal/YYYY/MM/<timestamp>-<slug>.md
```

Example:

```text
journal/2026/08/2026-08-21T014900-0300-continuity-between-ai-chats.md
```

## Record shape

Each file should contain machine-readable frontmatter and human-readable content.

Example schema:

```yaml
---
schema_version: 1
id: ce-2026-08-21-014900-001
timestamp: 2026-08-21T01:49:00-03:00
type: idea
status: active
title: Example title
topics: []
projects: []
source_refs: []
relations: []
created_by: ai
---
```

The Markdown body should preserve context, summary, ideas, decisions, hypotheses, open questions and next steps as applicable.

## Current privacy gate

The repository is currently public. Do not commit real personal journal entries here until the storage boundary is made private or another private canonical store is explicitly selected.

Synthetic records may be used for design/testing.
