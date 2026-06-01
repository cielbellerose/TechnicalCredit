import * as fs from "fs";
import * as path from "path";

/**
 * Shared helpers for reading the mock code in src/test/mockCode files.
 * Currently focused on MockTest.java, which contains sample Java constructs for H1 heuristic tests.
 *
 * Every heuristic test (h1.test.ts, future h2.test.ts, …) and the context
 * assembler tests read their fixtures through here, so file paths and
 * construct extraction live in one place.
 */

const MOCK_DIR = path.join(__dirname, "..", "mockCode");

/** Reads a mock source file (e.g. "MockTest.java") from src/test/mockCode. */
export function loadMock(fileName: string): string {
  return fs.readFileSync(path.join(MOCK_DIR, fileName), "utf8");
}

/**
 * Returns the source of a top-level type (class/interface/enum/record) by
 * name - the exact slice a user would highlight in the editor and send for
 * analysis. Returns "" if no such declaration is found.
 *
 * @param source - Full file text to search.
 * @param name - The declared type name, e.g. "EventListener".
 */
export function extractType(source: string, name: string): string {
  const header = new RegExp(`\\b(?:class|interface|enum|record)\\s+${name}\\b`);
  const match = header.exec(source);
  if (!match) {return "";}

  const braceStart = source.indexOf("{", match.index);
  if (braceStart === -1) {return "";}

  // Walk braces from the opening one until they balance back to zero.
  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === "{") {depth++;}
    else if (source[i] === "}" && --depth === 0) {
      return source.slice(match.index, i + 1);
    }
  }
  return "";
}
