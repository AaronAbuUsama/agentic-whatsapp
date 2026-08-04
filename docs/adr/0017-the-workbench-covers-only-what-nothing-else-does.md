---
status: accepted
---

# The workbench covers only what nothing else already does

Four workspaces were designed — Mission Control, Rooms, Agents, Wiki. Two of them
were rebuilding tools that already exist and are better.

**Rooms is out.** It was a full WhatsApp client, and WhatsApp is already a full
WhatsApp client, installed on every device the Master owns. Observability into what
was said, and the ability to take over a conversation, come from the account itself.
Building a terminal chat client to watch chats we can already watch is work that
buys nothing.

**Wiki is out.** The projection renders markdown with wiki links, which Obsidian
opens directly and renders better than a terminal can. There is no reason to write
a page browser when the pages are files in a format a good reader already handles.

What remains is what nothing else can show:

- **Missions** — planning, assertions, coverage, milestones, tickets, and what is
  running right now. No existing tool knows these exist.
- **Agents** — defining them, configuring them, granting them, and watching them
  run. Same.

## Consequences

- The layouts drawn for Rooms and Wiki are kept in the IA document as design that
  was done, marked out of scope. They cost nothing to keep and would cost thought
  to redo if a reason to build them appears.
- Private Thoughts still need somewhere to be read, since ADR-0016 rests on being
  able to review a room's unspoken reasoning before granting voice. That surface is
  now unplaced, and it is the one real casualty of dropping Rooms.
- Cross-workspace navigation, which the navigation model treated as a first-class
  case, mostly evaporates. Two workspaces that rarely link to each other need much
  less machinery than four that link constantly.
- A web client, when it arrives, may reasonably make different choices. This is a
  decision about what the terminal workbench is for, not about the product.
