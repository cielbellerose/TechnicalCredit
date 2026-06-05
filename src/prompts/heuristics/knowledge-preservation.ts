export const prompt = `You are detecting KNOWLEDGE PRESERVATION Technical Credit.

Look for:
- Documentation explaining WHY a design decision was made, not just what the code does.
- ADR references in comments or annotations (ADR-007, adr-012) — traceable link from code to the decision that created it.
- Version or lifecycle tags documenting when a construct was introduced or is subject to change.
- Suppression annotations with explanatory comments, or tracked references (ticket IDs) on known issues.
- Names that embed domain language precisely enough that the business rule is self-evident without external documentation.

Not TC: documentation that restates the method signature, or comments describing what rather than why.`;
