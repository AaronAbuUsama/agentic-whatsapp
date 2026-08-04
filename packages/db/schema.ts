/**
 * Harness state: everything the runtime owns to execute a Mission.
 *
 * Derived from a real completed Factory mission (`~/.factory/missions/`, 96
 * assertions, 27 features, 43 handoffs) rather than from the ADRs, because the
 * artifacts are the only place the model has been proven to survive a 47-run
 * mission. Where the two disagree, the artifact wins and the ADR gets amended.
 *
 * Knowledge is deliberately absent. An assertion settles on a validator's verdict
 * plus the evidence artifacts it cites — see `assertionState` — not on a graph
 * query. Artifacts live in the mission's working directory; this schema holds the
 * state and the references.
 */

import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

const now = sql`(unixepoch())`;

/**
 * One large undertaking. `workingDirectory` is where artifacts land — a repo, a
 * buying workspace, a scratch dir. Nothing in the model cares which.
 *
 * `lastReviewedHandoffCount` is the orchestrator's entire memory across runs.
 * Factory keeps exactly this, and it is why a mission can be killed and resumed
 * without losing its place.
 */
export const missions = sqliteTable("missions", {
  id: text("id").primaryKey(),
  intent: text("intent").notNull(),
  workingDirectory: text("working_directory").notNull(),
  /** `draft` cannot run: the coverage gate has not passed. */
  state: text("state", {
    enum: ["draft", "ready", "running", "paused", "completed", "abandoned"],
  })
    .notNull()
    .default("draft"),
  /** How the domain is exercised: commands and long-running services, as YAML. */
  services: text("services"),
  lastReviewedHandoffCount: integer("last_reviewed_handoff_count").notNull().default(0),
  createdAt: integer("created_at").notNull().default(now),
  updatedAt: integer("updated_at").notNull().default(now),
});

/** An ordered group of features ending in validation. */
export const milestones = sqliteTable(
  "milestones",
  {
    id: text("id").primaryKey(),
    missionId: text("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    ordinal: integer("ordinal").notNull(),
    title: text("title").notNull(),
    /** Stated so a person can check it themselves. The human-in-the-loop seam. */
    verifiableOutcome: text("verifiable_outcome").notNull(),
  },
  (t) => [index("milestones_mission").on(t.missionId, t.ordinal)],
);

/**
 * The validation contract. Written before any feature exists, so the definition
 * of success cannot be shaped by the plan for achieving it.
 *
 * `failsIf` is the load-bearing field: without it a validator reasons its way to
 * a pass. Every assertion in the observed mission had one.
 */
export const assertions = sqliteTable(
  "assertions",
  {
    id: text("id").primaryKey(),
    missionId: text("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    /** `VAL-<AREA>-<NNN>`. Stable, cited by features and by validator reports. */
    code: text("code").notNull(),
    /** The `## Surface:` grouping the review passes are organised around. */
    surface: text("surface"),
    statement: text("statement").notNull(),
    failsIf: text("fails_if").notNull(),
    /** How it is checked. `shell` and `agent-browser` are what a real mission used. */
    tool: text("tool").notNull(),
    /** The exact artifact that constitutes proof. */
    evidence: text("evidence").notNull(),
  },
  (t) => [index("assertions_mission").on(t.missionId, t.code)],
);

/**
 * One executable unit. A validator feature sets `validates` and claims no
 * assertions — it checks a Milestone as a whole rather than carrying a contract
 * of its own.
 */
export const features = sqliteTable(
  "features",
  {
    id: text("id").primaryKey(),
    missionId: text("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    milestoneId: text("milestone_id")
      .notNull()
      .references(() => milestones.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    /** What should be true afterwards, as the worker is told it. */
    expectedBehavior: text("expected_behavior", { mode: "json" })
      .notNull()
      .$type<readonly string[]>()
      .default([]),
    skillId: text("skill_id").references(() => skills.id),
    /** Set on a validator feature; names the milestone it checks. */
    validates: text("validates").references(() => milestones.id),
    status: text("status", {
      enum: ["pending", "running", "completed", "failed", "blocked"],
    })
      .notNull()
      .default("pending"),
  },
  (t) => [index("features_mission").on(t.missionId, t.status)],
);

/**
 * The coverage link, and the reason it is a table rather than a JSON column: the
 * gate is a query. Exactly one feature per assertion — zero means uncovered, two
 * means nobody owns it.
 */
export const featureFulfills = sqliteTable(
  "feature_fulfills",
  {
    featureId: text("feature_id")
      .notNull()
      .references(() => features.id, { onDelete: "cascade" }),
    assertionId: text("assertion_id")
      .notNull()
      .references(() => assertions.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.featureId, t.assertionId] }),
    index("fulfills_assertion").on(t.assertionId),
  ],
);

/**
 * Scheduling gates, as a graph rather than the prose Factory uses. Prose
 * preconditions cannot be scheduled on, and selecting the next runnable feature
 * is the one part of the orchestrator that must be plain code.
 */
export const featurePreconditions = sqliteTable(
  "feature_preconditions",
  {
    featureId: text("feature_id")
      .notNull()
      .references(() => features.id, { onDelete: "cascade" }),
    requiresFeatureId: text("requires_feature_id")
      .notNull()
      .references(() => features.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.featureId, t.requiresFeatureId] })],
);

