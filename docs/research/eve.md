# Eve, and what it can and cannot host

Read against the docs at eve.dev (`vercel/eve`, Apache-2.0). Evaluated for one
purpose only: a runtime for Specialists doing bounded work in a sandbox, reached
asynchronously. Residents and the Director are already ruled out by ADR-0012.

## The finding that decides the shape

**Subagents compile at build time.** `agent/subagents/<id>/` with its instructions,
tools, skills and sandbox must exist in the source tree before the app is built.
A `defineDynamic` resolver can turn a subagent on or off per session and swap its
model, but it cannot fabricate an id, a tool set or a skill set that was not
compiled in — "eve always compiles the subagent's filesystem manifest… a non-nil
result injects the returned agent configuration into that compiled manifest."

The built-in `agent` tool spawns a copy of the _root_, inheriting its instructions,
tools, connections and sandbox with fresh history. Its call shape is
`{ message, outputSchema? }` — there is no per-call override of instructions or
skills.

So Eve cannot host a Specialist authored by a Member after deployment. That is not
a gap to work around; it settles which runtime hosts what:

- **Our Specialists** — built by us, shipped with the Harness — can run on Eve.
- **Members' Specialists** — authored post-deployment — are remote, registered, and
  reached over a protocol. Eve's own answer for this is `defineRemoteAgent`
  against a separately deployed app, which is A2A's problem restated.

Neither case requires minting an agent at runtime, so the limitation costs us
nothing once the boundary is drawn in the right place.

## Skills

Content can be fully dynamic — a `defineDynamic` resolver may return markdown read
from an application store, keyed on the caller — but the file declaring the
resolver must exist at build time. `load_skill` only knows names discovered from
the filesystem when compiled, and there is no documented path for a session to
author a new skill and have it become loadable.

This matches where we had already landed: a procedure minted for one Mission
travels in the Brief, and the library is the smaller set that persists.

## Dispatch always parks the calling turn

There is no fire-and-forget within a turn. A subagent call parks the parent until a
result exists. The crucial nuance is that parking is **durable and holds no
compute** — "the workflow suspends and holds no compute until the input it's
waiting on arrives… even if that's much later." Remote agents park on a real
webhook callback.

So the cost of blocking is not compute, it is that the parent cannot do anything
else meanwhile. For a Resident that remains fatal — the Thread goes deaf while it
waits — which is ADR-0012 confirmed rather than softened. For a Mission worker it
is harmless.

Genuine detachment exists but only outside a turn: a schedule may call `receive()`
to start a wholly separate durable session and return immediately.

## Eve documents the pattern we derived independently

Schedules are fixed 5-field cron files, compiled at build time, root-only. There is
no native "wake me at a computed time". Eve's documented answer, on a page called
_Dynamic scheduling_, is: schedule rows in an application store, **one authored
schedule at a one-minute cadence acting as dispatcher**, atomically claim due rows,
`receive()` a session for each.

That is ADR-0013 — a heartbeat plus intent held in state — arrived at from the
other direction. Their delivery note is worth inheriting too: "Delivery is at least
once… side-effecting tasks need application-level idempotency."

## Sandbox

One per durable session, rooted at `/workspace`, reached via `ctx.getSandbox()`.
Persists between turns and reattaches across process restarts and redeploys —
"session sandboxes are keyed per durable session, not per deployment." On Vercel
the VM idles out after ~30 minutes and resumes "as if nothing happened, even days
later"; Docker keeps a long-lived container. Sessions default to a 30-day timeout.

There is no cross-session reattach: a sandbox lives and dies with its session and
is reachable only from inside that session's runtime.

Backends are pluggable — Vercel Sandbox, Docker, microsandbox, and a pure-JS
`just-bash` fallback with no real binaries. Network policy allows per-domain
allow-lists with credential brokering on Vercel and microsandbox only; Docker is
all-or-nothing.

`sandbox.spawn()` gives a long-running process handle with streams, `wait()` and
`kill()`, which is what a code factory actually needs.

## Corrections to earlier assumptions

**`withEve` is not general in-process embedding.** It is documented only as
Next.js / Nuxt / SvelteKit co-mounting — wrapping `next.config.ts` so the agent
deploys with the app. For a plain Node service there is no documented embedding
API; you run `eve start` and call it over HTTP via `eve/client`. Any earlier claim
that Eve can be embedded in an arbitrary process was wrong.

Durability tracks the host rather than the embedding style: locally and under
`eve start` the SDK's local world persists runs to `.eve/.workflow-data` on disk;
on Vercel the same code runs against Vercel Workflow.

## Self-hosting, concretely

`eve build` emits a Nitro server; `eve start` serves it. What you must supply:

- persistent storage mounted at `.eve/.workflow-data`, or a Workflow world package
  such as `@workflow/world-postgres` pinned to the matching protocol line;
- route authentication — `vercelOidc()` is not viable off-Vercel;
- a sandbox backend that is not `vercel()`;
- a proxy forwarding **both** `/eve/` and `/.well-known/workflow/` without path
  rewriting: "a proxy restricted to `/eve/` lets a session start, but the run
  stalls when its callback can't reach eve";
- a live process, since Nitro's schedule runner lives inside it.

Vercel adds managed Workflow with replay preconditions, Cron Jobs generated from
`defineSchedule`, Sandbox with credential brokering, and run observability. Nothing
in the docs grades self-hosted durability as degraded, but the local world is a
disk-backed store whose resilience is whatever volume you put under it.

## Where this leaves the decision

Eve fits a dispatch-and-callback Specialist well, and its sandbox is the part that
would cost us most to build. It cannot host agents our Members author, which is
what the extensibility premise actually needs — so it is one runtime among
several behind the Specialist boundary, exactly as ADR-0003 assumed, and not a
foundation anything else rests on.
