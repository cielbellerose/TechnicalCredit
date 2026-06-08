import { loadMock, extractType } from './support/mockSource';

/**
 * H2 — class implementing an interface from a different package
 * (abstraction / modularity).
 *
 * A class that implements an interface declared in another package is a strong
 * signal of intentional decoupling: the impl is bound to a port it does not own.
 * The opposite — implementing a same-package interface — keeps the contract and
 * its implementation together, so the cross-package signal H2 keys on is absent.
 *
 * Like the H5 fixtures, each construct carries its own evidence: positives
 * fully-qualify the implemented type to a foreign package, negatives use a bare
 * same-package name. So the extracted slice (what a user highlights) is enough
 * to judge on its own.
 *
 * To scale: add a row below AND the matching construct in MockTest.java.
 *
 * Today this guards the fixtures (the construct exists, both polarities are
 * present). Once detection is wired, swap the TODO for a call that sends the
 * extracted code to Claude and assert `toMatchObject(c.expected)` — `expected`
 * already pins the deterministic fields (is_tc_candidate, H2category);
 * confidence is intentionally left out as it is not deterministic.
 */

// reads MockTest.java for testing
const MOCK = loadMock('MockTest.java');

interface H2Case {
  /** Type name exactly as declared in MockTest.java. */
  name: string;
  /** One line on why this construct is (or isn't) an H2 candidate. */
  rationale: string;
  /**
   * Expected detector verdict. `true` = H2 positive (TC candidate).
   * `H2category` is the expected TC category when positive (omitted for
   * negatives). Confidence is deliberately not asserted.
   */
  expected: {
    is_tc_candidate: boolean;
    H2category?: 'abstraction' | 'modularity';
  };
}

const cases: H2Case[] = [
  // --- Positive: class implements an interface from a DIFFERENT package ---
  {
    name: 'JpaUserRepository',
    rationale:
      'Implements com.example.domain.IUserRepository — persistence impl bound to a domain-package port.',
    expected: { is_tc_candidate: true, H2category: 'abstraction' },
  },
  {
    name: 'StripeGateway',
    rationale:
      'Implements com.example.payment.api.PaymentGateway — adapter of a port from another package.',
    expected: { is_tc_candidate: true, H2category: 'abstraction' },
  },
  {
    name: 'RedisCacheStore',
    rationale:
      'Implements com.example.cache.spi.CacheStore — infra impl of a cross-package SPI interface.',
    expected: { is_tc_candidate: true, H2category: 'abstraction' },
  },

  // --- Negative: class implements an interface from the SAME package ---
  {
    name: 'InMemoryUserStore',
    rationale:
      'Implements UserStore declared in the same package — no package boundary crossed.',
    expected: { is_tc_candidate: false },
  },
  {
    name: 'StrictLocalValidator',
    rationale:
      'Implements same-package LocalValidator — contract and impl live together.',
    expected: { is_tc_candidate: false },
  },
];

describe('H2 — class implementing interface from a different package', () => {
  for (const c of cases) {
    const polarity = c.expected.is_tc_candidate ? 'positive' : 'negative';
    test(`${c.name} (${polarity}) — ${c.rationale}`, () => {
      const code = extractType(MOCK, c.name);

      // TODO: update to test JSON output
      expect(code).not.toBe(''); // currently only checks that construct must exist in MockTest.java
    });
  }
});
