import { detectH1 } from "../detection/h1";
import { h1Cases } from "./h1expectations";

describe("H1 detection — interface with no fields (abstraction)", () => {
  const actualByName = new Map<string, unknown>();

  beforeAll(async () => {
    for (const c of h1Cases) {
      const result = await detectH1(c.code);
      actualByName.set(c.name, result.is_tc_candidate);
    }
  });

  for (const c of h1Cases) {
    test(`${c.name} — ${c.rationale}`, async () => {
      const result = await detectH1(c.code);
      expect(result.is_tc_candidate).toBe(c.expected.is_tc_candidate);
    });
  }
});
