# Information architecture

Expressed in Agentic TUI Kit terms. A **Module** owns one capability, its state,
actions and panels. A **Panel** is typed addressable content. A **Workspace** is
a persistent desktop — a posture, never a route and never an account.

Vocabulary is `CONTEXT.md`. Decisions are `docs/adr/`.

## Workspaces

Each workspace exists to answer exactly one question. If a surface does not
answer its workspace's question, it belongs in a different workspace.

| Workspace       | The question you opened it to answer                       | Default |
| --------------- | ---------------------------------------------------------- | ------- |
| Mission Control | What is it trying to do, and is it on track?               | ✅      |
| Rooms           | What is actually being said — and let me take it from here |         |
| Agents          | What can it do, and what is it allowed to do?              |         |
| Wiki            | What does it currently know?                               |         |

### Mission Control

The Harness at rest: what it is for, what it is pursuing, and what it needs from
you. It is deliberately _not_ a Mission viewer — with several Missions live, one
Mission's Ticket tree is a level down, and cramming both into one screen is the
mistake this design already made once.

- `mandate` — the standing job title and remit, one line here and a Document when
  opened.
- `missions` — every Mission with its progress and Spend.
- `running` — Delegates alive right now, with elapsed time.
- `needs-you` — the human-in-the-loop queue, and the panel that earns the screen.
  Three things land here and nothing else: a Ticket **blocked** wanting a Grant, a
  **Milestone** validated and awaiting a look, and a **proposal** raised on a page
  by a Member. Each is already a first-class concept; this is where they surface.
- `wake` — the next Director wake. Permanent, never collapsed. For a system whose
  correct behaviour includes days of silence, this is the difference between
  "alive, will act Thursday" and "no idea if this is running."
- `spend` — elapsed time and accumulated cost. Missions run for days at many times
  the cost of a session and Members are authorised to spend it.

Opening a Mission gives it the screen:

- `mission:<id>` — its plan as a Document, its Assertions with coverage, its
  Milestones and their Tickets.
- `assertions:<id>` — the contract in full, each Assertion showing met, unmet or
  disputed.

### Rooms

A full WhatsApp client. Not a debug view of one.

- `threads` — the room list, unread and Brief-bearing rooms surfaced.
- `thread:<id>` — the real transcript, with the Resident's Private Thoughts
  shown inline against the Coalesced Window that produced them, and the Briefs
  currently live in the room alongside.
- Takeover is a first-class action here, not an escape hatch.

### Agents

Definitions, not instances. You configure a Resident once; it runs in every
Thread. This workspace is where its role, tools, skills, prompt and autonomy
live — and where a discovered A2A specialist's card is inspected before it is
trusted with work.

- `agents` — every agent kind: locally defined and A2A-discovered.
- `agent:<id>` — role, tools, skills, prompt, model, autonomy grants; for a
  remote specialist, its Agent Card.

### Wiki

The curated projection of the brain, never the brain itself. Pages are prose a
person reads and clicks through — a page per person, organisation, project,
workstream, topic, and one per Thread. The raw knowledge graph is not rendered
here or anywhere else in this application: a browsable mesh of entities, claims
and edges is not comprehensible in a terminal, and is barely worth the effort
elsewhere.

- `wiki` — the vault index.
- `page:<id>` — one curated page, its links live, every factual line carrying its
  canonical record reference.

This is a renderer over the projection's neutral `KnowledgePage` model, which
already names a Knowledge UI as a peer of the Obsidian and Notion renderers. The
Projector that maintains it is a Delegate like any other and is watched from
Mission Control.

## The evidence lens

Knowledge is also, and more often, a lens rather than a place. It opens on
whatever you are already looking at — a message that surprised you, a Private
Thought, a Ticket that closed — and answers "what did it know when it did that,
and what evidence closed this?" over `explain()`.

The lens is the common case. The Wiki is for reading; the lens is for asking.

## Activity is a panel, not a place

