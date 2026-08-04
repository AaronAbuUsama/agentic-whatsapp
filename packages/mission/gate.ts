/**
 * The coverage gate: whether a Mission's plan is honest enough to run.
 *
 * Re-derived from a completed Factory mission rather than from the ADRs. The
 * claim the artifacts settle — 96 assertions, 96 claims, zero uncovered, zero
 * claimed twice — is that *exactly one* feature owns each assertion. Zero means
 * nothing will produce it; two means nobody owns it, and shared ownership of a
 * success criterion is how a criterion goes unmet with everyone believing
 * otherwise.
 *
 * Structural types, not database rows: the gate is the cheapest thing in the
 * system to get right and it should stay checkable without a database.
 */

export type PlanRecords = {
  readonly assertions: readonly { readonly id: string }[];
  readonly milestones: readonly { readonly id: string }[];
  readonly features: readonly {
    readonly id: string;
    readonly milestoneId: string;
    /** Set on a validator feature; names the milestone it checks. */
    readonly validates?: string | null;
  }[];
  readonly fulfills: readonly { readonly featureId: string; readonly assertionId: string }[];
  readonly preconditions: readonly {
    readonly featureId: string;
    readonly requiresFeatureId: string;
  }[];
};

export type PlanFault =
  | { readonly kind: "uncovered-assertion"; readonly assertion: string }
  | {
      readonly kind: "assertion-claimed-twice";
      readonly assertion: string;
      readonly features: readonly string[];
    }
  | { readonly kind: "unknown-assertion"; readonly feature: string; readonly assertion: string }
  | { readonly kind: "unknown-milestone"; readonly feature: string; readonly milestone: string }
  | { readonly kind: "unknown-precondition"; readonly feature: string; readonly requires: string }
  | { readonly kind: "circular-preconditions"; readonly features: readonly string[] }
  | { readonly kind: "milestone-without-validation"; readonly milestone: string }
  | { readonly kind: "validator-claims-assertions"; readonly feature: string };

/**
 * Everything wrong with a plan, or nothing.
 *
 * Reports every fault rather than the first, because a plan is edited until the
 * gate passes and one-at-a-time is a worse conversation than a list.
 */
export function faults(plan: PlanRecords): PlanFault[] {
  const found: PlanFault[] = [];
  const assertionIds = new Set(plan.assertions.map((a) => a.id));
  const milestoneIds = new Set(plan.milestones.map((m) => m.id));
  const featureIds = new Set(plan.features.map((f) => f.id));

  const claimedBy = new Map<string, string[]>();
  for (const { featureId, assertionId } of plan.fulfills) {
    if (!assertionIds.has(assertionId)) {
      found.push({ kind: "unknown-assertion", feature: featureId, assertion: assertionId });
      continue;
    }
    claimedBy.set(assertionId, [...(claimedBy.get(assertionId) ?? []), featureId]);
  }

  const claimants = new Set(plan.fulfills.map((f) => f.featureId));
  for (const feature of plan.features) {
    if (!milestoneIds.has(feature.milestoneId)) {
      found.push({
        kind: "unknown-milestone",
        feature: feature.id,
        milestone: feature.milestoneId,
      });
    }
    // A validator checks work it did not do. Letting it also carry assertions
    // would make it the author and the judge of the same criterion.
    if (feature.validates && claimants.has(feature.id)) {
      found.push({ kind: "validator-claims-assertions", feature: feature.id });
    }
    if (feature.validates && !milestoneIds.has(feature.validates)) {
      found.push({
        kind: "unknown-milestone",
        feature: feature.id,
        milestone: feature.validates,
      });
    }
  }

  for (const { featureId, requiresFeatureId } of plan.preconditions) {
    if (!featureIds.has(requiresFeatureId)) {
      found.push({ kind: "unknown-precondition", feature: featureId, requires: requiresFeatureId });
    }
  }

  for (const id of assertionIds) {
    const claims = claimedBy.get(id);
    if (!claims) found.push({ kind: "uncovered-assertion", assertion: id });
    else if (claims.length > 1) {
      found.push({ kind: "assertion-claimed-twice", assertion: id, features: claims });
    }
  }

  const validated = new Set(plan.features.flatMap((f) => (f.validates ? [f.validates] : [])));
  for (const id of milestoneIds) {
    if (!validated.has(id)) found.push({ kind: "milestone-without-validation", milestone: id });
  }

  found.push(...cycles(plan.preconditions, featureIds));
  return found;
}

/** A plan may run only when nothing is wrong with it. */
export function mayRun(plan: PlanRecords): boolean {
  return faults(plan).length === 0;
}

/**
 * Preconditions form a dependency graph, and a cycle in it is a Mission that can
 * never start a single feature. Reported once per cycle, not once per member.
 */
function cycles(
  preconditions: PlanRecords["preconditions"],
  known: ReadonlySet<string>,
): PlanFault[] {
  const edges = new Map<string, string[]>();
  for (const { featureId, requiresFeatureId } of preconditions) {
    if (!known.has(requiresFeatureId)) continue;
    edges.set(featureId, [...(edges.get(featureId) ?? []), requiresFeatureId]);
  }

  const settled = new Set<string>();
  const onPath = new Set<string>();
  const path: string[] = [];
  const found: PlanFault[] = [];

  const walk = (id: string): void => {
    if (settled.has(id)) return;
    if (onPath.has(id)) {
      found.push({ kind: "circular-preconditions", features: path.slice(path.indexOf(id)) });
      return;
    }
    onPath.add(id);
    path.push(id);
    for (const next of edges.get(id) ?? []) walk(next);
    path.pop();
    onPath.delete(id);
    settled.add(id);
  };

  for (const id of known) walk(id);
  return found;
}
