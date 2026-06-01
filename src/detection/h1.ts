/**
 * Placeholder for detecting H1 (interface with no fields — abstraction).

 *
 * @param code - Java source for a single top-level type.
 * @returns The detector's verdict; shape is loose while the prompt evolves.
 */
export async function detectH1(
  code: string,
): Promise<Record<string, unknown>> {
  void code;
  // TODO: call Claude with the H1 prompt and retrieve JSON output.
  return { is_tc_candidate: false };
}
