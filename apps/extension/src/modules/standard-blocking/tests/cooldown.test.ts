import { describe, expect, it } from "vitest";
import { COOLDOWN_HOURS } from "../cooldown";

describe("tempo de espera", () => {
  it("mantém somente os tempos definidos pelo produto", () => {
    expect(COOLDOWN_HOURS).toEqual([1, 2, 3, 5, 12, 24]);
    expect(Math.min(...COOLDOWN_HOURS)).toBe(1);
  });
});
