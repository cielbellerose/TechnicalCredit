import { Signal } from './types';

/** Allowlist of signals the modularity category may assign. */
export const signals: Signal[] = [
  {
    name: 'package-by-feature',
    when: 'Package or module path named by domain (com.example.payments) rather than by layer (com.example.controllers) — import structure reveals a bounded context.',
  },
  {
    name: 'module-info',
    when: 'Presence of a module-info.java with explicit requires and exports (Java 9+ modules) — the strongest available modularity signal.',
  },
  {
    name: 'package-private-classes',
    when: 'Classes with no public modifier — intentional package-private encapsulation of implementation details or internal helpers.',
  },
  {
    name: 'low-internal-fan-out',
    when: 'Few imports from other internal packages relative to class size — a self-contained, loosely coupled unit (value types, domain objects).',
  },
  {
    name: 'strategy-composite',
    when: 'A Strategy interface with multiple implementations selected at runtime, or a Composite — extension without modifying existing code (e.g. PricingStrategy, NotificationChannel).',
  },
];
