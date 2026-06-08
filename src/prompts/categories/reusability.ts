import { Signal } from './types';

/** Allowlist of signals the reusability category may assign. */
export const signals: Signal[] = [
  {
    name: 'high-fan-in',
    when: 'A class imported by many other packages, typically living in a common, shared, core, or util package (e.g. DateUtils, MoneyCalculator) — intentional shared infrastructure.',
  },
  {
    name: 'generic-type-parameters',
    when: 'A class or interface declaring type parameters (e.g. Repository<T>, Transformer<I, O>) — designed to work across multiple domain types rather than one.',
  },
  {
    name: 'reusable-abstract-base',
    when: 'An abstract class providing default implementations inherited across multiple subtypes (e.g. BaseService, AbstractValidator) — shared behaviour or lifecycle.',
  },
  {
    name: 'framework-free-utility',
    when: 'A plain-Java class with no framework imports (no Spring/Jakarta) (e.g. Money, Email, StringUtils) — intentionally portable to any context.',
  },
  {
    name: 'shared-template-method',
    when: 'An abstract class defining an algorithm skeleton whose specific steps subclasses override (e.g. AbstractImportJob, BaseReportWriter) — a reusable shared algorithm.',
  },
];
