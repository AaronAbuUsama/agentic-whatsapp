---
status: accepted
---

# The page projection is a source system, for human revisions only

The projection was specified one-way: Knowledge renders pages, pages never
return. That makes a correction impossible to record where it is noticed — you
read a wrong line on a page and have nowhere to put the fix, and patching the
page directly is silently reverted by the next rebuild.

A page revision is therefore ingested exactly as a WhatsApp message or a GitHub
event is: a source item, reconciled like any other evidence, superseding what it
contradicts. No new write path is added, and
`AMBIENT_KNOWLEDGE_PRODUCT_CONTEXT.md:26` already permits it — downstream
writers submit source material through ingestion rather than touching canonical
rows.

This also makes pages multiplayer. A page authored by a person is that person's
assertion, not agent output, so the vault becomes a surface people write into
rather than a report they read.

## Consequences

- **Only human-authored revisions are ingested.** The Projector's own writes are
  derived and excluded, or the system cites its own restatements as
  corroboration and confidence inflates out of nothing.
- A correction is made where it is noticed, and survives a projection rebuild,
  because the evidence changed rather than the rendering.
- Authorship of a revision matters to trust and must be carried through
  ingestion, not inferred later.
