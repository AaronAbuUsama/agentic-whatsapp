# Ambient Harness

## What it is

Ambient Harness is a multiplayer agent. Many agents run inside it, but it presents
as one entity — with a job title, a standing remit, and relationships it maintains
over months. It answers to one person and works alongside a team. It holds
conversations with dozens of people who will never open it, pursues objectives that
take weeks, and does most of its work when nobody is watching.

It is not an assistant you talk to. It is a colleague who happens to be software.

The language is in [`CONTEXT.md`](../CONTEXT.md); every capitalised term below is
defined there. The decisions are in [`docs/adr/`](./adr/). Nothing in this document
is the authority on anything — it is the map, and the ADRs are the territory.

## Why it exists, and why WhatsApp

Real work does not happen in a product. It happens where the people already are,
and for a great many businesses that means WhatsApp — the supplier chat, the dev
group, the customer DM, the community. That is an inconvenient place to build, and
it is why an entire typed session engine (`whatsappd`) had to be written before any
of this could start. WhatsApp is not a feature choice. It is a concession to
reality, and the concession is worth making because a system that cannot reach
people where they actually talk cannot do real work on their behalf.

So WhatsApp is a **channel** into the Space, not the product. Members work in the
Space directly; Correspondents are reached through a channel and never enter it.
Other channels arrive the same way later without reshaping anything
([ADR-0006](./adr/0006-the-space-is-the-place-of-work.md)).

## What a day looks like

The clearest picture of the job comes from a real one. Developer relations at a
protocol company: reaching out to teams who might build on your thing, holding
conversations in a dozen private groups, sitting in your own community answering
questions, validating whether a reported bug is real before it reaches an engineer,
writing an article, building a prototype because something interesting appeared on
your timeline this week.

Half of that has a counterpart and half does not. Some is a five-minute reply; some
runs for a month. Some is code and most is not. It is self-directed within a remit,
and nobody hands you a queue.

That is the shape of work the Harness is for. Not tasks — a **role**.

The second worked example, used throughout the design, is sourcing: an importer
wants coffee suppliers in South America. Research produces forty leads, forty
conversations open, most go nowhere, some become relationships, three become calls.
The same shape from a different industry — and it is the fixture the Mission model
is tested against precisely because it compiles nothing.

## The pieces

A **Master** sets a **Mandate** — the Harness's job title and remit, durable and
rarely edited. Under it, **Missions** run for weeks or months.

Everyone else is either a **Member**, with standing in the Space and the authority
to create work, or a **Correspondent**, who has no standing and is reached through a
channel. Standing belongs to the person, not the channel: a Member instructing the
Harness from a WhatsApp group is still a Member
([ADR-0007](./adr/0007-standing-follows-the-person-not-the-channel.md)).

Inside, the **Director** holds the Mandate, plans Missions, and issues **Briefs**.
It never speaks to anyone; to change what happens in a room it changes the Brief,
not the words.

Each **Thread** — one WhatsApp conversation — has a **Resident**, the Harness's face
in that room. A Resident is deliberately thin: it can act in its Thread, recall from
Knowledge, dispatch work, and think. That list does not grow when the product gains
a domain ([ADR-0003](./adr/0003-residents-are-thin.md)).

Everything else is a **Delegate** — anything work is handed to. A **Specialist** is
a Delegate that owns a domain we do not: a code factory, a mailbox, a calendar. It
advertises what it can do and keeps how it does it to itself.

## How a Resident works

This is the part least like a chatbot.

A Resident does not exist between conversations. Messages accumulate while a Thread
is busy; when it settles, that **Coalesced Window** wakes a Resident which is
constructed fresh, acts, and is disposed. It holds no memory of its own. Continuity
belongs to the Thread, to Knowledge, and to the Briefs
([ADR-0009](./adr/0009-fresh-context-per-unit-of-work.md)).

What it is handed is an **Invocation**: the new activity, a Knowledge bundle that may
draw on _other_ Threads, a bounded slice of this conversation verbatim, its own
recent Private Thoughts, any system notifications, the Briefs live in the room, and
the tools its Grants allow. Because that is the whole input, its behaviour is
reproducible from it — capture one and you can replay exactly what it did.

