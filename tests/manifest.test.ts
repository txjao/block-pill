import { describe, expect, it } from "vitest";
import manifest from "../manifest.json";

describe("manifesto da extensão", () => {
  it("usa a identidade Block Pill e Manifest V3", () => {
    expect(manifest.name).toBe("Block Pill");
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.background.service_worker).toBe("background.js");
  });

  it("não solicita acesso a páginas antes de precisar dele", () => {
    expect("host_permissions" in manifest).toBe(false);
    expect("content_scripts" in manifest).toBe(false);
    expect("permissions" in manifest).toBe(false);
  });
});
