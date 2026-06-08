/** A single allowlisted signal a category may emit, with guidance on when to assign it. */
export interface Signal {
  /** The dashed tag emitted in the annotation's `signals` list. */
  name: string;
  /** The condition under which Claude should assign this signal. */
  when: string;
}
