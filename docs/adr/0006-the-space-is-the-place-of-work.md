---
status: accepted
---

# The Space is the place of work; WhatsApp is a channel to those outside it

The inherited architecture treated WhatsApp as the product. It is not. WhatsApp
carries so much of the work because that is where the people already are, which
is why a whole session engine had to be built to reach it — not because a chat
transport is a good place to run a company. Internal work wants a place with
missions, boards, pages and owners.

That place is the Space, and Members and Delegates both work in it. WhatsApp is a
channel into the Space for Correspondents, who have no standing in it and will
never enter it. Other channels arrive the same way later without reshaping
anything.

Work is therefore created by authority, not by prose. A Member creates a Mission
through an attributed action carrying their role; a page written by anyone
remains evidence and may propose, but proposing is not directing. This keeps
ADR-0005's ingestion path from doubling as a privilege escalation path.

## The model is Notion, not Obsidian

The reading surface was first imagined as an Obsidian vault, and that was the wrong
picture. Obsidian is single-player: one person's notes, one person's links, a
record kept by whoever keeps it. Notion is the right analogy on every axis that
matters here.

It is **multiplayer** — colleagues write pages, and a page's author matters, which
is exactly what ADR-0005 requires of an ingested revision. It is **permissioned** —
not everyone is invited, and not everyone sees every page, so the scoping we need
is ordinary rather than exotic. It holds **structure alongside prose** — databases,
tables and boards live next to documents, which is why Missions, Tickets and people
belong on the same surface as written pages rather than in a separate application.
And decisively, a company's Notion is not a record of work, it is **a place where
work happens**: things are assigned, tracked and picked up there.

That last property is what makes the Space a place rather than a report. Wiki links
and markdown survive from the Obsidian picture; the single-player, read-only,
record-keeping assumptions do not.

## Consequences

- A Ticket may be owned by a Member. The Harness waiting on a person is an
  ordinary state, not a failure, and a person completing work is evidence like
  any other.
- The Director is no longer the only origin of Missions, but the Mandate remains
  the only authority the Director acts under.
- **The model is multiplayer from the first commit; the first client is not.**
  Every action is attributed to a principal, which Knowledge already scopes by
  (`spaceId`, `principalId`). The TUI ships for the Master alone. Retrofitting
  attribution later would touch every action; shipping one client now costs
  nothing.
- Membership and page scoping follow ordinary conventions and are deliberately
  not designed here.
- A web client is anticipated. Nothing in the model may assume a terminal.
