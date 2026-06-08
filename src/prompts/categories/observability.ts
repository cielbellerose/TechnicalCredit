import { Signal } from './types';

/** Allowlist of signals the observability category may assign. */
export const signals: Signal[] = [
  {
    name: 'metrics-instrumentation',
    when: 'Metrics registration via a metrics library (e.g. Micrometer Counter/Timer/Gauge, or @Timed/@Counted annotations) — quantitative runtime observability.',
  },
  {
    name: 'structured-logging',
    when: 'Logging with key=value pairs or diagnostic context (MDC) rather than string concatenation — machine-parseable log output.',
  },
  {
    name: 'distributed-tracing',
    when: 'Distributed-tracing instrumentation such as span creation or trace propagation (e.g. @WithSpan, Tracer.spanBuilder(), OpenTelemetry imports).',
  },
  {
    name: 'health-check',
    when: 'A health check exposing readiness or liveness state (e.g. implements HealthIndicator, @Readiness/@Liveness, or an actuator endpoint).',
  },
  {
    name: 'domain-event-publishing',
    when: 'Domain event publishing with rich context payloads (e.g. ApplicationEventPublisher, an EventBus, or domain event interfaces like OrderPlacedEvent) — observable side effects.',
  },
];
