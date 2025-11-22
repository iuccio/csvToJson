"use strict";

const convert = require('convert-csv-to-json');
const browser = convert.browser;

describe('Browser API', () => {
  beforeEach(() => {
    // Reset common configuration to deterministic defaults
    browser.formatValueByType(false);
    browser.supportQuotedField(false);
    browser.fieldDelimiter(';');
    browser.trimHeaderFieldWhiteSpace(false);
  });

  test('csvStringToJson parses CSV string', () => {
    const csv = 'name;age\nJohn;30';
    const result = browser.csvStringToJson(csv);
    expect(result).toEqual([{ name: 'John', age: '30' }]);
  });

  test('csvStringToJsonStringified returns valid JSON string', () => {
    const csv = 'name;age\nJohn;30';
    const jsonString = browser.csvStringToJsonStringified(csv);
    expect(typeof jsonString).toBe('string');
    const parsed = JSON.parse(jsonString);
    expect(parsed).toEqual([{ name: 'John', age: '30' }]);
  });

  test('csvStringToJsonAsync resolves with array', async () => {
    const csv = 'name;age\nJohn;30';
    const arr = await browser.csvStringToJsonAsync(csv);
    expect(arr).toEqual([{ name: 'John', age: '30' }]);
  });

  test('parseFile uses FileReader and resolves', async () => {
    const csv = 'name;age\nJohn;30';

    class MockFileReader {
      constructor() {
        this.onload = null;
        this.onerror = null;
        this.result = null;
      }
      readAsText(file, encoding) {
        // emulate async file read
        setTimeout(() => {
          this.result = file.text || file;
          if (this.onload) this.onload();
        }, 0);
      }
    }

    const original = global.FileReader;
    global.FileReader = MockFileReader;

    const file = { text: csv };
    const res = await browser.parseFile(file);
    expect(res).toEqual([{ name: 'John', age: '30' }]);

    // restore
    if (original === undefined) {
      delete global.FileReader;
    } else {
      global.FileReader = original;
    }
  });

  test('parseFile rejects when FileReader missing', async () => {
    const original = global.FileReader;
    if (original !== undefined) delete global.FileReader;

    await expect(browser.parseFile({ text: 'a;b\n1;2' })).rejects.toThrow('FileReader is not available');

    if (original !== undefined) global.FileReader = original;
  });
});
