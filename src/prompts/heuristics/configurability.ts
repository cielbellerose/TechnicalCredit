export const prompt = `Look for:
- Constructor or setter accepting a configuration object, map, or environment — behaviour driven by external config rather than hardcoded values.
- Conditional bean or component activation based on configuration properties — environment-specific behaviour without code changes.
- Strategy interface with implementation selected by a property at startup — runtime-switchable behaviour.
- Builder with optional fields where callers configure only what they need.
- Extension point registered externally (META-INF/services or equivalent) — third-party configurability.

Not TC: class reading config values but hardcoding the valid set, or conditional wiring with no meaningful variation between environments.`;
