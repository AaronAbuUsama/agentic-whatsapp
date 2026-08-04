---
status: accepted
---

# A Grant bounds what a Specialist may be told, and its Handoff is its own claim

Specialists are authored by Members after deployment (ADR-0004), so a Specialist
is code we did not write, sitting in two dangerous positions at once.

**Inbound.** A Grant said which skill a Resident may invoke and nothing about what
may travel with the call. But a Resident's dispatch carries context assembled from
Knowledge, and that bundle deliberately spans Threads — retrieval scopes by
participant identity and project precisely so it can. Unbounded, a dispatch to a
customer-authored agent is an export of private material from rooms that agent has
nothing to do with.

A Grant's scope therefore bounds **both**: where a skill may be used, and what
context the dispatch may carry. A code factory granted in `thread:capxul-devs`
receives that Thread's context and no other. The blast radius of a hostile or
careless Specialist becomes exactly the scope it was granted, which is readable on
one screen and revocable in one action.

**Outbound.** A Delegate's Handoff becomes evidence (ADR-0011), and evidence
reconciles and supersedes (ADR-0005). Left alone, a confidently wrong Specialist
does not merely add noise — it can overturn things that were true. We already
refused to let the Projector's own output return as corroboration; this is the
same failure with a third party holding the pen.

So a Specialist's Handoff enters Knowledge as **that Specialist's claim**,
attributed and carrying the trust its registration confers, never as first-party
fact. The substrate already supports this: assertions carry an epistemic state,
confidence, and the ability to be disputed rather than silently believed.

## Consequences

- Grant scope is one mechanism doing two jobs, not a second concept. What a
  Specialist may be asked and what it may be shown are the same question asked
  twice.
- A Specialist cannot launder an assertion into fact. Where its claim conflicts
  with better-attributed evidence, the conflict is recorded and surfaces as
  disputed.
- Attribution has to survive the whole path — dispatch, Handoff, ingestion — and
  cannot be reconstructed later. A protocol carries authentication, not trust;
  what to believe is ours to decide and ours to record.
- Registering a Specialist is consequential, not administrative. It grants both an
  audience and a voice, and the Agents workspace should show both.
