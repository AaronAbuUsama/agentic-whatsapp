---
status: accepted
---

# Tickets declare their evidence condition before work starts

A Mission is only autonomously executable if "done" is decidable without the
Master. We take the decomposition pattern from coding factories, where a ticket
is verifiable because tests and review make it so, and port the verifiability to
work that produces no diff — a call arranged, a lead qualified, a bug triaged.
Every Ticket therefore names, at planning time, the Knowledge condition that
closes it; completion is a query against that condition, not a flag an agent
sets.

## Consequences

- A Mission plan can be judged before any work happens: a Ticket whose evidence
  condition cannot be stated is a Ticket nobody knows how to finish.
- Completion carries a receipt. `explain(recordId)` resolves a closed Ticket back
  to the source spans that closed it, because Knowledge keeps evidence with the
  assertion.
- A Ticket can become **disputed** rather than merely open or closed — Rex agrees
  Thursday, then says Friday — which a boolean cannot represent and which is
  ordinary in relationship work.
- A reviewing Delegate remains available for genuinely subjective output, and
  Master acceptance remains available, but both are exceptions. Every Ticket that
  needs the Master is autonomy not gained.
