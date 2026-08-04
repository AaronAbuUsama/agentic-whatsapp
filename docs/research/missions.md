# Factory Missions, reverse-engineered

Source: three complete missions in `~/.factory/missions/` on this machine, read
directly, plus <https://factory.ai/news/missions>. Everything below is observed
from artifacts unless marked as inference. The worked example throughout is
mission `mis_7ff4b64f` — 96 assertions, 27 features, 5 milestones, 47 runs, 43
handoffs, 238 logged events.

## Mission anatomy on disk

```
mission.md                 the plan, in prose
architecture.md            13KB of system context for workers
validation-contract.md     54KB — every assertion, in full
features.json              the decomposition, machine-readable
contract-work/             per-area contracts + review-pass-1-*.md, review-pass-2-*.md
handoffs/                  one JSON per completed worker (43 here)
progress_log.jsonl         238 events
evidence/                  named artifact bundles per feature
research/                  research outputs
skills/, library/          mission skills and the reusable library
services.yaml              how to operate the domain
init.sh                    environment preparation
model-settings.json        model and effort per role
state.json                 { missionId, state, workingDirectory, lastReviewedHandoffCount }
```

## The validation contract

The single most transferable artifact. Its preamble sets the rule: _"It is
black-box and behavior-based: validators must test user-visible behavior,
build/runtime boundaries, and external integration boundaries, not implementation
preferences."_

Each assertion has four parts, and the third is the one most designs omit:

```markdown
### VAL-FOUND-003: Provider bootstraps only from publishable key

The web provider initializes the published `CapxulProvider` using
`NEXT_PUBLIC_CAPXUL_PUBLISHABLE_KEY` as `publishableKey`. The assertion fails if
provider setup requires Convex URL, Openfort config, Shield config, chain config,
RPC URL, gas policy, org deployment wiring, or other app-facing backend topology.
Tool: shell
Evidence: provider source citation and forbidden-pattern scan for `convexUrl`,
`authMode`, `openfort`, `shield`, `chain`, `rpc`, `gasPolicy`, ...
```

- **Identifier** — `VAL-<AREA>-<NNN>`, so features can cite it.
- **Statement** — what a completed state looks like.
- **Failure condition** — an explicit _"The assertion fails if …"_. This is what
  stops a validator rationalising a pass. Every assertion has one.
- **Tool** — `shell`, `agent-browser`. How it is to be checked.
- **Evidence** — the exact artifact that constitutes proof.

Assertions are grouped under `## Surface:` headings, which are the areas the
review passes are organised around.

## features.json

```ts
{
  id: string                        // slug
  description: string
  skillName: string                 // which skill the worker runs
  preconditions: string[]           // gates, in prose
  expectedBehavior: string[]        // what should be true afterwards
  fulfills: string[]                // VAL-ids — the coverage link
  milestone: string
  status: "completed" | ...
  workerSessionIds: string[]        // every session that touched it
  currentWorkerSessionId: string | null
  completedWorkerSessionId: string | null
}
```

**The coverage gate is real and it held.** In this mission: 96 assertions in the
contract, 96 referenced across `fulfills`, zero uncovered, zero dangling
references. That is the `fulfills coverage check (26 assertions, all mapped)`
step seen in the launch screenshots, verified on a completed mission.

**Validator features carry no `fulfills`.** Each milestone ends with exactly two:

```
buildable-baseline
  delete-deprecated-workspace-and-use-latest-sdk   [foundation-worker]
  published-provider-env-bootstrap-port            [foundation-worker]
  web-shell-domain-compile-and-guardrails          [foundation-worker]
  scrutiny-validator-buildable-baseline            [scrutiny-validator]
  user-testing-validator-buildable-baseline        [user-testing-validator]
```

So validation is scheduled work in the same queue, and it validates the milestone
as a whole rather than individual assertions. Six skills across the mission: four
worker skills, one per milestone flavour, plus the two validators.

The feature list **grows during the run**. Entries like
`personal-mobile-accounts-trigger-hit-target-fix` and
`five-digit-otp-verification-compatibility` are follow-ups created when
validation found problems — 27 features for a plan that started smaller.

## Handoffs — how a fresh session inherits

One JSON per completed worker. This is the entire inheritance between clean
contexts.

```ts
{
  timestamp, workerSessionId, featureId, milestone,
  successState: "success" | ...,
  returnToOrchestrator: boolean,
  handoff: {
    salientSummary: string          // what the orchestrator actually reads
    whatWasImplemented: string
    whatWasLeftUndone: string       // named explicitly, not implied
    verification: {
      commandsRun: [{ command, exitCode, observation }]
      interactiveChecks: [{ action, observed }]
    }
    tests: { added, updated, coverage }
    discoveredIssues: []            // becomes follow-up features
    skillFeedback: {
      followedProcedure: boolean
      deviations: string[]
      suggestedChanges: string[]
    }
  }
}
```