There is no global activity river. Activity is always scoped, and it is opened
from the thing it belongs to:

- `activity:agent:<id>` — what this agent kind has been doing everywhere.
- `activity:mission:<id>` — what has moved this Mission.
- `activity:thread:<id>` — every tool call this Thread's Resident has made.

An unscoped feed of everything answers no question anyone actually has. Scoped,
it answers "why did it do that", which is the only reason to look.

## Three shapes

This application holds exactly three shapes of content, and every panel renders
one of them. Most of the substance is prose, not status.

| Shape    | What it is                                   | Renders as                 | Examples                                                                          |
| -------- | -------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------- |
| Document | Authored prose, long-lived, editable         | Markdown reader and editor | Mandate, agent definition, Mission plan, ADR, research output, minutes, wiki page |
| Record   | A small structured item with lifecycle state | List, tree, board          | Ticket, Brief, Grant, Delegate run                                                |
| Stream   | Append-only chronology                       | Transcript                 | Thread messages, activity, Private Thoughts                                       |

Consequences worth holding on to while the layouts are designed:

- A Mission is a Document with Records attached, not a dashboard with a
  description field. Its plan is prose and outlives the screen showing it.
- The Mandate is a Document. Rendering it as a two-line header is a category
  error.
- Records have stages — planned, in flight, validating, settled — so a board is
  a legitimate view of them, not a novelty.
- A Ticket renders the state of its evidence condition, never a checkbox: met,
  unmet, disputed, or blocked naming the Grant it wants. A blocked Ticket is the
  entire approval surface; the Harness states what it could not do rather than
  queueing a request.
- A fan-out collapses to one row. Forty leads is one Ticket and forty Briefs.

## Layouts

Drawn at 86 columns, which is the narrow case; panels grow and the lists gain
columns. Nothing here is dense, and every screen is mostly empty at rest — a
correctly behaving Harness is usually quiet, and a layout that looks broken when
nothing is happening is a layout that will lie to you.

Workspaces are switched by key, never nested. Opening a thing gives it the
screen rather than squeezing it beside its list.

### Mission Control

```
┌ Ambient ────────────────────── wake Thu 09:00 · spend £41.20 · 6d ┐
│ VP of Buying — source and qualify producers across South America  │
└───────────────────────────────────────────────────────────────────┘
┌ Missions ───────────────────────┐┌ Running now ───────────────────┐
│ ● sourcing-south-america  14/22 ││ resident:capxul-devs   4m      │
│ ● client-core-triage       6/9  ││ research:directories  22m      │
│ ◐ devrel-content       planning ││ projector            idle      │
└─────────────────────────────────┘└────────────────────────────────┘
┌ Needs you ────────────────────────────────────────────────────────┐
│ ⚠ sourcing/rank-shortlist   blocked — wants code-factory/file-bug │
│ ⚠ client-core/milestone-2   validated, awaiting your look         │
│ ⚠ devrel-content            proposed by Rex on page "Content plan"│
└───────────────────────────────────────────────────────────────────┘
  m missions  r rooms  a agents  w wiki   ↵ open   ? help
```

`needs-you` is the panel that earns the screen. Exactly three things land in it,
each already a first-class concept: a **Ticket blocked** wanting a Grant, a
**Milestone validated** and awaiting a human look, and a **proposal** raised by a
Member on a page. Nothing else may be added to it — the moment it becomes a
notification feed it stops being a queue you can finish.

### A Mission

