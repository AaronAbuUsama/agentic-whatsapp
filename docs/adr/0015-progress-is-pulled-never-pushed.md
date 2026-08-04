---
status: accepted
---

# Progress is pulled on demand, never pushed

A Resident dispatches work and returns. It does not wait, and nothing reports back
to it while the work runs — because there is nothing to report to. A Resident
exists only for the duration of a Coalesced Window (ADR-0012), so between windows
there is no process for a progress event to arrive at.

Progress is therefore a **tool the Resident may call**, used when a Correspondent
asks. "Any news on that bug?" causes a status lookup; nothing else does. The
common case — nobody asks — costs nothing at all.

What comes back is coarse and deliberately so: which stage the work is in, how long
it has been there, how much has been done. Not tool calls, not transcripts, not the
Specialist's reasoning. ADR-0003 makes a Specialist's internals its own business,
and a Resident's context is too scarce to spend on someone else's working.

## A request for something is pushed

One thing is different in kind and is not progress at all: a Delegate that needs
something to continue — a decision, a credential, an approval. That is not slow
work, it is stopped work, and nobody will discover it by not asking.

So a request is **pushed**, and it goes wherever the work came from:

- Dispatched from a Thread, it enters that Thread's next **Coalesced Window**,
  alongside the messages. The Resident is woken by it and can put the question to
  the room, which is the whole reason the Resident is the one holding that
  relationship.
- Dispatched by the Director for a Mission, it becomes a **blocked Ticket** and
  surfaces in `needs-you` on Mission Control, where a blocked Ticket already lives.

Both destinations exist already. Nothing new is needed to carry a question home.

## Consequences

- The dispatch returns a handle, and the handle is what a later status lookup and
  the eventual Handoff are keyed to.
- Completion does not interrupt anyone. A finished Delegate writes its Handoff into
  Harness state, and whoever next has reason to care — the Director on its next
  wake, a Resident asked a question — reads it there.
- The unreliability of streamed updates in any transport becomes irrelevant rather
  than dangerous, since nothing depends on receiving them.
- Liveness needs no protocol of its own for work we host: whether something is
  running is a query against our own state. Should a remote Specialist ever stall
  in a way that a status query cannot distinguish from progress, the answer is
  idempotent re-dispatch — which `ARCHITECTURE_HANDOFF.md:63` already requires of
  external writes — and not a mechanism invented before the problem exists.
