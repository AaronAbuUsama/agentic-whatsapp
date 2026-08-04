/**
 * Which feature runs next.
 *
 * This is the half of the orchestrator that must not be a model call. Selecting
 * runnable work from a dependency graph is a graph walk, and an agent asked to do
 * it will occasionally pick something blocked and be confidently wrong about why.
 * Judgement — whether a discovered issue earns a feature, whether a milestone
 * really passed — is where the model belongs.
 *
 * Three gates, in the order they are checked:
 *
 * 1. **Preconditions.** Every named feature settled first.
 * 2. **Milestone order.** A milestone's work waits until the previous milestone
 *    has been *validated*, not merely finished. Finishing is the worker's own
 *    opinion of its work; validation is somebody else's.
 * 3. **Validators last.** A milestone's validators run only once every other
 *    feature in that milestone is done — there is nothing to validate before then.
 */

export type ScheduleFeature = {
  readonly id: string;
  readonly milestoneId: string;
  readonly status: "pending" | "running" | "completed" | "failed" | "blocked";
  /** Set on a validator feature; names the milestone it checks. */
  readonly validates?: string | null;
};

export type ScheduleRecords = {
  readonly milestones: readonly { readonly id: string; readonly ordinal: number }[];
  readonly features: readonly ScheduleFeature[];
  readonly preconditions: readonly {
    readonly featureId: string;
    readonly requiresFeatureId: string;
  }[];
};

export type BlockedReason =
  | { readonly kind: "awaiting-preconditions"; readonly features: readonly string[] }
  | { readonly kind: "awaiting-milestone"; readonly milestone: string }
  | { readonly kind: "awaiting-milestone-work"; readonly features: readonly string[] };

export type Blocked = { readonly feature: string; readonly reason: BlockedReason };

/**
 * Every pending feature paired with what stops it, or `undefined` if nothing does.
 *
 * One pass, because "what can run" and "why can't this run" are the same question
 * and answering them separately is how the two drift apart.
 */
function assess(plan: ScheduleRecords): { feature: ScheduleFeature; reason?: BlockedReason }[] {
  const status = new Map(plan.features.map((f) => [f.id, f.status]));
  const ordinal = new Map(plan.milestones.map((m) => [m.id, m.ordinal]));

  const requires = new Map<string, string[]>();
  for (const { featureId, requiresFeatureId } of plan.preconditions) {
    requires.set(featureId, [...(requires.get(featureId) ?? []), requiresFeatureId]);
  }

  // A milestone is validated when every validator claiming it has completed.
  const checks = new Map<string, ScheduleFeature[]>();
  for (const f of plan.features) {
    if (!f.validates) continue;
    checks.set(f.validates, [...(checks.get(f.validates) ?? []), f]);
  }
  const validated = new Set(
    [...checks].filter(([, cs]) => cs.every((c) => c.status === "completed")).map(([id]) => id),
  );

  return plan.features
    .filter((f) => f.status === "pending")
    .map((feature) => {
      const unmet = (requires.get(feature.id) ?? []).filter((id) => status.get(id) !== "completed");
      if (unmet.length > 0) {
        return { feature, reason: { kind: "awaiting-preconditions", features: unmet } as const };
      }

      const mine = ordinal.get(feature.milestoneId) ?? 0;
      const earlier = plan.milestones.find((m) => m.ordinal < mine && !validated.has(m.id));
      if (earlier) {
        return { feature, reason: { kind: "awaiting-milestone", milestone: earlier.id } as const };
      }

      if (feature.validates) {
        const outstanding = plan.features
          .filter((f) => f.milestoneId === feature.validates && !f.validates)
          .filter((f) => f.status !== "completed")
          .map((f) => f.id);
        if (outstanding.length > 0) {
          return {
            feature,
            reason: { kind: "awaiting-milestone-work", features: outstanding } as const,
          };
        }
      }

      return { feature };
    });
}

/**
 * Every feature that could start right now, earliest milestone first.
 *
 * Returns all of them rather than one, because nothing in the model says the
 * orchestrator must be serial — Factory ran 47 sequential runs, but that is a
 * property of its scheduler, not of the design.
 */
export function runnable(plan: ScheduleRecords): ScheduleFeature[] {
  const ordinal = new Map(plan.milestones.map((m) => [m.id, m.ordinal]));
  return assess(plan)
    .filter((entry) => !entry.reason)
    .map((entry) => entry.feature)
    .sort((a, b) => (ordinal.get(a.milestoneId) ?? 0) - (ordinal.get(b.milestoneId) ?? 0));
}

/** Why each pending feature cannot start. The other half of {@link runnable}. */
export function blocked(plan: ScheduleRecords): Blocked[] {
  return assess(plan).flatMap((entry) =>
    entry.reason ? [{ feature: entry.feature.id, reason: entry.reason }] : [],
  );
}
