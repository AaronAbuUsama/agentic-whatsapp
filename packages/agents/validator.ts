/**
 * Checking work it did not do.
 *
 * Two design points carry the weight, and both are refusals:
 *
 * **No write tool.** A validator that can fix what it finds stops being a
 * validator — it becomes a second worker with a grudge, and the failure it
 * repaired never gets recorded. It reads, it runs commands, it judges.
 *
 * **No handoff.** It is not shown what the worker claimed. A validator handed the
 * worker's own account of success is being invited to ratify it, which is the
 * self-evaluation bias this role exists to defeat, reintroduced through the
 * context window.
 */

import { generateText, hasToolCall, stepCountIs, tool } from "ai";
import { z } from "zod";
import { modelFor } from "./model.ts";
import { workspaceTools, type WorkspaceLog } from "./tools.ts";

export const verdictSchema = z.object({
  verdicts: z.array(
    z.object({
      code: z.string(),
      status: z.enum(["passed", "failed", "blocked"]),
      reason: z.string().describe("For a failure, the specific thing that is wrong."),
      evidence: z
        .array(z.string())
        .describe("Commands run or file paths inspected that establish this."),
    }),
  ),
  frictions: z
    .array(z.string())
    .describe("Difficulty encountered doing the validation itself, not with the work."),
  salientSummary: z.string(),
});

export type Verdicts = z.infer<typeof verdictSchema>;

export type ValidatorAssertion = {
  readonly code: string;
  readonly statement: string;
  readonly failsIf: string;
  readonly evidence: string;
};

export type ValidatorResult = {
  readonly verdicts: Verdicts | undefined;
  readonly log: readonly WorkspaceLog[];
  readonly steps: number;
  readonly incomplete?: string;
};

const SYSTEM = `You are validating work you did not do, against a contract you did not write.

You can read files and run commands in the working directory. You cannot change
anything, and you must not try — if something is wrong, that is a finding, not a
task.

Each assertion carries the condition under which it FAILS. Check that condition
specifically. Do not reason from whether the work looks reasonable or whether
effort was evident; check the stated failure condition against what is actually
in the directory.

Test user-visible behaviour and real artifacts. Implementation preferences are
not your concern. If you cannot establish an assertion either way, mark it
blocked rather than guessing.

Call report_verdicts once, covering every assertion.`;

export async function runValidator(
  assertions: readonly ValidatorAssertion[],
  workingDirectory: string,
  options: { maxSteps?: number } = {},
): Promise<ValidatorResult> {
  const { tools, log } = workspaceTools(workingDirectory);
  // Deliberate: a validator reads and runs, it does not write.
  const { write_file: _omitted, ...readOnly } = tools;

  let verdicts: Verdicts | undefined;
  const report_verdicts = tool({
    description: "Report a verdict for every assertion. Call exactly once.",
    inputSchema: verdictSchema,
    execute: (input) => {
      verdicts = input;
      return "verdicts recorded";
    },
  });

  const prompt = [
    "# Assertions to check",
    ...assertions.map(
      (a) =>
        `\n## ${a.code}\n${a.statement}\n\nFails if: ${a.failsIf}\nEvidence expected: ${a.evidence}`,
    ),
  ].join("\n");

  const result = await generateText({
    model: modelFor("validator"),
    system: SYSTEM,
    prompt,
    tools: { ...readOnly, report_verdicts },
    stopWhen: [hasToolCall("report_verdicts"), stepCountIs(options.maxSteps ?? 30)],
  });

  return {
    verdicts,
    log,
    steps: result.steps.length,
    ...(verdicts
      ? {}
      : { incomplete: `stopped after ${result.steps.length} steps without verdicts` }),
  };
}
