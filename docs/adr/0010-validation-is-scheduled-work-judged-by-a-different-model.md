---
status: accepted
---

# Validation is scheduled work, judged by a different model lineage

Factory schedule validation as ordinary items in the work queue rather than as a
phase around it: their feature list interleaves `window-management`,
`os-actions`, then `scrutiny-validator-window-os-actions` and
`user-testing-validator-window-os-actions`, each with preconditions naming the
work it checks. And they judge with a different model family than the one that
did the work — Opus orchestrates and builds, GPT-5.3-Codex validates.

Both are adopted. A validation Ticket is a Ticket: it is planned, scheduled,
owned, and closes against evidence like any other, and it names in its
preconditions the Tickets it checks. Nothing is validated by a phase that could
be skipped when the schedule slips, because there is no phase to skip.

The model rule is a correctness stance, not a preference. An agent checking its
own family's work shares its blind spots, and validation exists precisely to
catch what the worker could not see. Vibe Proxy gives the Harness every major
model, so role-to-model assignment is configuration, and a Mission's validators
must not be drawn from the lineage that produced the work.

## Consequences

- Two kinds of validation Ticket are worth distinguishing, as Factory do: one
  that reviews the work and its assertions, and one that exercises the result the
  way a person would. The second catches what no assertion was written for.
- Model assignment is per role and visible in the Agents workspace, so "who
  judged this" is answerable.
- Validation appears in Mission Control as work with a duration and a cost, which
  is honest — it is a substantial share of both.
- A Milestone is where validation Tickets cluster, which is what makes reaching
  one meaningful rather than arithmetic.
