---
status: accepted
---

# A Thread owns a durable Resident; Briefs are issued into it

A Thread is a real, permanent WhatsApp conversation, not scaffolding a Goal
erects and tears down. It accumulates relationship and history whether or not
the Harness currently wants anything there, and several unrelated Briefs are
normally live in one Thread at once — organising a meeting, chasing an action
item, and answering a support question can all be in flight in the same room.
So the Thread is the durable thing: it owns one long-lived Resident, and the
Director issues Briefs into that Resident and retires them out of it.

## Considered Options

- **One primitive: a Thread is a resource an agent holds for the life of a
  Brief.** Rejected. It makes the Thread disposable, which is false, and it
  needs arbitration the moment two Briefs want the same room.
- **Two primitives: permanent agents for pre-existing Threads, disposable ones
  for Threads the Harness originates.** Rejected. A Thread opened to qualify a
  supplier does not stop mattering once the supplier is qualified; the
  relationship outlives the errand that started it.

## Consequences

- A Resident exists for a Thread with no Brief active at all. Its standing
  discretion — whether this conversation deserves a word right now — is part of
  being resident, not part of any Brief.
- Work with no counterpart is not second-class and not homeless: it is carried
  by Delegates that hold no Thread, and its durable output lands in Knowledge.
- Briefs are scoped to a Thread but do not own it, so retiring a Brief never
  discards what the Harness knows about the room.
