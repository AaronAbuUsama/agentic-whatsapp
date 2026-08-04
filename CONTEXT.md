# Ambient Harness

This context describes the language of the agentic system that lives above the
WhatsApp substrate. Transport, pairing, the durable mirror and conversation
views belong to `whatsappd` and keep that repository's language; this glossary
never redefines those terms.

## Language

**Ambient Harness**:
The whole system: a multi-agent runtime that presents as one continuous entity,
pursues standing goals of its own accord, and holds relationships with many
people across many WhatsApp threads at once.
_Avoid_: agentic-whatsapp, bot, chatbot, assistant, copilot

**Master**:
The single human the Harness serves and answers to. The Master sets the
Mandate, adjusts autonomy, and may speak into any thread as the Harness.
_Avoid_: user, owner, admin

**Space**:
The multiplayer place where work happens: one Knowledge space together with its
Members, Missions, Tickets and pages. Members and Delegates work in the Space
directly. It is not the terminal desktop of the same name in Agentic TUI Kit.
_Avoid_: workspace, tenant, organisation, team

**Member**:
A person with standing in the Space, carrying a role that says what they may
direct the Harness to do — spend inference, reach a repository, touch sensitive
material. Members create Missions, own Tickets and write pages. Standing belongs
to the person and travels with them: a Member instructing the Harness from a
WhatsApp group is still a Member.
_Avoid_: user, collaborator, teammate

**Correspondent**:
A person the Harness talks to who holds no standing in the Space. Being reached
over WhatsApp does not make someone a Correspondent, and being in a group Thread
with Members does not confer standing — the two are decided independently.
_Avoid_: user, customer, contact, outsider

**Mandate**:
The Harness's job title and remit — what it is for, permanently. "VP of Buying"
is a Mandate. It is durable, edited rarely by the Master, and is the standing
authority every Mission is pursued under.
_Avoid_: system prompt, config, instructions, goal

**Mission**:
One large undertaking pursued under the Mandate, running for weeks or months. A
Mission is planned before it runs: its Assertions are written, its Milestones and
Tickets are decomposed, and any skills it needs are minted into the library. It
does not begin until every Assertion is covered.
_Avoid_: project, epic, sprint, task

**Assertion**:
A statement that must be true for a Mission to have succeeded, written during
planning and before any Ticket exists. It carries four parts: an identifier, the
statement itself, the condition under which it **fails**, and the evidence that
would settle it. The failure condition is what stops a Validator reasoning its way
to a pass. Assertions are the Mission's contract with the Master; Tickets are only
the means, and every Assertion must map to at least one before the Mission runs.
_Avoid_: acceptance criteria, requirement, test, goal

**Milestone**:
An ordered group of Tickets ending in validation, stated as an outcome a person
can check for themselves. Reaching one means the work so far has been examined as
a whole rather than piecewise, and it is where a Member looks before the Mission
carries on without them.
_Avoid_: phase, stage, sprint, checkpoint

**Skill**:
A written procedure an agent may load when it becomes relevant — a description
advertised up front and a body pulled in on demand. Skills are version-controlled
markdown belonging to the Harness, not to whichever runtime happens to load them.
A Mission may mint one for itself, and the Handoffs of every Delegate that ran it
are what revise it.
_Avoid_: prompt, tool, capability, playbook

**Handoff**:
What a Delegate returns when its Brief ends: what it did, what it deliberately
left undone, the evidence it gathered, anything it noticed outside its Brief, and
how its skill held up in practice. Since no session outlives a unit of work, the
Handoff is the whole of what the next one inherits.
_Avoid_: report, summary, result, output

**Knowledge**:
The private, evidence-backed memory substrate shared by every agent in the
Harness, supplied by `@ambient/knowledge`. It is what makes many separately
invoked agents read as one entity: any agent may be given context drawn from
every thread, not only its own.
_Avoid_: database, memory, RAG, context window

**Thread**:
One real WhatsApp conversation — group or direct — treated as a single arena of
relationship, context and discretion. A Thread may pre-exist the Harness or be
originated by it, and it is permanent either way: it outlives every Brief issued
into it. Several unrelated Briefs are normally live in one Thread at once.
_Avoid_: chat, channel, room, Opened Conversation

