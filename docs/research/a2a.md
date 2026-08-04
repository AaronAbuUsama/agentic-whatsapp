# A2A, and what it costs us

Read against spec 1.0.0 (`a2aproject/A2A/docs/specification.md`) with 1.0.1
released 2026-05-28 as a patch, and the canonical `specification/a2a.proto`.
Linux Foundation governed since June 2025; the TypeScript SDK `@a2a-js/sdk` sits
at 1.0.1 and tracks the spec.

## Why it is worth having at all

Not interoperability in the abstract. A2A earns its place when **a customer
authors an agent after deployment** and a Resident must be able to use it without
having known about it. That is a self-description problem, and an Agent Card
solves it; a bespoke registration format would mean every customer coding to our
proprietary interface.

For two agents we build and host ourselves it buys a task-state vocabulary and a
webhook shape, and little else. The value appears precisely at the point someone
else holds the pen.

## The parts that matter to us

**Per-skill authorization exists.** `AgentSkill` carries its own
`security_requirements` alongside `id`, `name`, `description`, `tags`,
`examples`, `inputModes` and `outputModes` — distinct from the agent-wide
`AgentCard.securityRequirements`. So a Grant scoped to one skill has somewhere to
attach.

**Opacity is a stated principle**, not an accident: agents interoperate "without
needing to share their internal thoughts, plans, or tool implementations." That is
ADR-0003's position arriving from the other direction.

**Results come back as Artifacts, not Messages.** The spec is explicit that
"Messages SHOULD NOT be used to deliver task outputs." Our Handoff is an artifact
in their terms.

**`TASK_STATE_AUTH_REQUIRED`** lets an agent pause mid-task until a credential or
a human approval is obtained out of band, then resume. That is our blocked Ticket
and the `needs-you` queue, already in the protocol.

Task states, nine of them: `SUBMITTED`, `WORKING`, `COMPLETED`, `FAILED`,
`CANCELED`, `INPUT_REQUIRED`, `REJECTED`, `AUTH_REQUIRED`, `UNSPECIFIED`.

## The costs, stated plainly

**Asynchronous completion requires a publicly reachable HTTPS endpoint of ours.**
The client registers a webhook URL and supplies the credentials the server will
echo back. There is no long-polling or broker alternative in the protocol. A
Harness that dispatches to remote Specialists therefore needs an inbound public
surface, which is a deployment fact worth knowing before it is discovered.

**Streaming is explicitly unreliable.** "Clients using streaming to retrieve task
updates MAY not receive all status update messages if the client is disconnected
and then reconnects. Messages MUST NOT be considered a reliable delivery mechanism
for critical information." Progress may be lost, so nothing may depend on it — our
Handoff-on-completion model already assumes this, and should keep assuming it.

**A2A punts everything that hurts in production.** Durability, retries,
idempotency, task retention, billing, identity semantics, and memory are all
explicitly out of scope or left agent-defined. Adopting A2A does not reduce the
durability work; ADR-0009 remains ours to implement.

## What it does not settle

The protocol carries authentication, not trust. It gives a place to attach
credentials and scopes; it says nothing about how much to believe what comes back.
A customer-authored Specialist that reports into a Handoff is writing into
Knowledge under ADR-0011, and A2A offers nothing that stops a confidently wrong
report superseding a true one. That remains ours to decide.
