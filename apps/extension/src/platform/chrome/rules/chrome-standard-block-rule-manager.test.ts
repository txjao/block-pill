import { describe, expect, it } from "vitest";
import { parseHostname } from "../../../modules/site/hostname";
import { createStandardBlockRule } from "./chrome-standard-block-rule-manager";

describe("regra de bloqueio padrão do Chrome", () => {
  it("redireciona a navegação principal do domínio para a página bloqueada", () => {
    expect(
      createStandardBlockRule({ hostname: parseHostname("youtube.com"), ruleId: 7 })
    ).toEqual({
      id: 7,
      priority: 1,
      action: {
        type: "redirect",
        redirect: { extensionPath: "/src/entrypoints/blocked/index.html" }
      },
      condition: {
        requestDomains: ["youtube.com"],
        resourceTypes: ["main_frame"]
      }
    });
  });
});
