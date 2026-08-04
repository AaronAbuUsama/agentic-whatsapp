---
status: accepted
---

# A Delegate returns a structured Handoff, not a summary

ADR-0009 established that nothing survives a unit of work, so what a Delegate
returns is the entire inheritance of whatever comes next. Left to prose, that
becomes a summary written to look complete. Factory's missions carry one JSON
per completed worker with named fields, and reading forty-three of them shows
which fields do the work.

A Handoff carries:

- **what it did**, and a compressed summary the Director actually reads;
- **what it deliberately left undone** — named, because silence here is
  indistinguishable from having finished;
- **the evidence gathered**, as operations performed and what was observed;
- **what it noticed outside its Brief**;
- **how its skill held up**: whether the procedure was followed, where it
  deviated, what should change.

## Two fields carry the system

**Noticing outside the Brief.** A Delegate that spots something beyond its scope
records it and does not act on it. Bounded work stays bounded, and the Director
decides whether the observation becomes a Ticket. This is how a Mission grows
work honestly during a run — in the mission examined, follow-up features appear
mid-run from exactly this channel — and it is the alternative to a Delegate
either quietly overreaching or silently discarding what it saw.

**Skill feedback.** Every Delegate reports on the skill it ran. That is the only
mechanism by which the skill library improves: a skill that is repeatedly
deviated from in the same way is a skill that is wrong, and without this field
nobody ever finds out. Missions "getting better at your domain the more you use
it" is this field and nothing more mysterious.

## Consequences

- Handoffs are structured records, queryable across a Mission. "Which Briefs left
  something undone" is a question with an answer.
- A Delegate never silently expands its own scope, and never silently drops a
  finding.
- Skills are revised from evidence rather than intuition, and a Mission's skill
  usage is reviewable after the fact.
- What a Delegate observed is evidence and belongs in Knowledge; what it left
  undone is operational and belongs in Harness state. The Handoff is written once
  and read into both.
