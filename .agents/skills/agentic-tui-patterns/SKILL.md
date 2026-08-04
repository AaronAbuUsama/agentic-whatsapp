---
name: agentic-tui-patterns
description: Apply and review Agentic TUI Kit patterns for terminal workbenches that are equally operable by people and application agents. Use when planning module, action, panel, workspace, lifecycle, component, agent-tool, or testing boundaries, or when diagnosing framework-versus-product leakage and architectural anti-patterns.
---

# Agentic TUI Patterns

Judge the code against implemented boundaries, not a speculative framework.

## Read before judging

Resolve the repository root, then read the relevant sections of:

- `docs/architecture.md` for ownership and dependency direction;
- `docs/actions-and-agents.md` for operation contracts and agent parity;
- `docs/components.md` for reusable UI boundaries;
- `docs/testing.md` for proof requirements.

Use `examples/counter` as the minimum application and `examples/notes` as the composed application.

## Apply the mental model

| Concept   | Owns                                                                |
| --------- | ------------------------------------------------------------------- |
| Module    | One application capability, its state, actions, panels, and cleanup |
| Action    | One validated committed operation and its receipt                   |
| Panel     | Typed addressable content                                           |
| Window    | One visible instance of a panel                                     |
| Workspace | A persistent desktop containing independent windows and layout      |
| Component | Reusable presentation and transient interaction inside a panel      |

Prefer one module per cohesive product capability, not one per file or screen. Prefer a component
when content always moves with its parent panel. Prefer a new panel only when it needs independent
placement, focus, address, or lifecycle.

## Enforce operation parity

- Put every committed save, send, create, delete, dock, resize, or navigate operation behind an
  action.
- Return explicit JSON success receipts; never silently succeed.
- Keep actor identity in trusted invocation context, never tool input.
- Adapt `ActionTool[]` into a model SDK; never rebuild tools from domain services.
- Keep model loops, transport, persistence, and provider selection in application infrastructure.

Transient hover, caret, menu selection, and unfinished drag previews may remain local UI state.

## Keep dependencies pointing inward once

Applications import only the public facade. Framework packages must not import examples. Product
modules may compose framework packages; framework components must not import product stores.
Stateful modules are constructed once per independent session and disposed with it. Shared database
pools or service clients must be deliberately placed outside the session factory.

## Review with evidence

When reporting a problem, cite the real file and line, its callers, and the smallest owning-boundary
fix. Flag these anti-patterns:

- domain mutation directly in a UI callback;
- a second agent-only tool implementation;
- whole entities stored in panel targets;
- workspaces used as routes or accounts;
- product services imported into reusable components;
- raw OpenTUI elements republished as framework components without semantic behavior;
- layout or pointer algorithms reconstructed outside the windows package;
- generic errors for expected domain outcomes;
- screenshots or videos that do not show the claimed state.

OpenTUI owns raw elements. Agentic TUI Kit owns semantic workbench behavior. Do not add a facade
wrapper solely to rename an intrinsic or forward a ref.
