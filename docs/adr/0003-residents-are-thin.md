---
status: accepted
---

# Residents are thin; domain capability arrives as dispatchable skills

A Resident's job is knowing what is happening in one room and whether to speak.
If it also held the tools for GitHub, then email, then calendars, then whatever
the next line of business needs, its tool surface would grow without limit and
every one of those tools would ship in the prompt of an agent that mostly needs
to exercise conversational judgment. So a Resident's tool surface is fixed and
small, and domain capability reaches it only as skills it may dispatch to other
agents.

A Resident may:

- act in its Thread — send, reply, react, mark read;
- recall from Knowledge beyond the context bundle it was given;
- dispatch work to a Delegate or a remote specialist;
- close its Coalesced Window with a Private Thought.

That list does not grow when the product gains a domain. Adding GitHub support
means registering a specialist, not teaching every Resident about GitHub.

## Consequences

- The Resident's prompt is stable across every domain the product ever gains.
  Which specialists are reachable, and what they can do, arrives as part of each
  invocation alongside the Knowledge context bundle.
- Grants are over other agents' skills, not over tools:
  `(agent kind, specialist, skill, scope)`, most specific scope wins, absence
  denies.
- The protocol's opacity is load-bearing rather than a limitation. A specialist's
  internal tools are its own business; we scope what we may ask of it, and it
  enforces what it will accept.
- A specialist that needs an answer mid-task can get one, because the Resident
  can relay the question into its Thread and return the reply.
