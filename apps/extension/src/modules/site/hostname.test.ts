import { describe, expect, it } from "vitest";
import { InvalidHostnameError, parseHostname } from "./hostname";

describe("hostname", () => {
  it.each([
    ["youtube.com", "youtube.com"],
    ["www.YouTube.com", "youtube.com"],
    ["https://www.youtube.com/watch?v=123", "youtube.com"],
    ["https://m.youtube.com/", "m.youtube.com"],
    ["https://ação.com.br", "xn--ao-siap.com.br"]
  ])("normaliza %s", (input, expected) => {
    expect(parseHostname(input)).toBe(expected);
  });

  it.each(["", "youtube", "https://", "chrome://extensions", "-site.com"])(
    "rejeita %s",
    (input) => {
      expect(() => parseHostname(input)).toThrow(InvalidHostnameError);
    }
  );
});
