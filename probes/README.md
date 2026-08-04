# Probes

Runnable experiments against a real model. Each one answers a question the
design rests on, and each prints enough that you can judge the answer yourself
rather than taking a summary for it.

They cost model calls. Run them deliberately.

```bash
bun probes/l1-handoff.ts       # does a cheap model produce a usable handoff?
bun probes/l2-validator.ts     # does a validator FAIL work that is broken?
```

Model comes from `AMBIENT_MODEL` (default `gpt-5.3-codex-spark`) through
`AMBIENT_MODEL_URL` (default `http://127.0.0.1:8318/v1`).

## What a worker actually is

Not a script. A model in a loop with four functions it may call — `read_file`,
`write_file`, `list_files`, `run_command` — plus a `finish_feature` tool that
ends the loop. Every command it runs is its own choice; nothing here tells it
which. That is the point, and it is also why the output is worth watching.
