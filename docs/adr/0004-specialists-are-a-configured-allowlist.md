---
status: accepted
---

# Specialists are a configured allowlist, not runtime discovery

`ARCHITECTURE_HANDOFF.md:136` left dynamic capability discovery versus a
configured allowlist unselected. We select the allowlist. Specialists are
registered in the Agents workspace, and a Resident's invocation carries the
skills its Grants allow and no others.

Discovery is rejected on two grounds. An agent that resolves capability at
runtime has a trust boundary defined by whatever answered a lookup, and this
agent talks to strangers all day. More prosaically, discovery solves a problem
we do not have: Specialists are things we build or deliberately adopt, there
will be a handful, and each arrives with credentials that had to be configured
anyway.

## Consequences

- "What is this system allowed to do" has an answer that can be read off a
  screen.
- Discovery remains available later as a proposal mechanism — found agents
  appearing as candidates that are unusable until granted. That is this decision
  plus a queue, so nothing here has to be undone to get it.
- The allowlist is edited at runtime and this is the point, not a concession. A
  Space's Members author Specialists after deployment and register them, which is
  an attributed action under ADR-0007, and Residents may then use agents that did
  not exist when they were written — ADR-0003 already assembles the reachable
  skills per invocation. Registration is extensibility; discovery would have been
  an open door.
