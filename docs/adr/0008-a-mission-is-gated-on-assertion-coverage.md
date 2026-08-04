---
status: accepted
---

# A Mission is gated on assertion coverage before it runs

ADR-0002 put an evidence condition on each Ticket. That is necessary and not
sufficient: a set of individually verifiable Tickets can still add up to the
wrong Mission. Factory's Missions gate on the other end — the validation contract
is written first, as assertions, and the plan is refused until every assertion
maps to some unit of work. Their planning phase ends with a literal coverage
check and two review passes over the plan before execution is permitted to start.

We adopt the same order. A Mission's Assertions are written during planning,
before Tickets exist. Decomposition then has a target to satisfy rather than a
blank page, and a Mission may not run while any Assertion is unmapped.

The ordering matters more than it first appears, and Factory give the reason
plainly: "If it had created the features first, the contract would be influenced
by the implementation it had already planned." Writing Assertions second does not
merely risk gaps — it lets the definition of success be quietly shaped by the plan
for achieving it. Coverage is then satisfied by construction and proves nothing.

This is the part that ports beyond code most cleanly. For a sourcing Mission the
assertions are things like _forty leads contacted_, _at least ten responsive_,
_at least five with product photographs_, _at least three calls booked_ —
statements about the world, checkable against Knowledge exactly as ADR-0002
requires, with no test suite anywhere.

## Consequences

- An Assertion nobody can state is a Mission nobody can finish, and it surfaces
  at planning time rather than on day nine.
- The plan is itself reviewable work, and worth reviewing more than once.
- Re-scoping is legible: adding an Assertion mid-Mission visibly uncovers it
  until new Tickets are planned.
- Assertions are the Mission's contract; Tickets are the means. Rewriting a
  Ticket is ordinary, and changing an Assertion is a change of what was promised.
