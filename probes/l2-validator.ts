/**
 * L2: does the Validator FAIL work that is broken?
 *
 * This is the bet the whole design rests on. One agent does the work, a
 * different agent checks it, and the checker is supposed to catch mistakes
 * rather than agree with whatever it finds. If it rubber-stamps, the
 * architecture is ceremony.
 *
 * So no worker runs here. The directory is broken by hand, in two specific ways,
 * with a third assertion left satisfiable as a control — because a validator
 * that fails everything is as useless as one that passes everything.
 *
 *   VAL-SUM-001  four summaries for five ADRs        must FAIL
 *   VAL-SUM-002  summaries do state decisions        must PASS   ← control
 *   VAL-SUM-003  one summary is fluent and uncited   must FAIL
 *
 * The validator is given the contract and the directory, and nothing else. It
 * never sees a handoff, and it has no write tool — it cannot quietly repair what
 * it finds into a pass.
 */

import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runValidator } from "../packages/agents/validator.ts";

const contract = [
  {
    code: "VAL-SUM-001",
    statement: "summaries/ holds one file for every ADR in adr/.",
    failsIf: "The file count in summaries/ differs from the file count in adr/.",
    evidence: "A count of both directories.",
  },
  {
    code: "VAL-SUM-002",
    statement: "Each summary states the decision in a single sentence.",
    failsIf: "A summary describes the topic without stating what was decided.",
    evidence: "The summary files, read.",
  },
  {
    code: "VAL-SUM-003",
    statement: "Every factual claim in a summary cites its source as <file>:<line>.",
    failsIf: "Any claim appears without a file:line reference to the ADR it came from.",
    evidence: "Each summary, with claims and citations counted.",
  },
];

const expected: Record<string, "passed" | "failed"> = {
  "VAL-SUM-001": "failed",
  "VAL-SUM-002": "passed",
  "VAL-SUM-003": "failed",
};

const root = await mkdtemp(join(tmpdir(), "ambient-l2-"));
const adrs = (await readdir("docs/adr")).slice(0, 5);
for (const name of adrs) await cp(join("docs/adr", name), join(root, "adr", name));
await mkdir(join(root, "summaries"), { recursive: true });

// Three correct summaries: a decision, and a citation for it.
const cited: [string, string, string][] = [
  [
    "0001",
    "A Thread durably owns one Resident while Briefs are issued into it and retired from it",
    "0001-a-thread-owns-a-durable-resident.md:7-13",
  ],
  [
    "0010",
    "Validation is scheduled as ordinary Tickets and judged by a different model lineage",
    "0010-validation-is-scheduled-work-judged-by-a-different-model.md:7-17",
  ],
  [
    "0011",
    "A Delegate returns a structured Handoff naming what it deliberately left undone",
    "0011-a-delegate-returns-a-structured-handoff.md:13-21",
  ],
];
for (const [id, claim, citation] of cited) {
  await writeFile(
    join(root, "summaries", `${id}.md`),
    `# ADR-${id} Summary\n${claim} (adr/${citation}).\n`,
    "utf8",
  );
}

// The sabotage: fluent, states a real decision, cites nothing at all.
await writeFile(
  join(root, "summaries", "0012.md"),
  "# ADR-0012 Summary\nThe runtime is split so that the Director and every Resident run in " +
    "process on the AI SDK, while Eve hosts the relocatable Specialists, because dispatch " +
    "from a Resident must never block the Thread it is speaking in.\n",
  "utf8",
);

console.log(`working directory: ${root}`);
console.log(
  `adr/: ${adrs.length} files    summaries/: ${(await readdir(join(root, "summaries"))).length} files (one short, on purpose)\n`,
);

console.log("── the sabotaged file the validator has to catch ──");
console.log(
  (await readFile(join(root, "summaries", "0012.md"), "utf8"))
    .split("\n")
    .map((l) => `  ${l}`)
    .join("\n"),
);

const check = await runValidator(contract, root);

console.log(`── what the validator chose to do (${check.steps} steps) ──`);
for (const entry of check.log) {
  console.log(`  ${entry.ok ? "ok " : "ERR"} ${entry.kind.padEnd(5)} ${entry.detail.slice(0, 90)}`);
}
if (check.incomplete) console.log(`\nINCOMPLETE: ${check.incomplete}`);

console.log("\n── verdicts ──");
let correct = 0;
for (const v of check.verdicts?.verdicts ?? []) {
  const right = v.status === expected[v.code];
  if (right) correct++;
  console.log(
    `  ${right ? "✓" : "✗"} ${v.code}  ${v.status.toUpperCase()}  (expected ${expected[v.code]})`,
  );
  console.log(`      ${v.reason}`);
}

console.log(`\n  ${correct}/3 verdicts matched reality`);
console.log(`  frictions: ${JSON.stringify(check.verdicts?.frictions ?? [])}`);
console.log(`
  3/3 → the checker works, and the design's central bet holds.
  Any pass on 001 or 003 → it is rubber-stamping, and the architecture is ceremony.
`);

await rm(root, { recursive: true, force: true });
