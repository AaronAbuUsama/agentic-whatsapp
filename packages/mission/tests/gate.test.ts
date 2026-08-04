import { describe, expect, it } from "vite-plus/test";
import { faults, mayRun, type PlanRecords } from "../gate.ts";

/**
 * The fixture is the real sourcing brief from `~/projects/coffee-business` —
 * deliberately not software, because the claim under test is that the gate
 * survives off code. If this stops reading like work a person could do, the
 * abstraction has drifted back toward a build system.
 */
const sourcing: PlanRecords = {
  assertions: [
    { id: "VAL-LEAD-001" }, // forty distinct organisations
    { id: "VAL-LEAD-002" }, // thirty carry an export claim
    { id: "VAL-SRC-001" }, // every factual claim carries a source
  ],
  milestones: [{ id: "research" }, { id: "qualify" }],
  features: [
    { id: "sweep-directories", milestoneId: "research" },
    { id: "check-export", milestoneId: "qualify" },
    { id: "source-every-claim", milestoneId: "qualify" },
    { id: "scrutiny-research", milestoneId: "research", validates: "research" },
    { id: "scrutiny-qualify", milestoneId: "qualify", validates: "qualify" },
  ],
  fulfills: [
    { featureId: "sweep-directories", assertionId: "VAL-LEAD-001" },
    { featureId: "check-export", assertionId: "VAL-LEAD-002" },
    { featureId: "source-every-claim", assertionId: "VAL-SRC-001" },
  ],
  preconditions: [{ featureId: "check-export", requiresFeatureId: "sweep-directories" }],
};

const without = <K extends keyof PlanRecords>(
  key: K,
  drop: (row: PlanRecords[K][number]) => boolean,
): PlanRecords => ({ ...sourcing, [key]: sourcing[key].filter((row) => !drop(row)) });

describe("the coverage gate", () => {
  it("passes a plan where every assertion has exactly one owner", () => {
    expect(faults(sourcing)).toEqual([]);
    expect(mayRun(sourcing)).toBe(true);
  });

  it("refuses a plan with an assertion nothing claims", () => {
    const plan = without("fulfills", (f) => f.assertionId === "VAL-SRC-001");

    expect(mayRun(plan)).toBe(false);
    expect(faults(plan)).toContainEqual({
      kind: "uncovered-assertion",
      assertion: "VAL-SRC-001",
    });
  });

  it("refuses a plan where two features claim one assertion, because nobody owns it", () => {
    const plan: PlanRecords = {
      ...sourcing,
      fulfills: [
        ...sourcing.fulfills,
        { featureId: "source-every-claim", assertionId: "VAL-LEAD-002" },
      ],
    };

    expect(faults(plan)).toContainEqual({
      kind: "assertion-claimed-twice",
      assertion: "VAL-LEAD-002",
      features: ["check-export", "source-every-claim"],
    });
  });

  it("refuses a validator that also claims an assertion", () => {
    const plan: PlanRecords = {
      ...sourcing,
      fulfills: [
        ...sourcing.fulfills,
        { featureId: "scrutiny-qualify", assertionId: "VAL-LEAD-002" },
      ],
    };

    expect(faults(plan)).toContainEqual({
      kind: "validator-claims-assertions",
      feature: "scrutiny-qualify",
    });
  });

  it("refuses a milestone that ends without validation", () => {
    const plan = without("features", (f) => f.id === "scrutiny-research");

    expect(faults(plan)).toContainEqual({
      kind: "milestone-without-validation",
      milestone: "research",
    });
  });

  it("names every uncovered assertion at once rather than the first", () => {
    const plan: PlanRecords = { ...sourcing, fulfills: [] };

    expect(faults(plan).filter((f) => f.kind === "uncovered-assertion")).toHaveLength(3);
  });

  it("catches preconditions that can never be satisfied", () => {
    const plan: PlanRecords = {
      ...sourcing,
      preconditions: [
        { featureId: "check-export", requiresFeatureId: "source-every-claim" },
        { featureId: "source-every-claim", requiresFeatureId: "check-export" },
      ],
    };

    const cycle = faults(plan).find((f) => f.kind === "circular-preconditions");
    expect(cycle).toBeDefined();
    expect(cycle).toMatchObject({ kind: "circular-preconditions" });
  });

  it("catches a precondition naming a feature that does not exist", () => {
    const plan: PlanRecords = {
      ...sourcing,
      preconditions: [{ featureId: "check-export", requiresFeatureId: "no-such-feature" }],
    };

    expect(faults(plan)).toContainEqual({
      kind: "unknown-precondition",
      feature: "check-export",
      requires: "no-such-feature",
    });
  });
});
