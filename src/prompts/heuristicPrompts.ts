export type HeuristicCategory =
  | 'abstraction'
  | 'modularity'
  | 'api-stability'
  | 'automation'
  | 'knowledge-preservation'
  | 'configurability'
  | 'observability'
  | 'reusability'
  | 'compliance-readiness';

export function createHeuristicPrompt(heuristic: HeuristicCategory): string {
  const heuristicPrompts: Record<HeuristicCategory, string> = {
    abstraction: ABSTRACTION_PROMPT,
    modularity: MODULARITY_PROMPT,
    'api-stability': API_STABILITY_PROMPT,
    automation: AUTOMATION_PROMPT,
    'knowledge-preservation': KNOWLEDGE_PRESERVATION_PROMPT,
    configurability: CONFIGURABILITY_PROMPT,
    observability: OBSERVABILITY_PROMPT,
    reusability: REUSABILITY_PROMPT,
    'compliance-readiness': COMPLIANCE_READINESS_PROMPT,
  };

  return heuristicPrompts[heuristic];
}

const ABSTRACTION_PROMPT = `You are detecting ABSTRACTION Technical Credit.

Look for:
- Interface or abstract type with no fields and no concrete methods — strong TC if a separate implementation exists in a different package or module.
- Class name ending in Adapter, Wrapper, Bridge, Gateway, or Port — intentional indirection over a third-party or legacy type.
- Constructor assigning all dependencies to final fields, or dependency injection on the constructor not on fields — design anticipated swapping implementations.
- Abstract class with abstract methods filled in by subclasses (Template Method).
- Class delegating to many injected collaborators without adding logic (Facade).

Not TC: interface with a single implementation in the same package, or abstract class used only as a code-sharing shortcut.`;

const MODULARITY_PROMPT = `You are detecting MODULARITY Technical Credit.

Look for:
- Package or module path named by domain (com.example.payments) not layer (com.example.controllers) — bounded context boundary.
- Class with no public modifier — deliberate package-private encapsulation.
- Few imports from other internal packages relative to class size — low fan-out, self-contained unit.
- Strategy or Composite pattern — extension without modification.

Not TC: class in a layer-named package, or high cross-package imports that grew organically.`;

const API_STABILITY_PROMPT = `You are detecting API STABILITY Technical Credit.

Look for:
- Methods returning interface or abstract types rather than concrete types — stable contract hiding implementation.
- Package or namespace path containing api.v1, api.v2, or a similar versioning segment — explicit versioning strategy.
- All-final fields, no setters, builder or static factory — immutable value object.
- Deprecation annotation with a comment or doc explaining the replacement — managed lifecycle.
- Documentation tags indicating API version awareness (@since, @apiNote or equivalent).

Not TC: interface return type with no versioning intent, or deprecation with no migration guidance.`;

const AUTOMATION_PROMPT = `You are detecting AUTOMATION Technical Credit.

Look for:
- Code generation annotations that eliminate manually maintained boilerplate (@Builder, @Data, @Mapper, @Generated or equivalents).
- Custom annotation processor or compile-time code generator.
- Parametrised or data-driven tests — broad scenario coverage without duplication.
- Factory or Builder whose product depends on runtime configuration — config-driven object creation.
- Plugin discovery mechanism that avoids hardcoded registration (ServiceLoader or equivalent).

Not TC: code generation used purely for convenience with no architectural intent, or a factory that just wraps a constructor.`;

const KNOWLEDGE_PRESERVATION_PROMPT = `You are detecting KNOWLEDGE PRESERVATION Technical Credit.

Look for:
- Documentation explaining WHY a design decision was made, not just what the code does.
- ADR references in comments or annotations (ADR-007, adr-012) — traceable link from code to the decision that created it.
- Version or lifecycle tags documenting when a construct was introduced or is subject to change.
- Suppression annotations with explanatory comments, or tracked references (ticket IDs) on known issues.
- Names that embed domain language precisely enough that the business rule is self-evident without external documentation.

Not TC: documentation that restates the method signature, or comments describing what rather than why.`;

const CONFIGURABILITY_PROMPT = `You are detecting CONFIGURABILITY Technical Credit.

Look for:
- Constructor or setter accepting a configuration object, map, or environment — behaviour driven by external config rather than hardcoded values.
- Conditional bean or component activation based on configuration properties — environment-specific behaviour without code changes.
- Strategy interface with implementation selected by a property at startup — runtime-switchable behaviour.
- Builder with optional fields where callers configure only what they need.
- Extension point registered externally (META-INF/services or equivalent) — third-party configurability.

Not TC: class reading config values but hardcoding the valid set, or conditional wiring with no meaningful variation between environments.`;

const OBSERVABILITY_PROMPT = `You are detecting OBSERVABILITY Technical Credit.

Look for:
- Metrics instrumentation — counters, timers, gauges registered via a metrics library, or metric annotations.
- Structured logging using key=value pairs or a diagnostic context rather than string concatenation — machine-parseable log output.
- Distributed tracing instrumentation — span creation, trace propagation, or tracing library imports.
- Health check implementation exposing readiness or liveness state.
- Domain event publishing with rich context payloads — observable side effects.

Not TC: logging used only for debug output with string concatenation, or metrics library imported but no meters registered.`;

const REUSABILITY_PROMPT = `You are detecting REUSABILITY Technical Credit.

Look for:
- Class in a package named common, shared, core, or util that is imported across many modules — intentional shared infrastructure.
- Generic type parameters — designed to work across multiple domain types rather than one.
- Abstract class with default implementations inherited across multiple subclasses — shared algorithm or lifecycle.
- No framework imports — portable to any context, not tied to a specific runtime.
- Template Method pattern — reusable algorithm skeleton with customisable steps.

Not TC: utility class extracted for a single caller, or generic class whose type parameter is only ever instantiated with one concrete type.`;

const COMPLIANCE_READINESS_PROMPT = `You are detecting COMPLIANCE READINESS Technical Credit.

Look for:
- Audit or event abstraction (AuditService, AuditEvent, DomainEvent or equivalent) — compliance recording decoupled from business logic.
- Type names containing Consent, Retention, Gdpr, Regulatory, or Jurisdiction — regulatory concept as a first-class domain type.
- Cross-cutting interceptor, filter, or aspect applied for compliance concerns (data masking, authorisation, rate limiting).
- Field or parameter annotations classifying sensitive data (@PersonalData, @Sensitive, @Pii or equivalent) — enables automated compliance scanning.
- Feature flag or conditional property gating compliance behaviour — jurisdiction-specific rules without code changes.

Not TC: compliance-sounding name with no compliance logic, or a cross-cutting mechanism used purely for performance concerns.`;
