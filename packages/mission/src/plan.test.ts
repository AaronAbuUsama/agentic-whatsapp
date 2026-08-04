import { describe, expect, it } from "vite-plus/test";
import { faults, mayRun, type MissionPlan, type Ticket } from "./plan.ts";

/**
 * The fixture is the real sourcing brief from `~/projects/coffee-business` —
 * deliberately not software, because the claim under test is that Assertions and
 * coverage survive off code. If this stops reading like work a person could do,
 * the abstraction has drifted back toward a build system.
 */
const sourcing: MissionPlan = {
  id: "sourcing-south-america",
  intent: "Build a qualified supplier list for Colombia and Peru, ready for outreach.",
  assertions: [
    {
      id: "A-LEAD-001",
      statement: "Forty distinct organisations are listed.",
      failsIf:
        "Fewer than forty remain after duplicates are removed by trading name or web domain.",
      evidence: "The index, counted, with the rejects file accounting for what was dropped.",
    },
    {
      id: "A-LEAD-002",
      statement: "At least thirty carry an export or FOB capability claim.",
      failsIf: "A counted organisation names no exporter and makes no export claim of its own.",
      evidence: "Per-organisation dossiers, each citing a source for the claim.",
    },
    {
      id: "A-LEAD-003",
      statement: "Every factual claim carries a source.",
      failsIf: "Any dossier line asserts a fact without a resolvable source URL.",
      evidence: "A sweep over every dossier for unsourced assertions.",
    },
  ],
  milestones: [
    {
      id: "research",
      title: "Find candidates",
      verifiableOutcome: "A list of names I can read down and recognise.",
    },
    {
      id: "qualify",
      title: "Qualify them",
      verifiableOutcome: "I can pick ten to call without opening anything else.",
    },
  ],
  tickets: [
    {
      id: "sweep-directories",
      description: "Search exporter directories and associations.",
      milestone: "research",
      fulfills: ["A-LEAD-001"],
      preconditions: [],
    },
    {
      id: "check-export",
      description: "Establish export capability per candidate.",
      milestone: "qualify",
      fulfills: ["A-LEAD-002"],
      preconditions: ["sweep-directories"],
    },
    {
      id: "source-every-claim",
      description: "Attach a source to every claim.",
      milestone: "qualify",
      fulfills: ["A-LEAD-003"],
      preconditions: ["check-export"],
    },
    {
      id: "validate-research",
      description: "Check the research milestone.",
      milestone: "research",
      fulfills: [],
      preconditions: ["sweep-directories"],
      validates: "research",
    },
    {
      id: "validate-qualify",
      description: "Check the qualify milestone.",
      milestone: "qualify",
      fulfills: [],
      preconditions: ["source-every-claim"],
      validates: "qualify",
    },
  ],
};

const withTickets = (tickets: Ticket[]): MissionPlan => ({ ...sourcing, tickets });

describe("a Mission may run only when its plan is whole", () => {
  it("accepts a plan whose every Assertion is claimed exactly once", () => {
    expect(faults(sourcing)).toEqual([]);
    expect(mayRun(sourcing)).toBe(true);
  });

  it("refuses to run while an Assertion is unclaimed", () => {
    const orphaned = withTickets(sourcing.tickets.filter((t) => t.id !== "source-every-claim"));

    expect(mayRun(orphaned)).toBe(false);
    expect(faults(orphaned)).toContainEqual({
      kind: "uncovered-assertion",
      assertion: "A-LEAD-003",
    });
  });

  it("treats an Assertion claimed twice as a fault, because then nobody owns it", () => {
    const shared = withTickets(
      sourcing.tickets.map((t) =>
        t.id === "check-export" ? { ...t, fulfills: [...t.fulfills, "A-LEAD-003"] } : t,
      ),
    );

    expect(faults(shared)).toContainEqual({
      kind: "assertion-claimed-twice",
      assertion: "A-LEAD-003",
      tickets: ["check-export", "source-every-claim"],
    });
  });

  it("lets a Validator Ticket claim nothing, since it checks a Milestone rather than an Assertion", () => {
    const validators = sourcing.tickets.filter((t) => t.validates !== undefined);

    expect(validators).toHaveLength(2);
    expect(validators.every((t) => t.fulfills.length === 0)).toBe(true);
    expect(faults(sourcing)).toEqual([]);
  });

  it("refuses a Milestone that nothing validates", () => {
    const unchecked = withTickets(sourcing.tickets.filter((t) => t.id !== "validate-qualify"));

    expect(faults(unchecked)).toContainEqual({
      kind: "milestone-without-validation",
      milestone: "qualify",
    });
  });

  it("catches preconditions that close a loop, which would never start", () => {
    const deadlocked = withTickets(
      sourcing.tickets.map((t) =>
        t.id === "sweep-directories" ? { ...t, preconditions: ["source-every-claim"] } : t,
      ),
    );
    const cycle = faults(deadlocked).find((f) => f.kind === "circular-preconditions");

    expect(cycle).toBeDefined();
    expect(new Set(cycle?.kind === "circular-preconditions" ? cycle.tickets : [])).toEqual(
      new Set(["sweep-directories", "check-export", "source-every-claim"]),
    );
  });

  it("reports a cycle once rather than once per Ticket in it", () => {
    const deadlocked = withTickets(
      sourcing.tickets.map((t) =>
        t.id === "sweep-directories" ? { ...t, preconditions: ["source-every-claim"] } : t,
      ),
    );

    expect(faults(deadlocked).filter((f) => f.kind === "circular-preconditions")).toHaveLength(1);
  });

  it("names references that point at nothing", () => {
    const dangling = withTickets([
      ...sourcing.tickets,
      {
        id: "stray",
        description: "Points nowhere.",
        milestone: "outreach",
        fulfills: ["A-LEAD-009"],
        preconditions: ["never-planned"],
      },
    ]);
    const found = faults(dangling);

    expect(found).toContainEqual({
      kind: "unknown-milestone",
      ticket: "stray",
      milestone: "outreach",
    });
    expect(found).toContainEqual({
      kind: "unknown-assertion",
      ticket: "stray",
      assertion: "A-LEAD-009",
    });
    expect(found).toContainEqual({
      kind: "unknown-precondition",
      ticket: "stray",
      precondition: "never-planned",
    });
  });
});
