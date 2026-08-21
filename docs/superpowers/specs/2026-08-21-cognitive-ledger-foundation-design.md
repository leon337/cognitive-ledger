# Cognitive Ledger Foundation Design

**Status:** `DRAFT — awaiting user review`
**Date:** 2026-08-21
**Scope:** product/domain foundation only; no application implementation

## 1. Problem statement

Important ideas, decisions, learning and project context become fragmented across AI chats and other interfaces. Recovering that continuity later creates cognitive effort because the user must remember which chat contained which piece of thinking.

The system should provide an external, user-owned continuity layer that survives individual chats and can be read by an AI assistant on demand.

## 2. Product goal

Create a personal cognitive ledger that can:

- preserve meaningful thought events chronologically;
- retain the source/provenance behind those events;
- distinguish interpretation from source material;
- support later recall across chats and projects;
- preserve the evolution of thinking instead of only the latest state;
- remain portable and not depend on one AI provider.

## 3. Core abstraction

The primary durable unit is a **Cognitive Event**, not a chat or message.

A Cognitive Event consists of two logical layers:

### Cognitive Record

Structured interpretation of the event, including as applicable:

- title;
- context;
- summary;
- central ideas;
- decisions;
- hypotheses;
- learning/discoveries;
- open questions;
- next steps;
- projects/topics;
- relations to prior events.

### Source Record

Provenance supporting the Cognitive Record, including as applicable:

- source type;
- timestamp;
- provider/application;
- conversation/document reference;
- raw source or raw-source reference;
- capture scope;
- content hash.

The system must never present AI interpretation as if it were the original source.

## 4. Capture behavior

The MVP begins with **explicit capture**.

Representative commands:

- “Register this in my journal.”
- “Register only this idea.”
- “This is a decision. Save it.”
- “Register our discussion about X.”

Capture flow:

```text
capture intent
   ↓
resolve relevant source scope
   ↓
preserve provenance/source
   ↓
extract cognitive record
   ↓
classify and relate
   ↓
persist canonical record
   ↓
index for retrieval
```

The user should not need to fill a schema manually.

Automatic capture of every message is explicitly out of scope for the MVP because it risks creating a second noisy history instead of useful memory.

## 5. Retrieval behavior

“Read my journal” should be interpreted as contextual retrieval, not as loading the entire journal.

Retrieval should prioritize:

1. current user intent;
2. relevant projects/topics;
3. recency;
4. explicit decisions;
5. unresolved questions and next steps;
6. semantically related events;
7. important relation chains.

The system should eventually answer both:

- “What is the current state of my thinking?”
- “How did I arrive at this state?”

## 6. Persistence strategy

Recommended architecture: **hybrid, Git-first canonical storage**.

```text
Git repository
canonical structured Markdown/YAML
        ↓
derived index/database
        ↓
search + timeline + application views
```

Canonical records remain inspectable, exportable and versioned. Search indexes, embeddings and UI projections are derived and rebuildable.

## 7. Timeline and relations

The first required product view is chronological retrieval because the user's primary recall problem is temporal continuity.

Relations are stored from the beginning so the system can later provide graph-like navigation without replacing the timeline.

Candidate relation types:

- `relates_to`
- `supports`
- `contradicts`
- `refines`
- `supersedes`
- `originated_from`
- `led_to`
- `resolves`

## 8. History semantics

The ledger is append-oriented.

New thinking should not silently overwrite old thinking. If an idea changes, the previous record remains historically valid and the new record links to it using a relation such as `refines` or `supersedes`.

## 9. Product boundary with MCF

Cognitive Ledger is independent from MCF.

Possible future relationship:

```text
Human thinking
   ↓
Cognitive Ledger
   ↓ relevant continuity/context
MCF
   ↓ outcomes/learning
Cognitive Ledger
```

This is a future integration concept, not an implemented dependency.

## 10. UX/UI process boundary

No final UI decisions are made in this design.

The intended process is:

```text
product concept
→ domain model
→ behaviors
→ journeys
→ MVP requirements
→ Google Stitch brief
→ Stitch UI exploration
→ approved UI
→ implementation
```

Google Stitch should receive a mature behavioral and information brief rather than being asked to invent the product definition.

## 11. Privacy and source handling

The system is expected to contain private journal data and possibly raw conversations.

Therefore:

- private storage is required before real personal entries are committed;
- raw sources should not be copied by default when a stable reference is sufficient;
- third-party or copyrighted source material requires careful provenance/retention rules;
- product/design documentation can be public, but personal canonical data should not share that boundary by default.

At the time of this design, the GitHub repository is public. Real journal entries and raw conversation sources must remain blocked until the storage boundary is made private or an alternative private store is selected.

## 12. Initial repository structure

```text
cognitive-ledger/
├── README.md
├── docs/
│   ├── PRODUCT-VISION.md
│   ├── DOMAIN-MODEL.md
│   ├── CAPTURE-AND-RETRIEVAL.md
│   ├── SOURCE-OF-TRUTH.md
│   ├── STITCH-BRIEF.md
│   └── superpowers/specs/
├── journal/
├── sources/
├── decisions/
└── concepts/
```

## 13. Non-goals for the first implementation boundary

- automatic capture of every chat message;
- full knowledge graph UI;
- autonomous background monitoring of ChatGPT;
- final visual design;
- MCF runtime integration;
- multi-user/enterprise features;
- replacing source applications.

## 14. Success criteria for the first usable MVP

A first usable MVP should allow a user to:

1. create a structured cognitive event from a conversation/source;
2. retain provenance to the source;
3. browse events chronologically with exact timestamp;
4. inspect the detailed cognitive record;
5. search/filter by at least text, topic/project and time;
6. retrieve relevant prior entries for continuation in a new AI conversation;
7. preserve data in an exportable/user-owned canonical format.

## 15. Open product questions

These remain deliberately unresolved and should be handled in subsequent discovery before implementation:

- exact event taxonomy and whether one source can generate multiple events;
- how much raw chat content should be retained by default;
- private Git repository versus separate encrypted/private canonical store;
- how cross-chat source references will be captured reliably;
- whether relationships are user-confirmed, AI-generated, or both;
- editing semantics for mistakes versus intellectual evolution;
- identity/authentication model for the eventual site;
- which retrieval/indexing stack is appropriate for the MVP;
- how the assistant will be authorized to read/write the ledger across different chat contexts.

## 16. Implementation gate

This document is a product/architecture design artifact only.

No application implementation should begin until:

1. the user reviews and approves this design;
2. the remaining blocking discovery questions for the first implementation boundary are resolved;
3. an implementation plan is produced from the approved design;
4. the privacy boundary for real journal data is explicit.