```
┌ sourcing-south-america ──── milestone 2 of 4 · 14/22 · £28.10 ────┐
│ ●●●●●●●●●●●●●●○○○○○○○○                                            │
└───────────────────────────────────────────────────────────────────┘
┌ Plan ───────────────────────────┐┌ Assertions ───────── 12/18 met ┐
│ Build a qualified supplier list ││ ✓ A-LEAD-001 forty, sourced    │
│ for Colombia and Peru, ready    ││ ✓ A-LEAD-002 no duplicates     │
│ for outreach.                   ││ ◐ A-LEAD-003 thirty exporting  │
│                                 ││ ! A-CALL-001 three booked  ⚠   │
│ Direct outreach failed in 2025  ││ ○ A-CALL-002 shortlist agreed  │
│ on targeting, not effort…  [↵]  ││                                │
└─────────────────────────────────┘└────────────────────────────────┘
┌ Milestones ───────────────────────────────────────────────────────┐
│ ✓ 1 research     6 tickets   validated 4d ago                     │
│ ◐ 2 qualify     12 tickets   8 done · 3 running · 1 blocked       │
│   3 shortlist    3 tickets   waiting on milestone 2               │
│   4 outreach     1 ticket    waiting                              │
└───────────────────────────────────────────────────────────────────┘
  ↵ milestone   a assertions   l log   p plan   esc back
```

The Plan is a Document and opens full-screen; the panel is a window onto it, not
a summary of it. Assertions show met, unmet, or **disputed** — `A-CALL-001` above
is disputed, which no checkbox could express.

### Rooms

```
┌ Threads ───────┐┌ Capxul Devs ─── 8 members · 1 brief · resident ─┐
│ ● Capxul Devs 2││ Rex      can we get client-core reviewed today? │
│   Rex Adeyemi  ││ Steven   I'll look after standup                │
│ ● Lead #37    1││ ── window closed 14:22 · 6 messages ─────────── │
│   Lead #38     ││ ⟡ thought  Rex wants review and Steven has it.  │
│   Family       ││            Nothing useful to add. Stayed quiet. │
│   …            ││ Priya    anyone got the Huila numbers?          │
│                ││ ⟡ tool   knowledge.recall("Huila volumes")      │
│                ││ Ambient  Huila quoted 12 bags at $4.10 Tuesday. │
└────────────────┘└────────────────────────────────────────────────┘
┌ Live here ────────────────────────────────────────────────────────┐
│ brief   keep client-core unblocked; surface decisions for me      │
│ grants  code-factory/file-bug · code-factory/start-work           │
└───────────────────────────────────────────────────────────────────┘
  t takeover   e evidence   esc back
```

A real client, with the Resident's workings shown inline rather than in a debug
pane: `⟡` marks a Private Thought or a tool call, and window boundaries are drawn
because they are the unit the Resident actually reasoned over. A window where it
chose not to speak still shows its thought — that silence was a decision, and it
is the only place you can see the judgment being exercised.

### Agents

```
┌ Kinds ─────────┐┌ Resident ──────────── running in 41 threads ───┐
│ ● Resident   41││ model   claude-opus-5 · high                    │
│   Director    1││ tools   whatsapp.send/react/read · knowledge    │
│   Researcher  2││         · delegate.dispatch · thought.close     │
│   Projector   1││                                                 │
│ ─ specialists ─││ Grants                                          │
│   code-factory ││   code-factory/file-bug    thread:capxul-devs   │
│   mailbox  off ││   code-factory/start-work  mission:client-core  │
│                ││                                                 │
│                ││ Definition                             [edit ↵] │
│                ││ You are resident in one conversation. You see…  │
└────────────────┘└─────────────────────────────────────────────────┘
  ↵ edit   g grant   v activity   esc back
```

Definitions, not instances — one Resident configured here runs in forty-one
Threads. The tool list is short and fixed by ADR-0003; capability arrives as
Grants over Specialist skills, which is why the Grants block sits directly
beneath the tools and not in a settings screen somewhere.

### Wiki

```
┌ Vault ─────────┐┌ Rex Adeyemi ────────── person · updated 2h ago ─┐
│ people      38 ││ CTO of Capxul. Works mainly in Capxul Devs.     │
│  Rex Adeyemi   ││                                                 │
│  Priya Raval   ││ ## Current                                      │
│ organisations  ││ · Leading the client-core migration        [e]  │
│             61 ││ · Prefers async review over calls          [e]  │
│ projects     7 ││ · Agreed Thursday 15:00 for the call     ⚠ [e]  │
│ threads     41 ││                                                 │
│ topics      22 ││ ⚠ disputed — later said Friday. Two sources.    │
└────────────────┘└─────────────────────────────────────────────────┘
  ↵ open   e evidence   / search   esc back
```

