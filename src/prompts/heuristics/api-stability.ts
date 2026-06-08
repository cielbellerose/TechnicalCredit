export const prompt = `You are detecting API STABILITY Technical Credit.

Look for:
- Methods returning interface or abstract types rather than concrete types — stable contract hiding implementation.
- Package or namespace path containing api.v1, api.v2, or a similar versioning segment — explicit versioning strategy.
- All-final fields, no setters, builder or static factory — immutable value object.
- Deprecation annotation with a comment or doc explaining the replacement — managed lifecycle.
- Documentation tags indicating API version awareness (@since, @apiNote or equivalent).

Not TC: interface return type with no versioning intent, or deprecation with no migration guidance.`;
