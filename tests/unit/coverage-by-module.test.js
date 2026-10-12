const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  buildCoverageComment,
  classify,
} = require("../../.github/workflows/scripts/coverage-by-module.js");

describe("coverage-by-module", () => {
  describe("classify", () => {
    it("classifies the BFF api route", () => {
      expect(classify("/repo/src/app/api/weather/route.ts")).toBe(
        "api (BFF route)"
      );
    });

    it("classifies lib files", () => {
      expect(classify("/repo/src/lib/cities.ts")).toBe(
        "lib (providers & business logic)"
      );
    });

    it("classifies component files", () => {
      expect(classify("/repo/src/components/WeatherDisplay.tsx")).toBe(
        "components (UI)"
      );
    });

    it("classifies app pages/layout (non-api)", () => {
      expect(classify("/repo/src/app/page.tsx")).toBe("app (pages & layout)");
    });

    it("falls back to 'other' for unmatched paths", () => {
      expect(classify("/repo/.github/workflows/scripts/coverage-by-module.js")).toBe(
        "other"
      );
    });
  });

  describe("buildCoverageComment", () => {
    let tmpFile;

    afterEach(() => {
      if (tmpFile && fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
    });

    it("returns a markdown table grouped by module with a hidden marker", () => {
      tmpFile = path.join(os.tmpdir(), `coverage-summary-${Date.now()}.json`);
      fs.writeFileSync(
        tmpFile,
        JSON.stringify({
          "/repo/src/lib/cities.ts": {
            statements: { total: 10, covered: 10 },
            branches: { total: 2, covered: 2 },
            functions: { total: 1, covered: 1 },
            lines: { total: 10, covered: 10 },
          },
          "/repo/src/app/api/weather/route.ts": {
            statements: { total: 5, covered: 0 },
            branches: { total: 2, covered: 0 },
            functions: { total: 1, covered: 0 },
            lines: { total: 5, covered: 0 },
          },
          total: {
            statements: { total: 15, covered: 10 },
            branches: { total: 4, covered: 2 },
            functions: { total: 2, covered: 1 },
            lines: { total: 15, covered: 10 },
          },
        })
      );

      const comment = buildCoverageComment(tmpFile);

      expect(comment).toContain("<!-- coverage-by-module-report -->");
      expect(comment).toContain("lib (providers & business logic)");
      expect(comment).toContain("api (BFF route)");
      expect(comment).toContain("**Total**");
      expect(comment).toContain("66.67%"); // total statements covered pct
    });

    it("gracefully reports when no coverage summary exists", () => {
      const comment = buildCoverageComment("/nonexistent/coverage-summary.json");
      expect(comment).toContain("No coverage summary found");
    });
  });
});
