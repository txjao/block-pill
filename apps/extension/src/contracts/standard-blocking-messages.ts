import type { StandardBlock } from "../modules/standard-blocking";

export type StandardBlockingRequest =
  | { type: "standard-blocking/list" }
  | { type: "standard-blocking/add"; hostname: string }
  | { type: "standard-blocking/remove"; hostname: string };

export type StandardBlockingResponse =
  | { ok: true; blocks: StandardBlock[] }
  | { ok: false; message: string };

export function isStandardBlockingRequest(
  message: unknown
): message is StandardBlockingRequest {
  if (typeof message !== "object" || message === null || !("type" in message)) {
    return false;
  }

  const type = message.type;

  if (type === "standard-blocking/list") {
    return true;
  }

  return (
    (type === "standard-blocking/add" || type === "standard-blocking/remove") &&
    "hostname" in message &&
    typeof message.hostname === "string"
  );
}
