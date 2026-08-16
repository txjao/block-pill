import { describe, expect, it } from "vitest";
import manifest from "../manifest.json";

describe("manifesto da extensão", () => {
  it("usa a identidade Block Pill e Manifest V3", () => {
    expect(manifest.name).toBe("Block Pill");
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.background.service_worker).toBe("background.js");
  });

  it("solicita somente as permissões necessárias ao bloqueio padrão", () => {
    expect(manifest.permissions).toEqual(["storage", "declarativeNetRequest"]);
    expect(manifest.host_permissions).toEqual(["http://*/*", "https://*/*"]);
    expect("content_scripts" in manifest).toBe(false);
    expect(manifest.permissions).not.toContain("tabs");
    expect(manifest.permissions).not.toContain("webNavigation");
  });

  it("expõe somente a página usada pelo redirecionamento", () => {
    expect(manifest.web_accessible_resources).toEqual([
      {
        resources: ["src/entrypoints/blocked/index.html"],
        matches: ["http://*/*", "https://*/*"]
      }
    ]);
  });
});