Two fields carry more weight than the rest:

- **`discoveredIssues`** is the mechanism by which a mission grows work. A worker
  that notices something outside its feature reports it rather than fixing it.
- **`skillFeedback`** is the skill-library learning loop, made concrete. Every
  worker reports whether it followed its skill's procedure, where it deviated,
  and what should change. "Workers refine and extend the skill library as they
  work" is this field.

## The event log

238 events, and the vocabulary is small:

| Event                            | Count |
| -------------------------------- | ----- |
| `mission_run_started`            | 47    |
| `worker_selected_feature`        | 46    |
| `worker_started`                 | 46    |
| `worker_completed`               | 43    |
| `handoff_items_dismissed`        | 26    |
| `mission_paused`                 | 11    |
| `mission_resumed`                | 9     |
| `milestone_validation_triggered` | 4     |
| `worker_failed`                  | 3     |
| `worker_paused`                  | 2     |
| `mission_accepted`               | 1     |

Event fields include `spawnId`, `successState`, `validatorsPassed`, `commitId`,
`repoPath`, `exitCode`.

**47 runs for 27 features**, and 11 pauses against 9 resumes. A "run" is one
orchestrator iteration — select a feature, spawn a worker, receive a handoff,
dismiss items, iterate — and it is the fresh-context boundary. The mission was
stopped and restarted constantly and did not care, because state is on disk.

## Planning does real work before it plans

`mission.md` carries a section headed **"Already verified during planning"**:

> Minted a real publishable key for `http://localhost:3100`; bootstrap returns
> 200 for `http://localhost:3100` and 401 for a wrong origin. At planning time,
> npm reported `@capxul/sdk` latest = `1.0.0-alpha.7` … Workers must re-check npm
> at dependency-update time.

Planning is not just decomposition. It establishes facts empirically, records
them, and marks which are expected to go stale. `contract-work/` then holds two
review passes per area over the resulting contract before execution begins.

Each milestone in `mission.md` is stated as **"Expected outcome the user can
verify"** — the human checkpoint is written into the plan, per milestone.

## Model settings

```json
{
  "workerModel": "custom:GPT-5.5-(Medium)-0",
  "workerReasoningEffort": "xhigh",
  "validationWorkerModel": "custom:GPT-5.5-(Medium)-0",
  "validationWorkerReasoningEffort": "xhigh",
  "skipScrutiny": false,
  "skipUserTesting": false
}
```

`skipScrutiny` and `skipUserTesting` confirm exactly two validator kinds as
first-class, toggleable roles. Note that in _this_ mission the validator uses the
same model as the worker — the different-lineage split seen in the launch
screenshots is a configuration, not an invariant of the system.

## services.yaml — the domain interface

```yaml
commands:
  install: pnpm install
  lint: pnpm --filter web lint
  typecheck: pnpm --filter web check-types
  test: pnpm --filter web test
  build: ...
  guard: pnpm --filter web lint && pnpm --filter web check-types
services:
  web:
    start: ...
    stop: ...
    healthcheck: curl -sf http://localhost:3100
    port: 3100
    depends_on: []
```

This is where the design is most code-shaped: the domain is expressed as shell
commands and long-running local processes. It is also the cleanest seam for us —
the same slot in our model is the set of Specialist skills a Mission may call.

## Validator output

Two more artifacts, both missed on the first pass.

`validation-state.json` tracks every assertion individually:

```ts
{ assertions: { "VAL-FOUND-001": {
    status: "passed" | "failed" | "blocked" | "pending",
    validatedAtMilestone: string,
    validatedBy: string,        // the validator feature id
    evidence: string[]          // paths into evidence/
}}}
```

Every assertion therefore carries a full audit trail: what settled it, at which
milestone, and which artifacts prove it. `blocked` is first-class alongside
passed and failed.

`validation/<milestone>/{scrutiny,user-testing}/synthesis.json` is the validator's
report, and it comes in **rounds** — `personal-screens` needed four:

```ts
{
  milestone, round, previousRound,
  status: "fail" | ...,
  assertionsSummary: { total, passed, failed, blocked },
  passedAssertions, failedAssertions: [{ id, reason }], blockedAssertions,
  flowReports, toolsUsed,
  frictions: [{ description, resolved, resolution, affectedAssertions }],
  blockers,
  salientSummary
}
```

`frictions` is the surprise: the validator reports difficulty encountered _doing
the validation_ — tooling that made evidence hard to capture — with which
assertions it affected. That is meta-feedback about the harness rather than the
work, and it is the tooling counterpart to `skillFeedback`.

## Why the contract comes first

The strongest argument in Factory's own material, from
<https://factory.ai/news/missions-architecture>:

> "When creating the validation contract, the orchestrator draws from its
> understanding of requirements. If it had created the features first, the
> contract would be influenced by the implementation it had already planned."

