import { describe, expect, it } from "vitest";
import { TEMPORARY_UNLOCK_MINUTES } from "../temporary-access";

describe("acesso temporário", () => {
  it("limita o desbloqueio temporário a 15 minutos", () => {
    expect(TEMPORARY_UNLOCK_MINUTES).toEqual([1, 5, 15]);
    expect(Math.max(...TEMPORARY_UNLOCK_MINUTES)).toBe(15);
  });
});
