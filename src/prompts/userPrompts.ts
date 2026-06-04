import { TcContext } from '@/context/buildContext';

const heuristicCategories = [
  'abstraction',
  'modularity',
  'api-stability',
  'automation',
  'knowledge-preservation ',
  'configurability',
  'observability',
  'reusability',
  'compliance-readiness',
];

type HeuristicCategory = (typeof heuristicCategories)[number];

export function createUserPrompt(context: TcContext) {
  return [
    `Analyse the following code construct for Technical Credit patterns.`,
    `File: ${context.fileName}`,
    `Language: ${context.language}`,
    context.importLines.length > 0
      ? `Imports:\n${context.importLines.join('\n')}`
      : null,
    `Pre-extracted construct metrics (tree-sitter):\n${JSON.stringify(context.constructMetrics, null, 2)}`,
    `Class source:\n${context.constructMetrics.classSource}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function createHeuristicPrompt(heuristic: HeuristicCategory): string {
  const heuristicMapping: Record<HeuristicCategory, string> = {
    abstraction: `Analyse the following code construct for Technical Credit patterns related to ABSTRACTION (interface/impl separation, adapter/wrapper, constructor injection, facade, template method).`,

    modularity: `Analyse the following code construct for Technical Credit patterns related to MODULARITY (package-by-feature, module-info.java, package-private classes, low internal fan-out, strategy/composite for extension).`,

    'api-stability': `Analyse the following code construct for Technical Credit patterns related to API STABILITY (return type is interface not concrete, versioned API packages, immutable value objects, @Deprecated with migration guidance, @since/@apiNote Javadoc tags).`,

    automation: `Analyse the following code construct for Technical Credit patterns related to AUTOMATION (Lombok @Builder/@Data/@Value, MapStruct @Mapper, @Generated, annotation processors, parametrised tests, factory/builder for config-driven creation, ServiceLoader).`,

    'knowledge-preservation ': `Analyse the following code construct for Technical Credit patterns related to KNOWLEDGE PRESERVATION (ADR reference, rationale field in annotation, comprehensive Javadoc).`,

    configurability: `Analyse the following code construct for Technical Credit patterns related to CONFIGURABILITY (constructor/setter accepts Properties/Map/Environment, @Configuration + @ConditionalOnProperty/@ConditionalOnMissingBean, strategy selected by property, builder with optional fields, @SPI/ServiceLoader extension point).`,

    observability: `Analyse the following code construct for Technical Credit patterns related to OBSERVABILITY (Micrometer imports like io.micrometer.*, @Timed/@Counted, structured logging with key=value pairs or MDC, @WithSpan/Tracer/io.opentelemetry, HealthIndicator/@Readiness/@Liveness, ApplicationEventPublisher/EventBus).`,

    reusability: `Analyse the following code construct for Technical Credit patterns related to REUSABILITY (high fan-in components in common/shared/core/util packages, generic classes with type parameters, abstract base with reusable behaviour, framework-free utility classes, template method for shared algorithm).`,

    'compliance-readiness': `Analyse the following code construct for Technical Credit patterns related to COMPLIANCE READINESS (audit/event abstractions like AuditService/AuditEvent/DomainEvent, compliance domain types like Consent/Retention/Gdpr/Regulatory/Jurisdiction, cross-cutting interceptors/filters, annotations like @PersonalData/@Sensitive/@Pii and @ConditionalOnProperty/FeatureFlag).`,
  };

  return heuristicMapping[heuristic];
}
