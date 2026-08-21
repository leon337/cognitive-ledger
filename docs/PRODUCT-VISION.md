# Product Vision — Cognitive Ledger

**Status:** `DRAFT / UNDER_STUDY`
**Date:** 2026-08-21

## Problem

Important thinking is fragmented across chats, projects and interfaces. A useful idea, decision or learning can become difficult to recover because it remains tied to the conversation where it happened.

The product should preserve continuity independently of any single chat application or AI model.

## Product thesis

Cognitive Ledger is a user-owned cognitive continuity layer that records, organizes and connects ideas, decisions, learning, hypotheses, projects and the evolution of thought over time.

The simplest formulation is:

> Your thinking should not be trapped in the chat where it happened.

## What it is not

Cognitive Ledger is not intended to be:

- a simple transcript archive;
- a replacement for ChatGPT history;
- a generic notes application;
- a copy of every assistant response;
- a memory feature owned by one AI provider.

## Core model

A conversation is a source. The durable unit is a **cognitive event**.

A cognitive event preserves two complementary layers:

1. **Cognitive Record** — the meaning extracted from the source: context, ideas, decisions, hypotheses, conclusions, open questions and next steps.
2. **Source Record** — provenance and, when allowed, the raw source that supports the cognitive record.

This separation allows fast recall without losing the ability to inspect what was actually said.

## Primary capabilities

The product should eventually support:

- chronological timeline of cognitive events;
- capture on explicit request such as “register this in my journal”;
- source provenance;
- structured summaries optimized for later recall;
- retrieval by topic, project, time and semantic relation;
- reconstruction of how an idea evolved;
- distinction between ideas, hypotheses, decisions and learning;
- cross-chat continuity for AI assistants;
- future graph-like relationships between entries;
- exportable/user-owned data.

## Product boundary

The product is intentionally separate from MCF.

Conceptually:

```text
Human intent and thinking
        ↓
Cognitive Ledger
memory, ideas, continuity
        ↓
MCF
coordination and execution
        ↓
Tools and external systems
```

A future integration may allow Cognitive Ledger to provide relevant context to MCF and receive outcomes/learning back from MCF, but neither system should silently become the other's source of truth.

## UX/UI boundary

This discovery phase defines behavior, information architecture, domain concepts and requirements. Visual design is intentionally deferred.

Once the product model is sufficiently mature, a dedicated brief will be prepared for Google Stitch. The approved Stitch output may then guide implementation of the UI.

## Current principle of capture

The initial default is **explicit capture**, not automatic capture of every message.

The product should optimize for useful memory, not produce another infinite stream of low-value history.

Future intelligent capture may suggest registering a significant idea or decision, but full automation is not part of the initial design boundary.
