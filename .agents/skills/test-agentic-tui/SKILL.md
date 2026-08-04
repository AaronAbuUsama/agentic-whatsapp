---
name: test-agentic-tui
description: Close the loop on an Agentic TUI Kit workbench using the in-process driver, semantic actions, physical keyboard and pointer input, screenshots, videos, evidence packs, and optional SSH checks. Use when a coding agent must validate a feature, reproduce an interaction bug, or attach trustworthy behavioral proof to a review.
---

# Test an Agentic TUI

Drive the actual application in process. Do not reach for tmux, Ghostty, cmux, sleeps, or a second
runtime when `driveHeadlessTui` can prove the behavior directly.

## Establish the journey

1. Read `docs/testing.md` and `apps/docs/content/docs/guides/prove-an-app.mdx`.
2. Inspect `examples/counter/src/app.test.tsx` for the complete semantic + physical path.
3. Inspect the target app's actions and visible controls before writing the journey.
4. Use a fixed viewport and always call `tui.finish()` in `finally`.

## Prove both layers

- Invoke a typed action with an agent context to prove the operation contract and agent parity.
- Drive keys, text, clicks, or stepped drags to prove the visible control reaches that action.
- Assert the visible postcondition with `tui.expect.text` or `tui.expect.absent`.
- Assert the corresponding action ID, actor/source, and outcome in invocation history.

Avoid fixed sleeps. Journey methods settle rendering and live text assertions use bounded polling.

## Produce reviewable evidence

Capture a representative PNG and an MP4 after the meaningful intermediate states have occurred:

```ts
await tui.screenshot("artifacts/feature/final.png");
await tui.recording("artifacts/feature/journey.mp4");
```

Inspect the PNG directly. Inspect representative video frames and confirm the video duration covers
the claimed journey. A one-second terminal frame, launcher window, or Codex desktop is not evidence
of the application behavior. Use `writeEvidencePack` when handing off a formal claim; every video
claim also needs an inspected still.

For an application-agent run, require an explicit `completed` or `failed` terminal state. Confirm
real tool calls in both the transcript and `runtime.actions.invocations()`.

## Prove SSH separately

Run the process-isolated integration test for authentication, concurrent sessions, reconnect, and
per-session cleanup:

```bash
bun test examples/notes/src/ssh.integration.test.ts
```

Use a remote box only for deployment-environment confidence after the local integration test. Keep
host keys and authorized keys temporary unless the user explicitly asks for a persistent deployment,
and clean up remote processes and files after the proof.

## Finish

Run the focused test, then `bun run verify`. Report exact commands, pass counts, artifact paths, and
anything not proven. Never call a visual cut ready without inspecting its artifacts.
