# Domain Model — Cognitive Ledger

**Status:** `DRAFT / UNDER_STUDY`
**Date:** 2026-08-21

## Central entity: Cognitive Event

A Cognitive Event is the durable unit of the ledger. It represents a meaningful occurrence in the evolution of thought, not merely a chat message.

Suggested fields:

```yaml
id: string
timestamp: ISO-8601
type: idea | decision | hypothesis | learning | discovery | reflection | project_update | question | synthesis
status: active | superseded | resolved | archived
title: string
summary: string
context: string
topics: [string]
projects: [string]
ideas: [string]
decisions: [string]
hypotheses: [string]
open_questions: [string]
next_steps: [string]
relations: [relation]
source_refs: [source_ref]
created_by: human | ai | system
```

This schema is provisional and should remain evolvable during discovery.

## Source Record

A Source Record represents the provenance behind one or more cognitive events.

Possible fields:

```yaml
id: string
timestamp: ISO-8601
source_type: chat | document | meeting | note | web | repository | other
provider: string | null
conversation_ref: string | null
external_ref: string | null
raw_content_ref: string | null
content_hash: string | null
capture_scope: excerpt | message | conversation | document
```

The raw source and the cognitive interpretation must remain separable.

## Relation

Relations should support reconstructing the evolution of thinking.

Candidate relation types:

```text
relates_to
supports
contradicts
refines
supersedes
originated_from
led_to
implements
questions
resolves
```

A relation should point to another cognitive event, concept, project or decision.

## Project

A project is a contextual grouping, not the primary unit of memory. One cognitive event can belong to zero, one or multiple projects.

Examples might include a product, research effort or personal initiative. The ledger must not require every thought to fit a project.

## Topic

Topics are lightweight semantic labels used for discovery and retrieval. They should not become a rigid taxonomy in the MVP.

## Decision

A decision may initially be represented as a Cognitive Event with `type: decision`. If decision-specific workflows later justify a separate entity, the model can evolve without breaking the event ledger.

## Concept

A concept represents a durable subject whose meaning may evolve across multiple events. Concepts are candidates for the future knowledge graph but are not required for the first timeline implementation.

## Principle: history should not be overwritten

The ledger should preserve intellectual evolution.

If a later idea supersedes an earlier one, the earlier event remains part of the timeline and is linked through a relation such as `supersedes`.

The system should therefore answer both:

- “What do I currently think?”
- “How did I arrive here?”
