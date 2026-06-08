import { Signal } from './types';

/** Allowlist of signals the compliance-readiness category may assign. */
export const signals: Signal[] = [
  {
    name: 'audit-event-abstraction',
    when: 'A class or interface named AuditService, AuditEvent, AuditLog, or DomainEvent — compliance recording decoupled from business logic.',
  },
  {
    name: 'compliance-domain-type',
    when: 'Type names containing Consent, Retention, Gdpr, Regulatory, or Jurisdiction (e.g. ConsentRecord, DataRetentionPolicy) — a regulatory concept modelled as a first-class domain type.',
  },
  {
    name: 'compliance-interceptor',
    when: 'A cross-cutting interceptor, filter, or aspect applied for a compliance concern such as data masking, authorisation, or rate limiting (e.g. implements Filter or HandlerInterceptor, or uses @Aspect).',
  },
  {
    name: 'sensitive-data-annotation',
    when: 'Field or parameter annotations classifying sensitive data (e.g. @PersonalData, @Sensitive, @Pii) — enables automated compliance scanning and masking.',
  },
  {
    name: 'compliance-feature-toggle',
    when: 'A configuration-driven feature toggle gating compliance behaviour (e.g. @ConditionalOnProperty, a FeatureFlag, or a property-injected switch) — jurisdiction-specific rules without code changes.',
  },
];
