import { spacing } from "../../../src/theme/spacing";

describe("spacing tokens", () => {
  it("has all required keys", () => {
    expect(spacing).toHaveProperty("xs");
    expect(spacing).toHaveProperty("sm");
    expect(spacing).toHaveProperty("md");
    expect(spacing).toHaveProperty("lg");
    expect(spacing).toHaveProperty("xl");
  });

  it("values are positive numbers", () => {
    Object.values(spacing).forEach((v) => {
      expect(typeof v).toBe("number");
      expect(v).toBeGreaterThan(0);
    });
  });

  it("values increase in order", () => {
    expect(spacing.xs).toBeLessThan(spacing.sm);
    expect(spacing.sm).toBeLessThan(spacing.md);
    expect(spacing.md).toBeLessThan(spacing.lg);
    expect(spacing.lg).toBeLessThan(spacing.xl);
  });
});
