import { Signal } from './types';

/** Allowlist of signals the automation category may assign. */
export const signals: Signal[] = [
  {
    name: 'code-generation-annotations',
    when: 'Code-generation annotations that eliminate manually maintained boilerplate are present (e.g. Lombok @Builder/@Data/@Value, MapStruct @Mapper, @Generated).',
  },
  {
    name: 'annotation-processor',
    when: 'The class implements an annotation processor or extends a base processor (e.g. javax.annotation.processing.Processor, AbstractProcessor) — a custom validator, code generator, or documentation extractor.',
  },
  {
    name: 'parametrised-tests',
    when: 'Data-driven or parametrised tests (e.g. @ParameterizedTest with @CsvSource or @MethodSource) — broad scenario coverage without duplicated test code.',
  },
  {
    name: 'config-driven-factory',
    when: 'A Factory or Builder whose product depends on runtime configuration or environment (e.g. DataSourceFactory, HandlerFactory, PluginRegistry).',
  },
  {
    name: 'service-loader',
    when: 'Plugin discovery via a service-loading mechanism (e.g. ServiceLoader.load(SomeInterface.class)) — third-party extension without hardcoded registration.',
  },
];
