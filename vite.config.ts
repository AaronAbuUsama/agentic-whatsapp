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
  staged: {
    "*.{js,jsx,mjs,cjs,ts,tsx,mts,cts,json,jsonc,css,md,html}": "vp fmt --write",
    "*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}": "vp lint --fix",
  },
});