Every window ends in a **Private Thought**, whether or not it spoke. That single
detail makes the hardest question tractable: silence leaves a record.

Speaking splits in two. Replying when addressed is inherent. **Volunteering is
granted, per Thread** — a Resident that is too quiet is disappointing and fixable,
while one that is too talkative in a real group of colleagues gets muted, and there
is no second first impression
([ADR-0016](./adr/0016-replying-is-inherent-volunteering-is-granted.md)).

## How work gets done

A Mission is planned before it runs, and the order is the point.

**Assertions come first** — statements that must be true for the Mission to have
succeeded, each carrying the condition under which it _fails_ and the evidence that
would settle it. Only then are **Milestones** and **Tickets** decomposed, and a
Mission may not start while any Assertion is unclaimed
([ADR-0008](./adr/0008-a-mission-is-gated-on-assertion-coverage.md)). Writing them
second would let the definition of success be shaped by the plan for achieving it,
and coverage would pass by construction.

A Ticket is executable work, and it may fan out — _"qualify these forty leads"_ is
one Ticket and forty **Briefs**, one per Thread. Validation is not a phase but
scheduled work, owned by a **Validator** drawn from a different model lineage than
the work's author, because an agent checking its own family's work shares its blind
spots
([ADR-0010](./adr/0010-validation-is-scheduled-work-judged-by-a-different-model.md)).

Nothing accumulates context across a Mission. Each unit runs fresh and returns a
**Handoff** — what it did, what it deliberately left undone, the evidence, anything
it noticed outside its Brief, and how its skill held up in practice. Those last two
are how a Mission grows work honestly and how the skill library improves
([ADR-0011](./adr/0011-a-delegate-returns-a-structured-handoff.md)).

The Director wakes on its own stated intent _and_ on a heartbeat. Intent alone is a
single point of permanent failure: one crash before it names its next wake and
nothing in the system could ever start it again
([ADR-0013](./adr/0013-the-director-wakes-on-a-heartbeat-and-on-intent.md)).

## How it remembers

**Knowledge** is the shared brain — evidence-backed, canonical, and the reason many
separately-invoked agents read as one entity. Any agent can be handed context drawn
from every Thread, not only its own. When the Harness talks to someone in one room
and knows what was agreed in another, that is retrieval scope, not magic.

Knowledge is not readable by a person, and we do not try. A browsable mesh of
entities and claims is not comprehensible in a terminal and is barely worth the
effort anywhere. Instead a separate agent **projects** it into pages — one per
person, organisation, project, topic, and Thread. Markdown with wiki links, because
that is cheap to render and easy to navigate, not out of loyalty to any note-taking
app.

The mental model for that surface is **Notion, not Obsidian**. Obsidian is
single-player: one person's notes, kept by whoever keeps them. Notion is
multiplayer, permissioned, holds structure alongside prose, and — decisively — is a
place where work _happens_ rather than a record of work done.

There is a candid reason this matters less than it looks. Nobody reads the company
wiki. The value here is that **agents** read it, continuously and completely, which
is the one readership a knowledge base has never had.

And it is two-way. A page revision is ingested as evidence exactly as a WhatsApp
message is, so a correction can be made where it is noticed and survives the next
rebuild. Only human revisions are ingested — the projector's own writes are
excluded, or the system would cite its own restatements as corroboration
([ADR-0005](./adr/0005-the-page-projection-is-a-source-system.md)).

## How it stays honest

An autonomous agent that talks to strangers and files tickets in your repositories
is a trust surface. Three decisions carry the weight.

**Completion is evidence, not a flag.** A Ticket closes because Knowledge holds
something satisfying its condition, and `explain()` resolves that back to the source.
A Ticket can also be _disputed_ — Rex agreed Thursday, then said Friday — which a
boolean cannot represent and which is ordinary in relationship work.

**Permission is a Grant**: one agent kind, one Specialist skill, one scope. Most
specific wins, absence denies. A Grant bounds both what may be asked _and_ what
context may travel with the asking, so the blast radius of a hostile Specialist is
exactly the scope it was given
([ADR-0014](./adr/0014-a-grant-bounds-context-and-a-specialist-speaks-only-for-itself.md)).

