---
status: accepted
---

# Every unit of work runs in a fresh session; handoff is durable state

A Mission runs for days. Factory report a median mission of about two hours, 14%
over twenty-four, and a longest of sixteen days — impossible if the work shares
one context. Their answer is that each feature gets "a fresh worker session with
clean context, so no single session has to hold the entire project in its head",
with serial execution and only targeted parallelism, and coordination between
sessions through git as the source of truth rather than through conversation.

We take the same shape. A Delegate is constructed for one Ticket, given what it
needs, and disposed. A Resident is woken for one Coalesced Window and disposed.
Nothing accumulates context across a Mission, because nothing lives that long.

Our substrate is not git, and must not become it. Git is theirs because their
product is a repository; ours is work of many kinds, most of which compiles
nothing. Handoff here runs through Knowledge and Harness state: what a Ticket
concluded is evidence, what remains is a Record. A session that dies mid-work
loses only its own reasoning, and its successor reads the same durable state a
fresh session would.

Where a Mission does produce something that lives outside both — a repository, a
sandbox, a rendered document — that artifact belongs to the Specialist doing the
work, whose internals are opaque to us under ADR-0003. The Harness holds a
reference to it as evidence and never a copy. A code Mission therefore does use
git, inside the code factory, and the Harness remains ignorant of it.

## Consequences

- Cost and duration are properties of a Mission, not a session, and both belong
  on screen. Factory measure missions at roughly twelve times the tokens of an
  ordinary session; a Member authorised to spend needs to see that accumulating.
- Parallelism is a deliberate choice per Mission, not the default. Serial with
  targeted fan-out is the proven shape; forty Briefs against forty Threads is a
  fan-out that earns itself, forty concurrent planners is not.
- Resumption is free. If handoff is durable state, restarting is the same
  operation as continuing.
- Nothing may depend on an agent "remembering" across units of work. If it
  matters later, it is written down as evidence or as a Record.
