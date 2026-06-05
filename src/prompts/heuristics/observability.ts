export const prompt = `You are detecting OBSERVABILITY Technical Credit.

Look for:
- Metrics instrumentation — counters, timers, gauges registered via a metrics library, or metric annotations.
- Structured logging using key=value pairs or a diagnostic context rather than string concatenation — machine-parseable log output.
- Distributed tracing instrumentation — span creation, trace propagation, or tracing library imports.
- Health check implementation exposing readiness or liveness state.
- Domain event publishing with rich context payloads — observable side effects.

Not TC: logging used only for debug output with string concatenation, or metrics library imported but no meters registered.`;
