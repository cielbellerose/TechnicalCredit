import { Signal } from './types';

/** Allowlist of signals the configurability category may assign. */
export const signals: Signal[] = [
  {
    name: 'properties-injection',
    when: 'A constructor or setter accepting Properties, a Map, or an Environment (e.g. DataSourceConfig(Environment env)) — behaviour driven by external config rather than hardcoded values.',
  },
  {
    name: 'conditional-bean',
    when: 'A @Configuration class using @ConditionalOnProperty or @ConditionalOnMissingBean — feature flags or profile-driven bean selection.',
  },
  {
    name: 'config-selected-strategy',
    when: 'A Strategy interface whose concrete implementation is selected at startup from a property (e.g. notification.channel=email|sms|push) — runtime-switchable behaviour.',
  },
  {
    name: 'optional-field-builder',
    when: 'A Builder allowing partial construction so callers configure only the fields they need (e.g. HttpClient.Builder, ReportGenerator.Builder).',
  },
  {
    name: 'spi-extension-point',
    when: 'An interface intended for external implementation, registered via META-INF/services or ServiceLoader — a configurable extension point (plugin, driver, or codec registries).',
  },
];
