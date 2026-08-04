---
name: build-agentic-tui
description: Build or extend a terminal workbench with Agentic TUI Kit using application modules, typed actions, addressable panels, workspaces, application-agent tools, and closed-loop proof. Use when creating an app from scratch, adding a useful capability, wiring an operation for equal human and agent access, or composing the application entrypoint.
---

# Build an Agentic TUI

Build the smallest useful vertical slice through the public API. Keep domain code in the
application; keep terminal mechanics in the framework. A counter can prove arithmetic. Prefer a
slice where an application agent does something a person actually cares about.

## Establish the real surface

1. Resolve the repository root with `git rev-parse --show-toplevel`.
2. Read `README.md`, `docs/architecture.md`, and `docs/building-an-app.md`.
3. Inspect `examples/counter` only for the minimum shape. Use `examples/notes` as the reference for
   a real workbench with domain actions, an application agent, and visual proof.
4. Import from `agentic-tui-kit` and `agentic-tui-kit/testing`. Never import scoped internal
   packages or `packages/*/src`.

## Build in this order

1. **State:** create the application-owned store, service, or repository.
2. **Action:** define each committed operation with Zod input/output schemas and an explicit JSON
   receipt. Use `rejectAction` for expected failures.
3. **Panel:** define a small serializable target, canonical address, title, and content renderer.
4. **Module:** register the capability's panels, actions, and cleanup with `defineModule`.
5. **App:** compose modules and one initial workspace with `defineTuiApp`.
6. **Host:** use `runTuiApp` locally. Use `mountTuiApp` only when an existing host owns the renderer.

Start with one workspace. Add another only when users need a separate persistent desktop. Use a
component inside a panel unless the content needs independent placement, focus, address, or
lifecycle.

## Preserve user-agent parity

Route buttons, shortcuts, palette entries, pointer commits, tests, and application-agent tools to
the same action. Do not duplicate a mutation in a callback or provider adapter. Bind a live action
registry to an application agent with `runtime.actions.asTools(context)` only after the actions work
without a model.

## Use the component boundary honestly

Use OpenTUI JSX intrinsics such as `<box>`, `<text>`, and `<scrollbox>` for raw layout. Use semantic
framework components such as `PaneSidebar`, `AgentChat`, `MessageComposer`, themes, and shell-owned
window chrome from the facade. Do not recreate raw elements as capitalised aliases unless the
component adds an actual behavioral or visual contract.

## Finish the slice

- Add one focused action test for domain receipts and failures.
- Add one headless journey through the public facade.
- Run the affected example test and `bun run verify`.
- If behavior is visual, use `$test-agentic-tui` to capture and inspect a screenshot and video.

Do not add provider adapters, extra workspaces, persistence, SSH, or plugin machinery unless the
application slice requires them now.
