import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated coverage output.
    "coverage/**",
    // Plain CommonJS scripts used only by CI (GitHub Actions), not part
    // of the app's TypeScript/React source.
    ".github/workflows/scripts/**",
  ]),
  {
    // Tests that exercise the CommonJS CI scripts above must require()
    // them directly (they are not transpiled ESM/TS).
    files: ["tests/**/*.test.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