The ordering is not process hygiene. It stops the definition of success being
contaminated by the plan for achieving it. The same post names the two failure
modes the architecture exists to defeat — **context dilution** ("the agent's
context grows with information that isn't relevant to what it's doing right now")
and **self-evaluation bias** ("an agent that implemented something is worse at
objectively evaluating its own work than a fresh, unbiased reviewer") — and gives
the roles non-overlapping incentives: of workers, "the final judgment on
correctness is not their call."

Validation is structural, not discretionary: the orchestrator "doesn't drive
validation directly — the system injects validators at milestones."

## Public sources, checked against the artifacts

The only detailed public schema description is a third-party reverse-engineering
gist, not Factory documentation — `docs.factory.ai/missions/reference` publishes
settings only, no artifact formats. Checking its claims against real missions:

| Claim                                                                         | Verdict                                                              |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Every assertion claimed by **exactly one** feature, no orphans, no duplicates | **Confirmed.** 96 assertions, 96 claims, zero claimed twice          |
| `features.json` has a `verificationSteps` field                               | **Not present** in any of the three local missions. Drifted or wrong |
| Runs ≈ features + 2 × milestones                                              | **Floor, as documented.** Predicts 37, actual 47                     |
| A `define-mission-skills` step mints per-worker skills during planning        | Consistent with the launch screenshots; skill files exist locally    |

Also documented publicly and worth knowing: **`droid exec --mission`** runs
headless, requiring `--auto high`, with separate `--worker-model` and
`--validator-model` flags. And Factory recommend the target repository be at
**Agent Readiness Level 4** before running a Mission, specifically because
Missions "requires an automated, scriptable way to exercise the app the way a
user would."

That last point is a live risk to our non-code experiment: a repository of
markdown has no scriptable way to be exercised, which is precisely the property
being tested.

## Does it generalise?

Contested, and worth stating carefully because the answer decides how much of
this we inherit.

The launch post claims it does: _"We designed Missions for software development,
but they generalize further than we expected. The same system that builds a CRM
can write a research paper or train ML models. Goal decomposition, execution, and
validation apply to more than code."_

Every mechanism document says otherwise by omission. The architecture post
addresses software only and describes nothing for applying it elsewhere. The
docs' own list of applicable work — "full-stack development, research tasks,
brownfield migrations, and ambitious prototypes" — is software-adjacent
throughout. `services.yaml` is shell commands, the user-testing validator drives a
browser, and Agent Readiness Level 4 presumes a runnable application.

So: the claim is made in marketing and unsupported in mechanism. Which is exactly
why the `coffee-business` experiment is worth its cost — and also why a
degradation there would not be a refutation of the _idea_, only of this
implementation of it.

## What we take

| Observation                                                                       | Our position                                                                                                                    |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Assertion carries an explicit failure condition, a tool, and an evidence artifact | Adopt in full. ADR-0002 said "evidence condition"; that is one of four parts, and the failure condition is the load-bearing one |
| `fulfills` links features to assertion ids; coverage gates the run                | Already ADR-0008, now verified end to end on a real mission                                                                     |
| Validators are scheduled features with no `fulfills`, two per milestone           | Already ADR-0010; refine to _validation validates a Milestone, not a Ticket_                                                    |
| Handoff JSON is the entire inheritance between fresh contexts                     | Already ADR-0009; adopt the field list, especially `whatWasLeftUndone`                                                          |
| `discoveredIssues` grows the plan mid-mission                                     | Missing from our model. A Delegate that notices something outside its Brief reports rather than acts                            |
| `skillFeedback` closes the loop on the skill library                              | Missing from our model, and it is the whole learning mechanism                                                                  |
| Planning establishes facts empirically and marks the perishable ones              | Missing. Our planning is decomposition only                                                                                     |
| Each milestone states an outcome _the user can verify_                            | Missing, and it is the human-in-the-loop seam                                                                                   |
| `services.yaml` declares the domain's operations                                  | Maps to Specialist skills available to a Mission                                                                                |

## Open

- The `droid` binary (113MB, Mach-O) is a bundled JavaScript executable. A first
  probe returned minified source rather than prompt text; extracting the
  orchestrator, worker and validator prompts needs a more careful pass.
- All three local missions are software. **Whether the machinery degrades on
  non-code work remains untested.** A mission was prepared in
  `~/projects/coffee-business` — a supplier-sourcing brief with ten assertions and
  no code — and parked before execution on inference cost.

  Worth knowing before it is resumed: Factory recommend Agent Readiness Level 4,
  justified by Missions requiring "an automated, scriptable way to exercise the
  app the way a user would." A repository of markdown has no such thing, so the
  user-testing validator is the component most likely to have nothing to do. That
  is the observation the experiment exists to make, and it may be obtainable
  cheaply — the run cost is roughly `features + 2 × milestones` worker sessions,
  so a deliberately small plan bounds it.
