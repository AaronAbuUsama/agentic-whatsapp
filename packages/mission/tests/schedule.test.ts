import { describe, expect, it } from "vite-plus/test";
import { blocked, runnable, type ScheduleRecords } from "../schedule.ts";

/**
 * Same sourcing mission as the gate's fixture, now with execution state. Two
 * milestones, each ending in a validator, one precondition across them.
 */
const plan = (
  overrides: Partial<Record<string, ScheduleRecords["features"][number]["status"]>> = {},
): ScheduleRecords => ({
  milestones: [
    { id: "research", ordinal: 1 },
    { id: "qualify", ordinal: 2 },
  ],
  features: (
    [
      { id: "sweep-directories", milestoneId: "research" },
      { id: "scrutiny-research", milestoneId: "research", validates: "research" },
      { id: "check-export", milestoneId: "qualify" },
      { id: "source-every-claim", milestoneId: "qualify" },
      { id: "scrutiny-qualify", milestoneId: "qualify", validates: "qualify" },
    ] as const
  ).map((f) => ({ ...f, status: overrides[f.id] ?? "pending" })),
  preconditions: [{ featureId: "check-export", requiresFeatureId: "sweep-directories" }],
});

const ids = (records: ScheduleRecords) => runnable(records).map((f) => f.id);
const reasonFor = (records: ScheduleRecords, feature: string) =>
  blocked(records).find((b) => b.feature === feature)?.reason;

describe("selecting the next feature", () => {
  it("starts with the first milestone's work and nothing else", () => {
    expect(ids(plan())).toEqual(["sweep-directories"]);
  });

  it("holds a validator until its milestone's work is done", () => {
    expect(reasonFor(plan(), "scrutiny-research")).toEqual({
      kind: "awaiting-milestone-work",
      features: ["sweep-directories"],
    });
  });

  it("releases the validator once the milestone's work completes", () => {
    expect(ids(plan({ "sweep-directories": "completed" }))).toEqual(["scrutiny-research"]);
  });

  it("keeps later milestones waiting on validation, not on work finishing", () => {
    const finishedButUnvalidated = plan({ "sweep-directories": "completed" });

    expect(reasonFor(finishedButUnvalidated, "source-every-claim")).toEqual({
      kind: "awaiting-milestone",
      milestone: "research",
    });
  });

  it("opens the next milestone once its predecessor is validated", () => {
    const validated = plan({ "sweep-directories": "completed", "scrutiny-research": "completed" });

    expect(ids(validated)).toEqual(["check-export", "source-every-claim"]);
  });

  it("names the unmet precondition rather than the milestone when both could apply", () => {
    const validated = plan({ "scrutiny-research": "completed" });

    expect(reasonFor(validated, "check-export")).toEqual({
      kind: "awaiting-preconditions",
      features: ["sweep-directories"],
    });
  });

  it("does not offer work that is already running", () => {
    expect(ids(plan({ "sweep-directories": "running" }))).toEqual([]);
  });

  it("treats a failed precondition as unmet, so nothing runs on top of it", () => {
    const failed = plan({ "sweep-directories": "failed", "scrutiny-research": "completed" });

    expect(ids(failed)).toEqual(["source-every-claim"]);
    expect(reasonFor(failed, "check-export")).toEqual({
      kind: "awaiting-preconditions",
      features: ["sweep-directories"],
    });
  });
});