**Authority is the instructing person's, not the agent's.** A Resident acting
because someone asked acts with _that person's_ standing. Rex asks for a bug filed
and it happens; a community member asks the same thing in the same room and it does
not.

## What you see

The terminal client is one view of a long-lived service, not the service itself.
Four workspaces, each answering exactly one question
([the IA doc](./information-architecture.md)):

| Workspace       | The question you opened it to answer          |
| --------------- | --------------------------------------------- |
| Mission Control | What is it trying to do, and is it on track?  |
| Agents          | What can it do, and what is it allowed to do? |

Two more were designed and then cut. **Rooms** was a WhatsApp client, and WhatsApp
is already that. **Wiki** was a page browser, and Obsidian opens those files better
than a terminal will. The workbench covers only what nothing else can show
([ADR-0017](./adr/0017-the-workbench-covers-only-what-nothing-else-does.md)).

Mission Control is the Harness at rest — Mandate, Missions, what is running, the next
wake, the Spend, and `needs-you`: blocked Tickets, validated Milestones, proposals.
A terminal was chosen because it is fast to build and easy to hack on. A web client
is anticipated, and nothing in the model assumes a terminal.

## What is not decided

- **The prompt and context schema.** What a Resident definition, a Brief and an
  Invocation are as artifacts — markdown with structured front matter, so a property
  is both machine-readable and editable from the UI. This gates building.
- **Mission planning as a surface.** Every layout assumes a planned Mission; the
  conversation that produces one has no screen.
- **Repository structure**, and where an Eve project sits relative to this one.
- **Onboarding.** A fresh Harness has no Mandate, no Knowledge, and no idea who
  anyone is.
- Smaller: a Thread page kind for the projection · whether Spend crossing a threshold
  belongs in `needs-you` · multiple WhatsApp accounts, which `whatsappd` models as
  first-class and this design has assumed away.

## What is not built

All of it. Sixteen decisions and no running system.

The next thing is the **Mission system, end to end** — screens, agents, and the
wiring between them. It is chosen as a forcing function rather than a feature:
building it dogfoods Agentic TUI Kit, and it is the only way to find out whether the
architecture above survives contact with reality. Until it runs, every decision here
is a hypothesis.

It will be built **code-first**, because that is what can be validated now. The known
failure mode is that code-first calcifies into code-only — observably what happened
to the system this model learned from, whose machinery is shell commands and browser
automation underneath a claim of generality. The discipline that prevents it:
anything code-specific sits behind a named seam, never in the middle of the model.

---

## Appendix: paths not taken

Recorded so they are not re-proposed and re-argued.

| Tried                                    | Rejected because                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| A wayfinding map of decision tickets     | The grill was faster and the map was overhead                                                                             |
| A global activity feed                   | Answers no question anyone has; activity is always scoped                                                                 |
| Rendering the knowledge graph            | Not comprehensible in a terminal, barely worth it elsewhere                                                               |
| Runtime discovery of Specialists         | Trust defined by whatever answered a lookup. Registration instead                                                         |
| Eve as the Resident runtime              | Dispatch blocks the Thread; a Resident is woken by an assembled Invocation, not a message; its durability is already ours |
| A lease protocol for Specialist liveness | Solves not seeing inside. We host ours, so it is a query. Premature                                                       |
| Per-room prompts                         | Two hundred slightly different bots instead of one entity                                                                 |
| Mission Control as a dense dashboard     | Twice. It is the Harness at rest; a Mission gets its own screen                                                           |
| "Goal" as a term                         | Overlapped Mandate and Mission from both sides                                                                            |
| One store for everything, in git         | Three stores, split by who authors and how long it lives                                                                  |

Three things were stated confidently and wrongly during design, corrected here so
they are not re-inherited: `withEve` is **not** general in-process embedding, only
Next.js/Nuxt/SvelteKit co-mounting; A2A **does** have per-skill authorization via
`AgentSkill.security_requirements`; and Factory's generalisation claim **is** real
and on their site, having been wrongly flagged as fabricated by a research pass that
checked the wrong pages.
