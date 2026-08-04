/**
 * A Mission plan and the gate that decides whether it may run.
 *
 * See `CONTEXT.md` for the language and `docs/adr/0008-*` for why Assertions are
 * written before Tickets exist. Nothing here knows about Knowledge, transport or
 * models: a plan is checkable on its own, which is the whole point of checking it
 * before anything runs.
 */

/** A statement that must be true for the Mission to have succeeded. */
export type Assertion = {
  readonly id: string;
  readonly statement: string;
  /** The condition under which this fails. Without it a Validator can reason its way to a pass. */
  readonly failsIf: string;
  /** What would settle it. */
  readonly evidence: string;
};

/** An ordered group of Tickets ending in validation. */
export type Milestone = {
  readonly id: string;
  readonly title: string;
  /** Stated so a person can check it for themselves. */
  readonly verifiableOutcome: string;
};

/** One executable unit of a Mission. */
export type Ticket = {
  readonly id: string;
  readonly description: string;
  readonly milestone: string;
  /** Assertion ids this Ticket is responsible for. Empty for a Validator's own Ticket. */
  readonly fulfills: readonly string[];
  /** Ticket ids that must be settled first. */
  readonly preconditions: readonly string[];
  /** A Validator Ticket checks a Milestone rather than carrying Assertions of its own. */
  readonly validates?: string;
};

export type MissionPlan = {
  readonly id: string;
  readonly intent: string;
  readonly assertions: readonly Assertion[];
  readonly milestones: readonly Milestone[];
  readonly tickets: readonly Ticket[];
};

export type PlanFault =
  | { readonly kind: "uncovered-assertion"; readonly assertion: string }
  | {
      readonly kind: "assertion-claimed-twice";
      readonly assertion: string;
      readonly tickets: readonly string[];
    }
  | { readonly kind: "unknown-assertion"; readonly ticket: string; readonly assertion: string }
  | { readonly kind: "unknown-milestone"; readonly ticket: string; readonly milestone: string }
  | {
      readonly kind: "unknown-precondition";
      readonly ticket: string;
      readonly precondition: string;
    }
  | { readonly kind: "circular-preconditions"; readonly tickets: readonly string[] }
  | { readonly kind: "duplicate-id"; readonly id: string }
  | { readonly kind: "milestone-without-validation"; readonly milestone: string };

/**
 * Everything wrong with a plan, or nothing.
 *
 * An empty result is the gate: a Mission may not run while any Assertion is
 * unmapped, and coverage that is satisfied loosely proves nothing, so an
 * Assertion claimed by two Tickets is a fault rather than redundancy — nobody
 * owns it.
 */
export function faults(plan: MissionPlan): PlanFault[] {
  const found: PlanFault[] = [];

  const assertionIds = new Set<string>();
  for (const a of plan.assertions) {
    if (assertionIds.has(a.id)) found.push({ kind: "duplicate-id", id: a.id });
    assertionIds.add(a.id);
  }

  const milestoneIds = new Set<string>();
  for (const m of plan.milestones) {
    if (milestoneIds.has(m.id)) found.push({ kind: "duplicate-id", id: m.id });
    milestoneIds.add(m.id);
  }

  const ticketIds = new Set<string>();
  for (const t of plan.tickets) {
    if (ticketIds.has(t.id)) found.push({ kind: "duplicate-id", id: t.id });
    ticketIds.add(t.id);
  }

  const claimedBy = new Map<string, string[]>();
  for (const t of plan.tickets) {
    if (!milestoneIds.has(t.milestone)) {
      found.push({ kind: "unknown-milestone", ticket: t.id, milestone: t.milestone });
    }
    for (const p of t.preconditions) {
      if (!ticketIds.has(p))
        found.push({ kind: "unknown-precondition", ticket: t.id, precondition: p });
    }
    for (const a of t.fulfills) {
      if (!assertionIds.has(a)) {
        found.push({ kind: "unknown-assertion", ticket: t.id, assertion: a });
        continue;
      }
      claimedBy.set(a, [...(claimedBy.get(a) ?? []), t.id]);
    }
  }

  for (const id of assertionIds) {
    const claims = claimedBy.get(id);
    if (!claims) found.push({ kind: "uncovered-assertion", assertion: id });
    else if (claims.length > 1)
      found.push({ kind: "assertion-claimed-twice", assertion: id, tickets: claims });
  }

  const validated = new Set(plan.tickets.flatMap((t) => (t.validates ? [t.validates] : [])));
  for (const m of milestoneIds) {
    if (!validated.has(m)) found.push({ kind: "milestone-without-validation", milestone: m });
  }

  found.push(...cycles(plan.tickets, ticketIds));
  return found;
}

/** A plan may run only when nothing is wrong with it. */
export function mayRun(plan: MissionPlan): boolean {
  return faults(plan).length === 0;
}

/**
 * Preconditions form a dependency graph, and a cycle in it is a Mission that can
 * never start a single Ticket. Reported once per cycle, not once per member.
 */
function cycles(tickets: readonly Ticket[], known: ReadonlySet<string>): PlanFault[] {
  const edges = new Map(tickets.map((t) => [t.id, t.preconditions.filter((p) => known.has(p))]));
  const settled = new Set<string>();
  const path: string[] = [];
  const onPath = new Set<string>();
  const found: PlanFault[] = [];

  const walk = (id: string): void => {
    if (settled.has(id)) return;
    if (onPath.has(id)) {
      found.push({ kind: "circular-preconditions", tickets: path.slice(path.indexOf(id)) });
      return;
    }
    onPath.add(id);
    path.push(id);
    for (const next of edges.get(id) ?? []) walk(next);
    path.pop();
    onPath.delete(id);
    settled.add(id);
  };

  for (const t of tickets) walk(t.id);
  return found;
}
