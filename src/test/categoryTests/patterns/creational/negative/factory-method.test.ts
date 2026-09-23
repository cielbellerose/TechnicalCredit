import { analyseSource } from '../../../../support/analyseLive';

/**
 * Creational: Factory Method — Negative Tests
 *
 * Signal: an abstract class declares an abstract factory method, concrete
 * subclasses extend it to decide which product to instantiate, and the
 * implementation refers to the abstract type.
 *
 * Each test sends its inline Java source to Claude for a live analysis and
 * asserts the parsed output.
 *
 * Requires ANTHROPIC_API_KEY
 */
jest.setTimeout(60_000);

describe('Factory Method: negative', () => {
  // --- Concrete class news a concrete product directly — no abstract creator, no subclassing ---
  const REPORT_PRINTER = `
class PdfDocument {
    public String render(String title) { return "%PDF " + title; }
}

class ReportPrinter {
    public String print(String title) {
        PdfDocument document = new PdfDocument();
        return "Printed: " + document.render(title);
    }
}
`;

  test('ReportPrinter → not TC (concrete class directly news a concrete product, no abstract creator)', async () => {
    const result = await analyseSource(
      REPORT_PRINTER,
      'ReportPrinter',
      'abstraction',
    );

    expect(result.is_tc_candidate).toBe(false);
  });
});
