# Ambient Harness architecture handoff

## Purpose

This is the durable handoff for the future Ambient Harness application. It is deliberately stored
outside `agentic-tui-kit`: the TUI framework must not pretend that Ambient's WhatsApp, knowledge,
agent-orchestration, or A2A design is already a generic framework feature.

Nothing here claims that A2A or the root-agent runtime is implemented. The current implementation
sources are Agentic TUI Kit, the Notes proof, and the Cognee/WhatsApp knowledge spike.

## Product topology

Ambient is a long-lived service that continues to ingest WhatsApp events and run agents when no
TUI is connected. OpenTUI SSH sessions are temporary clients of that service.

The service owns:

- WhatsApp connections and persisted source events;
- one private root-agent state per WhatsApp chat;
- message coalescing and root-run scheduling;
- Ambient Knowledge access and automatic context injection;
- delegated-task connections and progress events;
- durable outbound WhatsApp operations;
- the SSH listener and per-connection TUI sessions.

Disconnecting an SSH client destroys only that client's renderer, focus, panels, and layout.

## Root agent

Each WhatsApp chat has a root agent. It maintains that chat's conversational coherence and is the
only agent that speaks directly into that chat.

Messages and other events are persisted, then grouped by a debounce/coalescing window. A closed
input window starts one bounded, multi-step root-agent run. The run is not one decision. It may:

- inspect several messages from several participants;
- send several independent WhatsApp messages;
- reply to particular messages;
- add reactions;
- start specialist tasks;
- inspect, message, or cancel existing tasks;
- consume specialist progress or final artifacts;
- finish without speaking.

All WhatsApp communication is performed through first-party actions/tools. The model's terminal
output is not posted automatically.

The run finishes with structured private continuation state: a compact summary, open task IDs,
follow-ups, and an optional next wake time. This is task-local working state, not hidden
chain-of-thought and not canonical shared knowledge.

The root uses the AI SDK directly. It does not embed Eve and it does not perform long-running work.

## Root-run durability

Durability does not keep a JavaScript function alive. It lets a replacement process recover what
was accepted, what completed, and what can safely continue.

Root runs are persisted at model/tool boundaries, not token boundaries:

1. persist the claimed input window and model transcript;
2. record a tool-call intent before execution;
3. execute external writes with a stable idempotency key;
4. persist the explicit action receipt/tool result;
5. append the result to the run transcript;
6. continue the AI SDK loop;
7. persist terminal status and structured continuation.

A per-chat lease prevents concurrent root runs. Expired leases are recoverable. Unknown external
write outcomes must be reconciled rather than blindly repeated.

## Specialist agents and A2A

Specialist agents own their own prompts, tools, state, task lifecycle, durability, and artifacts.
They never speak directly in a user's WhatsApp chat. The root interprets their progress and results
for the conversation.

A specialist may run locally or remotely and may be built with Eve or another runtime. A2A is the
planned interoperability boundary because these agents are independently owned and have stateful,
potentially long-running task lifecycles. Separate deployment is possible but not required.

A2A supplies discovery and task communication; it does not implement the specialist's internal
durability. The specialist runtime remains responsible for recovery.

No A2A code exists yet. Do not force A2A into Agentic TUI Kit or the Notes example merely to prove
the idea. Prove it in Ambient Harness with the first real specialist.

## Knowledge boundaries

Ambient Knowledge is the private, canonical, evidence-backed memory substrate shared by product
agents. It is not the WhatsApp root agent and it is not the Obsidian/Notion knowledge base.

The root receives automatic, capability-limited context from Ambient Knowledge. It does not receive
canonical maintenance or projection tools.

A separate knowledge-projection agent maintains the human-readable knowledge base. It consumes the
ordered Ambient Knowledge change feed, curates neutral page records, and renders Obsidian first and
potentially Notion later. It may also accept explicit curation tasks from a root agent through A2A.

The knowledge-projection agent is the first credible Ambient specialist: it has its own lifecycle,
tools, durable jobs, and artifacts, while the root only sees task progress and results.

The authoritative knowledge work remains under `spikes/cognee-whatsapp`, especially
`AMBIENT_KNOWLEDGE_PRODUCT_CONTEXT.md` and `AMBIENT_KNOWLEDGE_PRODUCT_MAP.md`.

## Framework/application boundary

Agentic TUI Kit should supply reusable terminal application machinery:

- actions and explicit receipts;
- modules, panels, windows, workspaces, and shell composition;
- reusable UI components including the controlled agent transcript;
- headless driving and evidence capture;
- host-neutral rendering and an OpenTUI SSH host;
- a small optional AI SDK projection from selected action handles to tools, if proven by Notes.

Ambient Harness supplies the product runtime described above. Eve and A2A adapters belong with the
specialist/application runtime until a second real application proves a reusable package boundary.

## First Ambient vertical slice

After Agentic TUI Kit is published:

1. persist WhatsApp events and coalesce one busy group-chat input window;
2. run one direct-AI-SDK root loop that replies, reacts, checks a task, and delegates work;
3. journal tool calls/results and prove restart without duplicated WhatsApp writes;
4. persist structured continuation for the next root run;
5. expose one Eve knowledge-projection specialist through A2A;
6. feed specialist updates back into the root inbox;
7. observe the entire system through an SSH-hosted TUI without coupling service lifetime to SSH.

## Explicit non-decisions

- The A2A SDK, binding, authentication, and Agent Card layout have not been selected.
- Dynamic capability discovery versus an initial configured allowlist has not been selected.
- The root-run database schema and queue implementation have not been selected.
- Eve is not mandated for every specialist; it is a preferred first specialist runtime to prove.
- MCP is not part of the current design.
- Skills and coding-agent plugins remain post-publishing.