Every factual line carries `[e]` — the evidence lens, one key from anywhere.
Disputed facts render as disputed rather than resolving themselves silently,
because a wiki that quietly picks a winner is worse than one that admits the
conflict.

## Stores and views

A view is not a store, and there is no single universal store behind these
screens. Three stores, distinguished by who authors the content and how long it
lives:

| Store         | Holds                                                           | Authored by                 | Canonical                                                        |
| ------------- | --------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------- |
| Configuration | Mandate, agent definitions, Grants                              | Master                      | Yes, versioned                                                   |
| Knowledge     | Evidence, canonical world view, and the page projection over it | Delegates, ingested sources | Evidence is canonical; the projection is derived and rebuildable |
| Harness state | Tickets, Briefs, Delegate runs, Private Thoughts, wake times    | The runtime                 | Operational, never knowledge                                     |

A vault-style reading surface may present material from all three. That does not
make them one store, and nothing authored may live only in the projection, which
is disposable by design.

Missions and Tickets appear in both Harness state and Knowledge, and this is not
duplication. The runtime owns them for execution — scheduling, status, what runs
next — and emits what happens as evidence, so Knowledge can answer what was
decided and the projection can render a Mission page. It is the same split
`whatsappd` already makes: the Current Mirror owns live chat state while
Knowledge receives the messages as evidence. Neither copy is the other's
authority; they answer different questions.

## Modules

| Module      | Owns                                                              |
| ----------- | ----------------------------------------------------------------- |
| `mandate`   | The Mandate, and the Master's edits to it                         |
| `mission`   | Missions, Tickets, evidence conditions, decomposition             |
| `director`  | The Director's loop, wake scheduling, Brief issue and retirement  |
| `thread`    | Threads, Residents, Coalesced Windows, Private Thoughts, takeover |
| `agent`     | Agent definitions, A2A discovery, tools, skills, autonomy grants  |
| `knowledge` | Context bundles, recall, evidence, explanation                    |

## Actions

Every committed operation is a typed action, invocable identically by the UI, a
keybinding, an application agent, and a test. Actor identity comes from trusted
invocation context — a takeover performed by the Master is recorded as the
Master, never as the Resident.

| Action                               | Module   | Notes                                             |
| ------------------------------------ | -------- | ------------------------------------------------- |
| `mandate.revise`                     | mandate  | Changes what every Mission is authorised by       |
| `mission.plan`                       | mission  | Produces Tickets, each with an evidence condition |
| `mission.pause` / `mission.resume`   | mission  |                                                   |
| `ticket.close`                       | mission  | Master override; ordinary closure is by evidence  |
| `brief.issue` / `brief.retire`       | director | Scoped to a Thread, never owning it               |
| `director.wake`                      | director | Run now rather than at the scheduled wake         |
| `thread.takeover` / `thread.release` | thread   | Master speaks as the Harness                      |
| `thread.send`                        | thread   | Available to Resident and Master alike            |
| `agent.define` / `agent.revise`      | agent    |                                                   |
| `agent.grant` / `agent.revoke`       | agent    | Autonomy, raised and lowered deliberately         |

## Open

- A Thread has no page kind in the projection's `KnowledgePage` model, which
  knows person, organisation, project, workstream and topic. Per-Thread pages
  need one added, or need Threads mapped onto an existing kind.
- Whether `needs-you` should also carry a Mission whose Spend has crossed a
  threshold. Probably yes, and it is the fourth thing that could go in there
  without turning it into a feed.
- Mission planning as a surface. Every layout above assumes a planned Mission;
  the conversation that produces one — assertions written, coverage checked — has
  no screen yet.