**Coalesced Window**:
The Thread activity a Resident has not yet seen, accumulated while the Thread was
busy and closed when it settles. It is what wakes the Resident and the newest part
of what it is given, but only one part.
_Avoid_: debounce, buffer, turn, tick

**Invocation**:
Everything a Resident is handed when it wakes, assembled fresh each time because
nothing survives between windows. It carries the Coalesced Window; a Knowledge
context bundle, which may draw on Threads other than this one; a bounded slice of
this Thread's earlier conversation, verbatim; the Resident's own recent Private
Thoughts; any system notifications, including a Delegate asking for something it
needs to continue; the Briefs live in the Thread; and the tools and Specialist
skills its Grants allow.

The Resident itself holds nothing between invocations, so an Invocation is the
whole of its input and its behaviour is reproducible from it. Continuity belongs to
the Thread, to Knowledge and to the Briefs — never to the agent.
_Avoid_: prompt, context window, payload, turn

**Private Thought**:
The Resident's own account of what it observed, produced at the close of every
Coalesced Window whether or not it spoke. It is task-local Harness state, never
canonical Knowledge and never shown to a Correspondent.
_Avoid_: memory, summary, scratchpad, chain of thought

**Director**:
The single agent that holds the Mandate, decomposes Goals, and issues Briefs. It
never speaks to a Correspondent; to change what happens in a Thread it changes
the Brief, not the words.
_Avoid_: master, root agent, orchestrator, supervisor

**Ticket**:
One executable unit of a Mission, carrying the Knowledge condition that closes
it, named when the Mission is planned rather than when the work is done. A
Ticket may be satisfied by work with no Correspondent at all, or fan out into
many Briefs — "qualify these forty leads" is one Ticket and forty Briefs. Its
owner may be a Delegate or a Member; the Harness waiting on a person is ordinary,
not an error state.
_Avoid_: task, issue, todo, step

**Brief**:
A durable, scoped instrument issued by the Director: an objective, the bounds of
discretion inside it, what completion means, and any steps already known.
Tightness is a dial on one instrument — "qualify this lead, use your judgment"
and "ask this number about washed arabica volumes" are the same thing at
different settings. A Brief is scoped to a Thread but never owns it.
_Avoid_: prompt, order, task, instruction

**Delegate**:
Anything work is handed to. The word names the relationship, not a role: a
Resident, a research run, a ticket build, a review, and a remote A2A specialist
are all Delegates. Whether one runs in process or elsewhere is a deployment
fact, not a difference in kind.
_Avoid_: sub-agent, worker, specialist

**Specialist**:
A Delegate that owns a domain the Harness does not otherwise know — a code
factory, a mailbox, a calendar, a research runner. It advertises what it can do
as skills on an Agent Card and keeps its tools to itself; the Harness scopes
what it may be asked, never how it works inside.
_Avoid_: service, integration, plugin, MCP server

**Validator**:
A Delegate whose Brief is to check work it did not do, drawn from a different
model lineage than the work's author. Validation is scheduled as Tickets like any
other work, not performed as a phase that can be skipped.
_Avoid_: reviewer, QA, checker, test

**Spend**:
Inference and service cost, accumulated against a Mission rather than a session,
since no session outlives a unit of work. A Member's authority to spend is a
Grant dimension, and a Mission's accumulated Spend is readable on Mission Control.
_Avoid_: tokens, usage, budget, credits

**Grant**:
Permission for one agent kind to invoke one Specialist skill within one scope —
everywhere, a Thread, or a Mission. The most specific Grant wins and absence
denies. Named autonomy levels are presets that expand into Grants, not a
separate mechanism.
_Avoid_: permission level, role, scope, policy

**Resident**:
The single durable agent of one Thread and the Harness's face there. Durable
means its identity, its Briefs and what is known about the room persist — not its
transcript: the Resident is constructed fresh for each Coalesced Window from that
window's activity, a Knowledge context bundle, material drawn from other Threads,
its live Briefs and its tools, and disposed afterwards. It acts only through tool
calls, chooses whether to speak at all, and closes every window with a Private
Thought.
_Avoid_: root agent, leaf agent, chat agent, thread bot
