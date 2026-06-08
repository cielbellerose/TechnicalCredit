import { Signal } from './types';

/** Allowlist of signals the api-stability category may assign. */
export const signals: Signal[] = [
  {
    name: 'interface-return-type',
    when: 'Methods return an interface or abstract type rather than a concrete one (e.g. List not ArrayList, Map not HashMap) — a stable contract that hides the implementation.',
  },
  {
    name: 'versioned-api-package',
    when: 'Package or namespace path contains a versioning segment such as api.v1 or api.v2 — an explicit API versioning strategy.',
  },
  {
    name: 'immutable-value-object',
    when: 'All-final fields, no setters, with a builder or static factory (e.g. a record, Lombok @Value, or a hand-rolled immutable) — a stable data contract.',
  },
  {
    name: 'deprecated-with-migration',
    when: 'A deprecation annotation accompanied by documentation explaining the replacement (e.g. @deprecated Use OrderServiceV2#submit() instead) — deliberate lifecycle management.',
  },
  {
    name: 'api-lifecycle-javadoc',
    when: 'Documentation carries version/lifecycle tags such as @since, @apiNote, or @implNote — signals API awareness.',
  },
];
