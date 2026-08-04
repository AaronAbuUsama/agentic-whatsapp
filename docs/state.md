# Where this stands

The durable record is `CONTEXT.md` for language, `docs/adr/` for decisions,
`docs/information-architecture.md` for screens, and `docs/research/` for what was
learned from other systems. This file holds what those do not: what is still open,
what was tried and rejected, and what would otherwise have to be re-derived.

Written 2026-08-04, at the end of a long design session.

## The shape, in one paragraph

Ambient Harness is a **multiplayer agent** — many agents inside it, presenting as
one entity, present in many conversations at once and answerable to a Master. It
works inside a **Space**, which is the place: Members, Missions, Tickets and pages
live there, and both people and agents work in it. The Harness is not the Space;
it is the thing that inhabits it. A
**Director** holds the **Mandate**, plans **Missions**, and issues **Briefs**. Each
WhatsApp **Thread** has a **Resident** — stateless, woken by a **Coalesced Window**,
assembled fresh into an **Invocation** each time. Work with no counterpart goes to
**Delegates**; work in a domain we don't own goes to **Specialists**, reached
asynchronously. **Knowledge** is the shared brain, canonical and evidence-backed,
projected into a wiki that is also a source. The TUI has four workspaces and is one
client of a long-lived service.

## Open, ranked

1. **Prompt and context schema.** What a Resident's definition, a Brief and an
   Invocation actually look like as artifacts. Markdown prose with structured front
   matter, so a property is both machine-readable and configurable from the UI. This
   is the next grill and it gates building anything.
2. **Mission planning as a surface.** Every layout assumes a planned Mission. The
   conversation that produces one — assertions drafted, coverage checked, plan
   reviewed — has no screen and no defined participants.
3. **Repo structure.** What is a package, what is an app, where an Eve project sits
   relative to this repo. `packages/mission` was written before this was settled and
   is parked.
4. **Onboarding.** Named in the first pivot, never returned to. A fresh Harness has
   no Mandate, no Knowledge, and no idea who anyone is.
5. **The dispatch payload.** What goes out with a Brief. ADR-0014 bounds it; the
   shape is undefined.
6. **Smaller:** a Thread page kind for the projection · whether Spend crossing a
   threshold belongs in `needs-you` · multiple WhatsApp accounts, which `whatsappd`
   models as first-class and we have assumed away.

## Decided, but not in an ADR

- The Director's name is unloved — reached for as "orchestrator" or "coordinator"
  three times — but deliberately kept for now rather than churned.
- How a Resident decides to speak is prompt engineering, not machinery. It belongs
  in the schema of the prompt, not in a rules engine.
- A docs site is wanted, and wanted _early_, because decisions buried in markdown
  are not decisions anyone will read. Deferred behind getting to a product.
- The coffee-sourcing brief in `~/projects/coffee-business` is a written non-code
  Mission with ten assertions. It is the test fixture for our own Mission module,
  and was parked as a Factory run on inference cost.

## Rejected, and why — do not re-litigate

| Tried                                    | Rejected because                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Wayfinder map of decision tickets        | The grill was faster and the map was overhead                                                                             |
| A global activity feed                   | Answers no question anyone has; activity is always scoped                                                                 |
| Rendering the knowledge graph in the TUI | Not comprehensible in a terminal, and barely worth it elsewhere                                                           |
| Runtime discovery of Specialists         | Trust boundary defined by whatever answered a lookup. Registration instead                                                |
| Eve for Residents                        | Dispatch blocks the Thread; a Resident is woken by an assembled Invocation, not a message; its durability is already ours |
| A lease protocol for Specialist liveness | Solves not being able to see inside. We host ours, so it is a query. Premature                                            |
| Per-room prompts                         | Two hundred slightly different bots instead of one entity                                                                 |
| Mission Control as a dense dashboard     | Twice. It is the Harness at rest; a Mission gets its own screen                                                           |
| "Goal" as a term                         | Overlapped Mandate and Mission from both sides                                                                            |
| One store for everything, in git         | Three stores, split by who authors and how long it lives                                                                  |

## Reversals worth remembering

- **A2A is not premature.** First argued it was, on the premise that every
  Specialist is one we build. The premise was wrong: Members author agents after
  deployment, which is exactly the case A2A exists for.
- **Files-in-git as the single store** was too broad. Configuration, Knowledge and
  Harness state are three stores with different authors and lifetimes.
- **ADR-0001 and ADR-0009 contradicted each other** for several hours — a durable
  Resident versus nothing outliving a unit of work. Resolved: durable identity,
  Briefs and room knowledge; not a durable transcript.

## Corrections to the record

Three things stated confidently and wrongly, corrected so they are not re-inherited:

- **`withEve` is not general in-process embedding.** It is Next.js / Nuxt /
  SvelteKit co-mounting only. A plain Node service runs `eve start` and calls over
  HTTP.
- **A2A does have per-skill authorization.** `AgentSkill.security_requirements`
  exists, separate from the agent-level field.
- **Factory's generalisation claim is real.** A research pass flagged it as
  fabricated after checking two pages that do not contain it; it is legible on
  factory.ai and was quoted from there.

## What next, and why

**Missions, end to end, as the forcing function.** Getting a Mission planned,
validated, executed and shown is a large fraction of the application, and it cannot
be done without settling the agent contracts and building real UI. It drags the
undecided things into the open in the order they actually matter, rather than
deciding them in the abstract.

The immediate blocker on that is item 1 above: the prompt and context schema.
