---
status: accepted
---

# Standing follows the person, and a Resident acts with the instructor's authority

Treating WhatsApp as the outside world was wrong. A DM with a customer, a group
Thread with the internal team, and a group Thread with community members are
three different trust situations reached through one transport. Standing is
therefore a property of the person, modelled once in the Space, and it travels
with them into every channel: a Member instructing the Harness from a WhatsApp
group is still a Member, and a Correspondent sitting in a Thread full of Members
gains nothing by being there.

When a Resident acts because someone asked it to, it acts **with that person's
authority, not its own**. Effective permission is the intersection of the Grants
the agent holds and the authority the instructing person carries. Both sides deny
by default.

- Rex asks the Resident in the dev group to file a bug. Rex's role permits it and
  the Resident holds `code-factory/file-bug` there. It happens.
- A community member asks for the same thing in the same Thread. The Resident's
  Grant is unchanged and still irrelevant, because the instruction carries no
  authority. It does not happen.

## Consequences

- This rests entirely on identity resolution being correct. A sender must be
  resolved to a Person before their authority can be read, which joins
  `whatsappd`'s Address Resolution to Knowledge's identity model. A
  misidentification is a privilege escalation, so resolution must fail closed and
  an unresolved sender carries no standing.
- Grants and roles answer one question — who may cause what to happen — for
  agents and people alike, and are enforced at the same point.
- Group Threads are the interesting case and must be handled per message, not per
  Thread. Authority cannot be cached on the room.