/**
 * One orchestrator iteration: select a feature, spawn a worker, receive a
 * handoff, iterate. This is the fresh-context boundary — the observed mission ran
 * 47 of these for 27 features, and was killed and resumed throughout.
 */
export const runs = sqliteTable(
  "runs",
  {
    id: text("id").primaryKey(),
    missionId: text("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    featureId: text("feature_id").references(() => features.id),
    kind: text("kind", { enum: ["worker", "validator", "planner"] }).notNull(),
    startedAt: integer("started_at").notNull().default(now),
    endedAt: integer("ended_at"),
  },
  (t) => [index("runs_mission").on(t.missionId, t.startedAt)],
);

/**
 * What a finished unit of work hands to the next one. Since no session outlives a
 * feature, this is the whole of what is inherited.
 *
 * `whatWasLeftUndone` is named explicitly rather than implied — a worker that
 * silently stops short is the failure this field exists to catch.
 */
export const handoffs = sqliteTable(
  "handoffs",
  {
    id: text("id").primaryKey(),
    runId: text("run_id")
      .notNull()
      .references(() => runs.id, { onDelete: "cascade" }),
    featureId: text("feature_id")
      .notNull()
      .references(() => features.id, { onDelete: "cascade" }),
    successState: text("success_state", {
      enum: ["success", "partial", "failed", "blocked"],
    }).notNull(),
    /** What the orchestrator actually reads. */
    salientSummary: text("salient_summary").notNull(),
    whatWasImplemented: text("what_was_implemented").notNull(),
    whatWasLeftUndone: text("what_was_left_undone").notNull(),
    /** `{ commandsRun: [{command, exitCode, observation}], interactiveChecks: [...] }` */
    verification: text("verification", { mode: "json" }).notNull().$type<unknown>(),
    /** `{ followedProcedure, deviations[], suggestedChanges[] }` — the skill learning loop. */
    skillFeedback: text("skill_feedback", { mode: "json" }).$type<unknown>(),
    reviewed: integer("reviewed", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at").notNull().default(now),
  },
  (t) => [index("handoffs_unreviewed").on(t.reviewed, t.createdAt)],
);

/**
 * How a Mission grows work honestly. A worker that notices something outside its
 * feature reports it rather than fixing it; the orchestrator decides whether it
 * earns a feature.
 */
export const discoveredIssues = sqliteTable(
  "discovered_issues",
  {
    id: text("id").primaryKey(),
    handoffId: text("handoff_id")
      .notNull()
      .references(() => handoffs.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    disposition: text("disposition", { enum: ["open", "promoted", "dismissed"] })
      .notNull()
      .default("open"),
    promotedToFeatureId: text("promoted_to_feature_id").references(() => features.id),
  },
  (t) => [index("issues_open").on(t.disposition)],
);

/**
 * The verdict ledger — separate from `assertions` because one is the contract and
 * the other is what happened to it. `blocked` is first-class: an assertion nobody
 * could check is not the same as one that failed.
 */
export const assertionState = sqliteTable("assertion_state", {
  assertionId: text("assertion_id")
    .primaryKey()
    .references(() => assertions.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["pending", "passed", "failed", "blocked"] })
    .notNull()
    .default("pending"),
  validatedAtMilestone: text("validated_at_milestone").references(() => milestones.id),
  /** The validator feature that settled it. */
  validatedBy: text("validated_by").references(() => features.id),
  /** Paths into the working directory. The audit trail back to proof. */
  evidence: text("evidence", { mode: "json" }).notNull().$type<readonly string[]>().default([]),
  reason: text("reason"),
  updatedAt: integer("updated_at").notNull().default(now),
});

/**
 * A procedure an agent loads when it becomes relevant.
 *
 * Two lifetimes, one table. A `mission`-scoped skill is minted during planning
 * and dies with the mission; a `library` skill persists and is revised by
 * handoff feedback. Library bodies may live in git instead — `body` is null then
 * and `name` resolves to a file — but nothing is promoted until it has earned it.
 */
export const skills = sqliteTable(
  "skills",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    scope: text("scope", { enum: ["mission", "library"] }).notNull(),
    missionId: text("mission_id").references(() => missions.id, { onDelete: "cascade" }),
    /** Null for a library skill resolved from the filesystem. */
    body: text("body"),
    revision: integer("revision").notNull().default(1),
    updatedAt: integer("updated_at").notNull().default(now),
  },
  (t) => [index("skills_scope").on(t.scope, t.name)],
);

/** The progress log. Small vocabulary, append-only, one mission's whole history. */
export const events = sqliteTable(
  "events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    missionId: text("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    payload: text("payload", { mode: "json" }).$type<unknown>(),
    at: integer("at").notNull().default(now),
  },
  (t) => [index("events_mission").on(t.missionId, t.at)],
);
