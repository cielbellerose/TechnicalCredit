export const prompt = `You are detecting COMPLIANCE READINESS Technical Credit.

Look for:
- Audit or event abstraction (AuditService, AuditEvent, DomainEvent or equivalent) — compliance recording decoupled from business logic.
- Type names containing Consent, Retention, Gdpr, Regulatory, or Jurisdiction — regulatory concept as a first-class domain type.
- Cross-cutting interceptor, filter, or aspect applied for compliance concerns (data masking, authorisation, rate limiting).
- Field or parameter annotations classifying sensitive data (@PersonalData, @Sensitive, @Pii or equivalent) — enables automated compliance scanning.
- Feature flag or conditional property gating compliance behaviour — jurisdiction-specific rules without code changes.

Not TC: compliance-sounding name with no compliance logic, or a cross-cutting mechanism used purely for performance concerns.`;
