/**
 * Which model each role runs on.
 *
 * Roles are named rather than shared because the one setting most likely to
 * matter is running a Validator on a different lineage from the Worker — an
 * agent is worse at judging work its own family produced. The observed Factory
 * mission used the same model for both, so this is a dial we expect to turn
 * rather than a fact we already know.
 */

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";

const proxy = createOpenAICompatible({
  name: "vibe-proxy",
  baseURL: process.env.AMBIENT_MODEL_URL ?? "http://127.0.0.1:8318/v1",
  includeUsage: true,
});

/** Cheap and tool-capable. Verified against the proxy before anything was built on it. */
const DEFAULT = "gpt-5.3-codex-spark";

export type Role = "worker" | "validator" | "director";

const envVar: Record<Role, string> = {
  worker: "AMBIENT_WORKER_MODEL",
  validator: "AMBIENT_VALIDATOR_MODEL",
  director: "AMBIENT_DIRECTOR_MODEL",
};

export function modelFor(role: Role): LanguageModel {
  return proxy(process.env[envVar[role]] ?? process.env.AMBIENT_MODEL ?? DEFAULT);
}
