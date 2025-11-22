const csvToJson = require('../index');

describe('TypeScript - Browser API', () => {
  const browser = (csvToJson as any).browser;

  beforeEach(() => {
    browser.formatValueByType(false);
    browser.supportQuotedField(false);
    browser.fieldDelimiter(';');
  });

  test('csvStringToJson from browser helper', () => {
    const csv = 'name;age\nJohn;30';
    const res = browser.csvStringToJson(csv);
    expect(res[0].name).toBe('John');
  });

  test('parseFile mocked FileReader', async () => {
    class MockFileReader {
      public result: any = null;
      onload: any = null;
      onerror: any = null;
      readAsText(file: any) {
        setTimeout(() => {
          this.result = file.text || file;
          if (this.onload) this.onload();
        }, 0);
      }
    }
    const orig = (global as any).FileReader;
    (global as any).FileReader = MockFileReader;

    const file = { text: 'name;age\nJohn;30' };
    const parsed = await browser.parseFile(file);
    expect(parsed[0].age).toBe('30');

    if (orig === undefined) delete (global as any).FileReader; else (global as any).FileReader = orig;
  });
});

export {};
