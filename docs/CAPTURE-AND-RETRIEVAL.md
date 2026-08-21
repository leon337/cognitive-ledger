# Capture and Retrieval — Cognitive Ledger

**Status:** `DRAFT / UNDER_STUDY`
**Date:** 2026-08-21

## Capture principle

The initial interaction model is explicit capture.

Examples of user intent:

- “Register this in my journal.”
- “Register only this idea.”
- “This is a decision. Save it.”
- “Register our discussion about X.”

The system should not require the user to specify a schema. It should infer structure from the relevant source scope while preserving provenance.

## Capture pipeline

```text
User request to register
        ↓
Resolve source scope
        ↓
Preserve source/provenance
        ↓
Extract cognitive meaning
        ↓
Classify event type(s)
        ↓
Identify topics/projects/relations
        ↓
Persist Cognitive Record + Source Record
        ↓
Expose in timeline and retrieval index
```

## Cognitive extraction

The extraction should distinguish, when present:

- context;
- central idea;
- decisions;
- hypotheses;
- learning/discoveries;
- conclusions;
- open questions;
- unresolved tensions;
- next steps;
- relationships to prior records.

The objective is not aggressive compression. The record should preserve enough reasoning to make later continuation possible without rereading the full source.

## Source preservation

The system should support both:

1. structured cognitive record;
2. original source or a stable reference to it.

When the raw source cannot or should not be copied, the ledger should still preserve provenance metadata and an external reference if available.

## Retrieval intent

“Read my journal” should not mean loading every entry into context.

The retrieval flow should instead be:

```text
Current user intent
        ↓
Infer relevant topics/projects/time horizon
        ↓
Retrieve recent + semantically related events
        ↓
Prioritize decisions and unresolved questions
        ↓
Follow important relations
        ↓
Return continuity context
```

## Example retrieval questions

The model should eventually support questions such as:

- What was I discussing most recently about this project?
- Which decisions have already been made?
- Which hypotheses remain open?
- How did this product idea evolve?
- What did I change my mind about?
- Which topics repeatedly returned this month?
- What pending next steps did I leave behind?

## Timeline versus graph

The timeline is the first required retrieval surface because chronology is central to the user's recall problem.

A knowledge graph is a later capability. The data model should preserve relation fields from the beginning so graph-like retrieval can be added without replacing the historical ledger.

## Capture modes

### Phase 1 — Explicit

Nothing is registered unless the user asks.

### Candidate future phase — Assisted

The assistant may identify a significant idea, decision or discovery and ask whether it should be registered.

### Candidate future phase — Automatic

Automatic capture would require explicit user policy, strong filtering and clear privacy controls. It is not part of the initial MVP boundary.
