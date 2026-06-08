import { analyseConstruct } from '../support/analyseLive';

/**
 * H2 — class implementing an interface from a different package
 * (abstraction / modularity).
 *
 * A class that implements an interface declared in another package is a strong
 * signal of intentional decoupling: the impl is bound to a port it does not own.
 * The opposite — implementing a same-package interface — keeps the contract and
 * its implementation together, so the cross-package signal H2 keys on is absent.
 *
 * Each test sends one MockTest.java construct to Claude for a live analysis
 * and asserts the parsed output.
 *
 * Requires ANTHROPIC_API_KEY
 */
jest.setTimeout(60_000);

/** The valid TC categories H2 can land in. */
const H2_CATEGORIES = ['abstraction', 'modularity'];

describe('H2 — class implementing interface from a different package', () => {
  // --- Positive: class implements an interface from a DIFFERENT package ---

  test('JpaUserRepository → TC (implements com.example.domain.IUserRepository — impl bound to a domain-package port)', async () => {
    const result = await analyseConstruct('JpaUserRepository', 'abstraction');

    expect(result.is_tc_candidate).toBe(true);
    expect(H2_CATEGORIES).toContain(result.category);
  });

  test('StripeGateway → TC (implements com.example.payment.api.PaymentGateway — adapter of a port from another package)', async () => {
    const result = await analyseConstruct('StripeGateway', 'abstraction');

    expect(result.is_tc_candidate).toBe(true);
    expect(H2_CATEGORIES).toContain(result.category);
  });

  test('RedisCacheStore → TC (implements com.example.cache.spi.CacheStore — infra impl of a cross-package SPI interface)', async () => {
    const result = await analyseConstruct('RedisCacheStore', 'abstraction');

    expect(result.is_tc_candidate).toBe(true);
    expect(H2_CATEGORIES).toContain(result.category);
  });

  // --- Negative: class implements an interface from the SAME package ---

  test('InMemoryUserStore → not TC (implements same-package UserStore — no package boundary crossed)', async () => {
    const result = await analyseConstruct('InMemoryUserStore', 'abstraction');

    expect(result.is_tc_candidate).toBe(false);
  });

  test('StrictLocalValidator → not TC (implements same-package LocalValidator — contract and impl live together)', async () => {
    const result = await analyseConstruct(
      'StrictLocalValidator',
      'abstraction',
    );

    expect(result.is_tc_candidate).toBe(false);
  });
});
