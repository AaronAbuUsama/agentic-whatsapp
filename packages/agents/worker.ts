/**
 * One unit of work, in a context that has never seen another one.
 *
 * A Worker is handed its feature, the assertions that feature is responsible
 * for, and a working directory. It is not handed the previous worker's
 * transcript — that is the whole point, and the Handoff is what crosses the gap
 * instead.
 *
 * The assertions arrive verbatim, failure conditions included, and the prompt
 * deliberately does not restate or emphasise them. A worker nagged into
 * compliance tells you nothing about whether the mechanism works; the Validator
 * having something real to catch is the experiment.
 */

import { generateText, hasToolCall, stepCountIs, tool } from "ai";
import { z } from "zod";
import { modelFor } from "./model.ts";
import { workspaceTools, type WorkspaceLog } from "./tools.ts";

export const handoffSchema = z.object({
  successState: z.enum(["success", "partial", "failed", "blocked"]),
  salientSummary: z.string().describe("What the orchestrator needs to know, in two sentences."),
  whatWasImplemented: z.string(),
  whatWasLeftUndone: z
    .string()
    .describe("State it plainly. 'Nothing' is a valid answer only if it is true."),
  verification: z.object({
    commandsRun: z.array(
      z.object({ command: z.string(), exitCode: z.number(), observation: z.string() }),
    ),
  }),
  discoveredIssues: z
    .array(z.string())
    .describe("Problems noticed outside this feature's scope. Report them; do not fix them."),
  skillFeedback: z.object({
    followedProcedure: z.boolean(),
    deviations: z.array(z.string()),
    suggestedChanges: z.array(z.string()),
  }),
});

export type Handoff = z.infer<typeof handoffSchema>;

export type WorkerFeature = {
  readonly id: string;
  readonly description: string;
  readonly expectedBehavior: readonly string[];
  readonly assertions: readonly {
    readonly code: string;
    readonly statement: string;
    readonly failsIf: string;
  }[];
  /** The procedure to follow, if the Mission minted one. */
  readonly skill?: string;
};

export type WorkerResult = {
  readonly handoff: Handoff | undefined;
  readonly log: readonly WorkspaceLog[];
  readonly steps: number;
  /** Set when the worker stopped without handing off — a failure mode worth naming. */
  readonly incomplete?: string;
};

const SYSTEM = `You are a worker on one feature of a larger mission.

You have a working directory and tools to read, write, list and run commands in it.
Nothing outside it exists for you.

You are responsible for the assertions listed below. They are the contract: each
carries the condition under which it FAILS. Judge your own work against those
conditions before you finish.

When you are done — or when you cannot continue — call finish_feature. Report what
you did not do as carefully as what you did. A later worker inherits nothing but
your handoff, and a validator that did not write this code will check it.`;

function prompt(feature: WorkerFeature): string {
  const assertions = feature.assertions
    .map((a) => `${a.code}: ${a.statement}\n  Fails if: ${a.failsIf}`)
    .join("\n\n");

  return [
    `# Feature: ${feature.id}`,
    feature.description,
    feature.expectedBehavior.length > 0
      ? `\n## Expected afterwards\n${feature.expectedBehavior.map((b) => `- ${b}`).join("\n")}`
      : "",
    `\n## Assertions you are responsible for\n\n${assertions}`,
    feature.skill ? `\n## Procedure\n${feature.skill}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function runWorker(
  feature: WorkerFeature,
  workingDirectory: string,
  options: { maxSteps?: number } = {},
): Promise<WorkerResult> {
  const { tools, log } = workspaceTools(workingDirectory);
  let handoff: Handoff | undefined;

  const finish_feature = tool({
    description: "Hand this feature back. Call exactly once, when done or stuck.",
    inputSchema: handoffSchema,
    execute: (input) => {
      handoff = input;
      return "handoff recorded";
    },
  });

  const result = await generateText({
    model: modelFor("worker"),
    system: SYSTEM,
    prompt: prompt(feature),
    tools: { ...tools, finish_feature },
    stopWhen: [hasToolCall("finish_feature"), stepCountIs(options.maxSteps ?? 30)],
  });

  return {
    handoff,
    log,
    steps: result.steps.length,
    // A worker that burns its budget without handing off is not a success with a
    // missing field; it is a distinct outcome and the loop must treat it as one.
    ...(handoff
      ? {}
      : { incomplete: `stopped after ${result.steps.length} steps without a handoff` }),
  };
}
