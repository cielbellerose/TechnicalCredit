import { Signal } from './types';

/** Allowlist of signals the abstraction category may assign. */
export const signals: Signal[] = [
  {
    name: 'interface-impl-separation',
    when: 'An interface or abstract type with no fields and no concrete methods, with a separate concrete implementation in a different package or module (e.g. UserRepository / JpaUserRepository). Signals anticipated substitution of the implementation.',
  },
  {
    name: 'adapter-wrapper',
    when: 'A class whose name ends in Adapter, Wrapper, Bridge, Gateway, or Port and that wraps a third-party or legacy type (e.g. AwsS3Gateway, LegacySystemBridge) — intentional indirection over an external dependency.',
  },
  {
    name: 'constructor-injection',
    when: 'All dependencies assigned to final fields set only in the constructor, or dependency injection on the constructor rather than on fields — design anticipated swapping the implementation.',
  },
  {
    name: 'facade',
    when: 'A class that simplifies a complex subsystem by delegating to many injected collaborators without adding logic of its own (e.g. an OrderFacade over Inventory, Payment, and Notification services). Its name often ends in Facade or Service.',
  },
  {
    name: 'template-method',
    when: 'An abstract class with abstract methods whose steps are filled in by concrete subclasses (e.g. AbstractReportGenerator, BaseValidator).',
  },
];
