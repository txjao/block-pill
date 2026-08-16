import { StandardBlock } from "@/modules/standard-blocking/standard-block";
import { StandardBlockRuleManager } from "@/modules/standard-blocking/standard-block-rule-manager";
import { StandardBlockStore } from "@/modules/standard-blocking/standard-block-store";
import { StandardBlockingService, DomainAlreadyBlockedError } from "@/modules/standard-blocking/standard-blocking-service";
import { describe, expect, it } from "vitest";


class MemoryStore implements StandardBlockStore {
  blocks: StandardBlock[] = [];

  async getAll() {
    return [...this.blocks];
  }

  async setAll(blocks: StandardBlock[]) {
    this.blocks = [...blocks];
  }
}

class MemoryRuleManager implements StandardBlockRuleManager {
  blocks: StandardBlock[] = [];
  shouldFail = false;

  async replaceAll(blocks: StandardBlock[]) {
    if (this.shouldFail) {
      throw new Error("Falha ao atualizar regras.");
    }

    this.blocks = [...blocks];
  }
}

describe("bloqueio padrão", () => {
  it("adiciona, normaliza, lista e remove um domínio", async () => {
    const store = new MemoryStore();
    const rules = new MemoryRuleManager();
    const service = new StandardBlockingService(store, rules);

    await service.add("https://www.youtube.com/feed");

    await expect(service.list()).resolves.toEqual([
      { hostname: "youtube.com", ruleId: 1 }
    ]);
    expect(rules.blocks).toEqual(store.blocks);

    await service.remove("youtube.com");

    await expect(service.list()).resolves.toEqual([]);
    expect(rules.blocks).toEqual([]);
  });

  it("não permite cadastrar o mesmo domínio duas vezes", async () => {
    const service = new StandardBlockingService(
      new MemoryStore(),
      new MemoryRuleManager()
    );

    await service.add("youtube.com");

    await expect(service.add("www.youtube.com")).rejects.toBeInstanceOf(
      DomainAlreadyBlockedError
    );
  });

  it("restaura o armazenamento quando a regra do navegador falha", async () => {
    const store = new MemoryStore();
    const rules = new MemoryRuleManager();
    const service = new StandardBlockingService(store, rules);
    rules.shouldFail = true;

    await expect(service.add("youtube.com")).rejects.toThrow(
      "Falha ao atualizar regras."
    );
    expect(store.blocks).toEqual([]);
  });
});
