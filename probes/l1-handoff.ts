/**
 * L1: does a cheap model produce a Handoff worth inheriting from?
 *
 * The Handoff is the only thing that crosses between two fresh contexts. If it
 * comes back vague — "did the thing, all good" — then the whole fresh-context
 * design has nothing to stand on.
 *
 * Prints every tool call the model chose to make, so the loop is visible rather
 * than described.
 */

import { cp, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runWorker } from "../packages/agents/worker.ts";

const root = await mkdtemp(join(tmpdir(), "ambient-l1-"));
const adrs = (await readdir("docs/adr")).slice(0, 5);
for (const name of adrs) await cp(join("docs/adr", name), join(root, "adr", name));

console.log(`working directory: ${root}`);
console.log(`seeded adr/ with ${adrs.length} files\n`);

const result = await runWorker(
  {
    id: "summarise-decisions",
    description: "Summarise each ADR in adr/ into a file under summaries/, one per ADR.",
    expectedBehavior: ["summaries/ contains one markdown file per ADR in adr/"],
    assertions: [
      {
        code: "VAL-SUM-001",
        statement: "summaries/ holds one file for every ADR in adr/.",
        failsIf: "The file count in summaries/ differs from the file count in adr/.",
      },
      {
        code: "VAL-SUM-002",
        statement: "Each summary states the decision in a single sentence.",
        failsIf: "A summary describes the topic without stating what was decided.",
      },
      {
        code: "VAL-SUM-003",
        statement: "Every factual claim in a summary cites its source as <file>:<line>.",
        failsIf: "Any claim appears without a file:line reference to the ADR it came from.",
      },
    ],
  },
  root,
);

// Every command below was the model's own choice. Nothing in the prompt names a
// tool, a command, or a language.
console.log(`── what the model chose to do (${result.steps} steps) ──`);
for (const entry of result.log) {
  console.log(`  ${entry.ok ? "ok " : "ERR"} ${entry.kind.padEnd(5)} ${entry.detail.slice(0, 90)}`);
}

if (result.incomplete) console.log(`\nINCOMPLETE: ${result.incomplete}`);

console.log(`\n── the handoff ──\n${JSON.stringify(result.handoff, null, 2)}`);

console.log(`\n── what is actually on disk ──`);
for (const name of await readdir(join(root, "summaries")).catch(() => [])) {
  const body = await readFile(join(root, "summaries", name), "utf8");
  console.log(`\n  ${name}`);
  console.log(
    body
      .split("\n")
      .map((l) => `    ${l}`)
      .join("\n"),
  );
}

console.log(`
── judge it yourself ──
  Is 'whatWasLeftUndone' true, or is it filler?
  Do the commands in 'verification' match the ERR/ok log above?
  Are 'discoveredIssues' real, or invented to fill the field?
`);

await rm(root, { recursive: true, force: true });
