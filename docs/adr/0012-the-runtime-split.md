---
status: accepted
---

# Residents and the Director run on the AI SDK in process; Eve hosts what is relocatable

Eve is a strong fit for durable backend agents and a poor fit for a Resident.
Three reasons, in descending order of how badly they bite:

**Dispatch must not block.** A Resident closes its Coalesced Window and returns,
while the work it dispatched continues elsewhere. Eve's subagent call blocks the
turn that made it, so a Resident that started a research run would leave the
Thread deaf until it finished. A room going unresponsive because the Harness is
thinking about something else is not a tuning problem; it is the wrong shape.

**A Resident is not woken by a message.** It is woken by a settled batch of them,
together with a Knowledge context bundle and material drawn from other Threads.
Eve's channel model owns webhook reception and returns a response; ours assembles
an invocation from four sources and may legitimately produce no message at all.
Little of the channel abstraction survives that.

**The durability on offer is durability we already have.** Eve's session survives
restarts by preserving the session. Ours survives because the Harness manages the
context itself and keeps what matters in Knowledge and Harness state — which
ADR-0009 requires anyway, and which is why a Resident's transcript does not need
to outlive its window.

The same reasoning carries the Director. It wakes, reads durable state, decides,
writes, and sleeps; its continuity is its state, not its session.

## The split

- **In the service, on the AI SDK**: the Director and every Resident. They act
  through the application's own actions, and their durability is Harness state.
- **Eve**: agents that are relocatable — hosted elsewhere, added and removed over
  time, given their own sandbox and lifecycle. That is the Specialist of ADR-0003,
  and the axis is **ownership**, not durability.
- **Dispatch is always asynchronous.** Whatever runs a Delegate, handing work to
  it returns immediately and the result arrives as a Handoff.

## Consequences

- The Resident's invocation assembly — window, Knowledge bundle, cross-Thread
  material, live Briefs, tools — is ours to build and is not a channel adapter.
- Eve's `connections/` offers MCP and OpenAPI to Specialists at no cost to us,
  which makes `ARCHITECTURE_HANDOFF.md:139` ("MCP is not part of the current
  design") a decision worth revisiting on the Specialist side of the boundary.
- Mission workers are a separate question from Residents: they hold no
  conversation, so blocking is harmless, and Eve's sandbox is exactly what code
  work needs.
- A Skill is data — a description, a body, and optional accompanying files — so
  minting one per Mission does not require the runtime to register anything. A
  procedure written for one Mission travels in the Brief and dies with it; the
  library is the smaller set that persists across Missions and is revised by
  Handoffs. Whether a runtime can define agents dynamically is therefore worth
  knowing but does not gate the choice.
