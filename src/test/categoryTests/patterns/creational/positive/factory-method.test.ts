import { analyseSource } from '../../../../support/analyseLive';

/**
 * Creational: Factory Method — Positive Tests
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

describe('Factory Method: positive', () => {
  // --- Abstract creator declares createDocument(); concrete creators decide which Document to build ---
  const DOCUMENT_CREATOR = `
interface Document {
    String render(String title);
}

class PdfDocument implements Document {
    public String render(String title) { return "%PDF " + title; }
}

class HtmlDocument implements Document {
    public String render(String title) { return "<h1>" + title + "</h1>"; }
}

abstract class DocumentCreator {
    protected abstract Document createDocument();

    public String publish(String title) {
        Document document = createDocument();
        String rendered = document.render(title);
        return "Published: " + rendered;
    }
}

class PdfDocumentCreator extends DocumentCreator {
    protected Document createDocument() { return new PdfDocument(); }
}

class HtmlDocumentCreator extends DocumentCreator {
    protected Document createDocument() { return new HtmlDocument(); }
}
`;

  test('DocumentCreator → TC (abstract creator with abstract createDocument(), subclassed by concrete creators)', async () => {
    const result = await analyseSource(
      DOCUMENT_CREATOR,
      'DocumentCreator',
      'abstraction',
    );

    expect(result.is_tc_candidate).toBe(true);
    expect(result.category).toBe('abstraction');
  });
});
