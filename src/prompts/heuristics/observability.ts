export const prompt = `Ask yourself: does this code make the system's internal runtime state visible and measurable to operators or external tooling — beyond what you would get for free from a standard framework?

Apply the following decision process:

STEP 1 — FIND INSTRUMENTATION ANCHORS
Scan the code for any of these concrete anchors:
- A metrics object (Counter, Timer, Gauge, Histogram, MeterRegistry, MetricRegistry) being called with .increment(), .record(), .register(), .bind(), .tag(), or similar mutation/registration methods.
- MDC.put() / MDC.putCloseable(), or a logging call that passes a Map, a Marker with fields, StructuredArguments, or a builder pattern that attaches named fields to a log record.
- A Span, Tracer, or Scope object being created, started, annotated, or closed; @NewSpan or @WithSpan annotations on methods; context propagation via inject/extract.
- A class whose primary purpose is reporting health: implements HealthIndicator, HealthCheck, or overrides health() / check() to return a status with diagnostic detail.
- An event object constructed with multiple named fields (type, id, timestamp, outcome) and dispatched to a bus, queue, or webhook so an external system can consume it.

STEP 2 — APPLY EXCLUSION RULES
Discard any anchor found in STEP 1 if it falls into these categories:
- A plain string log call with no structured fields, no MDC context, and no marker (e.g., log.info("Starting process") counts as nothing).
- An import or dependency declaration alone — the instrumentation object must be actively used in executable code.
- Exception catch blocks that only log the exception message as a plain string and do nothing else.
- Test or mock setup code that registers fake metrics only for assertion purposes.

STEP 3 — DECIDE
If at least one valid anchor survives STEP 2, output true.
If no valid anchors survive, output false.`;
