import { defineConfig } from "vite-plus";

// Agent-authored skills/config — not ours to format or lint.
const agentFiles = [".agents/**", ".claude/**", ".zed/**", ".vscode/**", "skills-lock.json"];

export default defineConfig({
  fmt: { ignorePatterns: agentFiles },
  lint: {
    ignorePatterns: agentFiles,
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  run: {
    cache: true,
  },
  test: {
    coverage: {
      provider: "v8",
      include: ["packages/**/src/**"],
      // Barrel re-exports and test files carry no logic to cover.
      exclude: ["**/*.test.ts", "**/index.ts"],
      reporter: ["text"],
      thresholds: {
        statements: 90,
        branches: 80,
        functions: 90,
        lines: 90,
      },
    },
  },
  staged: {
    "*.{js,jsx,mjs,cjs,ts,tsx,mts,cts,json,jsonc,css,md,html}": "vp fmt --write",
    "*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}": "vp lint --fix",
  },
});
