import { noop } from "../../../src/utils/noop";

describe("noop", () => {
  it("returns undefined", () => {
    expect(noop()).toBeUndefined();
  });

  it("does not throw", () => {
    expect(() => noop()).not.toThrow();
  });
});
