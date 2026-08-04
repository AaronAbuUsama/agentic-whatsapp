/**
 * What a Worker can do: the working directory, and nothing else.
 *
 * There is no local-versus-sandbox seam here on purpose. A sandbox buys
 * isolation, and isolation is bought more cheaply by pointing the working
 * directory at a scratch copy or a worktree. If that ever stops being true the
 * seam is one file, not an architecture.
 *
 * Containment is a real boundary rather than a convenience: every path is
 * resolved and checked against the root before it is touched, because the thing
 * holding these tools is a language model acting on its own judgement.
 */

import { exec as execCallback } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import { tool } from "ai";
import { z } from "zod";

const exec = promisify(execCallback);

/** Resolve inside the root, or refuse. `..` and absolute paths both land here. */
function within(root: string, path: string): string {
  const full = resolve(root, path);
  const rel = relative(root, full);
  if (rel.startsWith("..") || rel.startsWith(`..${sep}`) || resolve(rel) === rel) {
    throw new Error(`path escapes the working directory: ${path}`);
  }
  return full;
}

export type WorkspaceLog = {
  readonly kind: "read" | "write" | "list" | "exec";
  readonly detail: string;
  readonly ok: boolean;
};

/**
 * Tools bound to one working directory, plus the log of what was actually done
 * with them. The log is evidence: a Handoff claiming a command ran is checkable
 * against it.
 */
export function workspaceTools(root: string) {
  const log: WorkspaceLog[] = [];
  const record = <T>(kind: WorkspaceLog["kind"], detail: string, run: () => Promise<T>) =>
    run().then(
      (value) => {
        log.push({ kind, detail, ok: true });
        return value;
      },
      (error: unknown) => {
        log.push({ kind, detail, ok: false });
        return `error: ${error instanceof Error ? error.message : String(error)}`;
      },
    );

  const tools = {
    read_file: tool({
      description: "Read a UTF-8 file from the working directory.",
      inputSchema: z.object({ path: z.string().describe("Relative to the working directory.") }),
      execute: ({ path }) =>
        record("read", path, async () => await readFile(within(root, path), "utf8")),
    }),

    write_file: tool({
      description: "Write a UTF-8 file, creating parent directories. Overwrites.",
      inputSchema: z.object({ path: z.string(), content: z.string() }),
      execute: ({ path, content }) =>
        record("write", path, async () => {
          const full = within(root, path);
          await mkdir(dirname(full), { recursive: true });
          await writeFile(full, content, "utf8");
          return `wrote ${content.length} bytes to ${path}`;
        }),
    }),

    list_files: tool({
      description: "List entries in a directory of the working directory.",
      inputSchema: z.object({ path: z.string().default(".") }),
      execute: ({ path }) =>
        record("list", path, async () => {
          const entries = await readdir(within(root, path), { withFileTypes: true });
          return entries.map((e) => (e.isDirectory() ? `${e.name}/` : e.name)).join("\n");
        }),
    }),

    run_command: tool({
      description: "Run a shell command in the working directory. Use this to check your own work.",
      inputSchema: z.object({ command: z.string() }),
      execute: ({ command }) =>
        record("exec", command, async () => {
          const { stdout, stderr } = await exec(command, {
            cwd: root,
            timeout: 60_000,
            maxBuffer: 1024 * 1024,
          });
          return `exit 0\n${stdout}${stderr ? `\nstderr:\n${stderr}` : ""}`.slice(0, 8000);
        }),
    }),
  };

  return { tools, log };
}
