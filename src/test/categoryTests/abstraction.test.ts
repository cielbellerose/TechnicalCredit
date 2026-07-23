import { analyseConstruct } from '../support/analyseLive';

/**
 * ABSTRACTION Category Tests
 *
 * Tests each of the abstraction signals:
 *   - Interface + implementation separation
 *   - Adapter/wrapper
 *   - Constructor injection
 *   - Facade
 *   - Template Method
 *
 * Each test sends one MockCalculator.java construct to Claude for a live
 * analysis and asserts the parsed output.
 *
 * Requires ANTHROPIC_API_KEY
 */
jest.setTimeout(60_000);
const MOCK_FILE = 'MockCalculator.java';

describe('Abstraction: interface + implementation separation', () => {
  // --- Positive: no-field interface implemented by a concrete class ---
  test('Operation → abstraction (single-method interface, no fields)', async () => {
    const result = await analyseConstruct(
      'Operation',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('abstraction');
  });

  test('DecimalHistoryStore → TC (implements a no-field interface from a different package)', async () => {
    const result = await analyseConstruct(
      'DecimalHistoryStore',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(true);
    expect(['abstraction', 'modularity']).toContain(result.category);
  });

  // --- Negative: no interface at all, or impl kept in the same package ---
  test('QuickAdd → not TC (concrete class, no interface separation)', async () => {
    const result = await analyseConstruct('QuickAdd', 'abstraction', MOCK_FILE);

    expect(result.is_tc_candidate).toBe(false);
  });

  test('InMemoryHistoryStore → not TC (same-package interface — no boundary crossed)', async () => {
    const result = await analyseConstruct(
      'InMemoryHistoryStore',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(false);
  });
});

describe('Abstraction: adapter/wrapper', () => {
  // --- Positive: name ends in Adapter/Wrapper/Bridge/Gateway/Port, wraps a third-party type ---
  test('ExchangeRateGateway → TC (Gateway suffix, wraps the third-party ExchangeRateClient)', async () => {
    const result = await analyseConstruct(
      'ExchangeRateGateway',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('abstraction');
  });

  test('ApacheMathAdapter → TC (Adapter suffix, wraps the third-party ApacheCommonsMath)', async () => {
    const result = await analyseConstruct(
      'ApacheMathAdapter',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('abstraction');
  });

  // --- Negative: suffix matches, but nothing third-party is actually wrapped ---
  test('ResultWrapper → not TC (Wrapper suffix, but a plain data holder)', async () => {
    const result = await analyseConstruct(
      'ResultWrapper',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(false);
  });
});

describe('Abstraction: constructor injection', () => {
  // --- Positive: final field set only in the constructor, @Autowired on the constructor ---
  test('CalculatorEngine → TC (final fields, constructor-injected, @Autowired on the constructor)', async () => {
    const result = await analyseConstruct(
      'CalculatorEngine',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('abstraction');
  });

  // --- Negative: field-level @Autowired, not constructor injection ---
  test('LegacyCalculatorEngine → not TC (field-level @Autowired, not constructor injection)', async () => {
    const result = await analyseConstruct(
      'LegacyCalculatorEngine',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(false);
  });
});

describe('Abstraction: facade', () => {
  // --- Positive: orchestrates several injected collaborators behind one entry point ---
  test('CalculatorEngine → TC (orchestrates parser/operations/history/logger behind evaluate())', async () => {
    const result = await analyseConstruct(
      'CalculatorEngine',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('abstraction');
  });

  // --- Negative: Facade/Service suffix, but no subsystem to simplify ---
  test('SessionFacade → not TC (Facade suffix, but a plain data holder)', async () => {
    const result = await analyseConstruct(
      'SessionFacade',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(false);
  });

  test('DisplayService → not TC (Service suffix, single-collaborator pass-through, no subsystem)', async () => {
    const result = await analyseConstruct(
      'DisplayService',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(false);
  });
});

describe('Abstraction: template method', () => {
  // --- Positive: abstract class defines the algorithm skeleton; subclasses fill in the steps ---
  test('Calculation → TC (abstract class defines the skeleton; abstract steps filled in by subclasses)', async () => {
    const result = await analyseConstruct(
      'Calculation',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('abstraction');
  });

  // --- Negative: plain concrete class, no abstract steps, nothing to template ---
  test('FlatFeeCalculation → not TC (concrete class, no abstract methods, no template)', async () => {
    const result = await analyseConstruct(
      'FlatFeeCalculation',
      'abstraction',
      MOCK_FILE,
    );

    expect(result.is_tc_candidate).toBe(false);
  });
});
