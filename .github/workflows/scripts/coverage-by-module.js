"use strict";

/**
 * Builds a markdown table summarizing Jest coverage grouped by logical
 * module (lib, components, the BFF api route, and app pages/layout),
 * posted as a PR comment by .github/workflows/ci.yml.
 *
 * This is a single Next.js app, not multiple deployable microservices, so
 * "module" here means a logical area of the codebase rather than a
 * separately deployed service.
 */

const fs = require("fs");

const MODULE_RULES = [
  { label: "api (BFF route)", test: (p) => p.includes("/src/app/api/") },
  { label: "lib (providers & business logic)", test: (p) => p.includes("/src/lib/") },
  { label: "components (UI)", test: (p) => p.includes("/src/components/") },
  { label: "app (pages & layout)", test: (p) => p.includes("/src/app/") },
];

const METRICS = ["statements", "branches", "functions", "lines"];

function classify(filePath) {
  const normalized = filePath.split("\\").join("/");
  const rule = MODULE_RULES.find((r) => r.test(normalized));
  return rule ? rule.label : "other";
}

function emptyTotals() {
  return METRICS.reduce((acc, metric) => {
    acc[metric] = { total: 0, covered: 0 };
    return acc;
  }, {});
}

function pct(covered, total) {
  if (total === 0) return 100;
  return Math.round((covered / total) * 10000) / 100;
}

function buildModuleBreakdown(summaryJsonPath) {
  if (!fs.existsSync(summaryJsonPath)) {
    return null;
  }

  const summary = JSON.parse(fs.readFileSync(summaryJsonPath, "utf8"));
  const groups = new Map();

  for (const [filePath, fileCoverage] of Object.entries(summary)) {
    if (filePath === "total") continue;

    const label = classify(filePath);
    if (!groups.has(label)) {
      groups.set(label, emptyTotals());
    }
    const group = groups.get(label);

    for (const metric of METRICS) {
      group[metric].total += fileCoverage[metric].total;
      group[metric].covered += fileCoverage[metric].covered;
    }
  }

  return { groups, total: summary.total };
}

function formatRow(label, totals) {
  const cells = METRICS.map(
    (metric) => `${pct(totals[metric].covered, totals[metric].total)}%`
  );
  return `| ${label} | ${cells.join(" | ")} |`;
}

function buildCoverageComment(summaryJsonPath) {
  const marker = "<!-- coverage-by-module-report -->";
  const breakdown = buildModuleBreakdown(summaryJsonPath);

  if (!breakdown) {
    return `${marker}\n## Coverage by module\n\nNo coverage summary found at \`${summaryJsonPath}\`.`;
  }

  const header = `| Module | Statements | Branches | Functions | Lines |\n| --- | --- | --- | --- | --- |`;
  const rows = [...breakdown.groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, totals]) => formatRow(label, totals));
  const totalRow = formatRow("**Total**", breakdown.total);

  return [
    marker,
    "## Coverage by module",
    "",
    "_This is a single Next.js app split into logical modules, not separate microservices._",
    "",
    header,
    ...rows,
    totalRow,
  ].join("\n");
}

module.exports = { buildCoverageComment, classify, buildModuleBreakdown };
