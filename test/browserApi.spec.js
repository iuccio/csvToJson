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

    await expect(browser.parseFile({ text: 'a;b\n1;2' })).rejects.toThrow(/FileReader.*not available/);

    if (original !== undefined) global.FileReader = original;
  });

  describe('Streaming Methods', () => {
    test('getJsonFromStreamAsync processes ReadableStream', async () => {
      const csv = 'name;age\nJohn;30\nJane;25';
      let chunkIndex = 0;
      const chunks = [csv.slice(0, 10), csv.slice(10)];

      class MockReader {
        read() {
          if (chunkIndex < chunks.length) {
            const chunk = chunks[chunkIndex++];
            return Promise.resolve({ done: false, value: chunk });
          }
          return Promise.resolve({ done: true });
        }
      }

      class MockStream {
        getReader() {
          return new MockReader();
        }
      }

      const original = global.ReadableStream;
      global.ReadableStream = function() { return {}; };

      const result = await browser.getJsonFromStreamAsync(new MockStream());
      expect(result).toEqual([
        { name: 'John', age: '30' },
        { name: 'Jane', age: '25' }
      ]);

      if (original === undefined) {
        delete global.ReadableStream;
      } else {
        global.ReadableStream = original;
      }
    });

    test('getJsonFromStreamAsync rejects when ReadableStream not available', async () => {
      const original = global.ReadableStream;
      if (original !== undefined) delete global.ReadableStream;

      class MockStream {}
      await expect(browser.getJsonFromStreamAsync(new MockStream())).rejects.toThrow(/ReadableStream.*not available/);

      if (original !== undefined) global.ReadableStream = original;
    });

    test('getJsonFromStreamAsync rejects with invalid stream', async () => {
      global.ReadableStream = function() { return {}; };

      await expect(browser.getJsonFromStreamAsync(null)).rejects.toThrow(/ReadableStream/);
      await expect(browser.getJsonFromStreamAsync({})).rejects.toThrow(/ReadableStream/);

      delete global.ReadableStream;
    });

    test('getJsonFromFileStreamingAsync uses file.stream() when available', async () => {
      const csv = 'name;age\nJohn;30';
      let chunkIndex = 0;
      const chunks = [csv];

      class MockReader {
        read() {
          if (chunkIndex < chunks.length) {
            const chunk = chunks[chunkIndex++];
            return Promise.resolve({ done: false, value: chunk });
          }
          return Promise.resolve({ done: true });
        }
      }

      class MockStream {
        getReader() {
          return new MockReader();
        }
      }

      const mockFile = Object.create(File.prototype);
      mockFile.stream = jest.fn(() => new MockStream());

      const original = global.ReadableStream;
      global.ReadableStream = function() { return {}; };

      const result = await browser.getJsonFromFileStreamingAsync(mockFile);
      expect(result).toEqual([{ name: 'John', age: '30' }]);
      expect(mockFile.stream).toHaveBeenCalled();

      if (original === undefined) {
        delete global.ReadableStream;
      } else {
        global.ReadableStream = original;
      }
    });

    test('getJsonFromFileStreamingAsync falls back to parseFile when stream unavailable', async () => {
      const csv = 'name;age\nJohn;30';

      class MockFileReader {
        constructor() {
          this.onload = null;
          this.onerror = null;
          this.result = null;
        }
        readAsText(file, encoding) {
          setTimeout(() => {
            this.result = file.text || file;
            if (this.onload) this.onload();
          }, 0);
        }
      }

      const mockFile = {
        text: csv,
        // Mock File interface without stream method
        size: csv.length,
        type: 'text/csv',
        name: 'test.csv'
      };
      // Make it pass instanceof File check but don't inherit stream method
      mockFile.__proto__ = File.prototype;
      // Explicitly remove stream method for this test
      mockFile.stream = undefined;

      const originalFileReader = global.FileReader;
      const originalReadableStream = global.ReadableStream;

      global.FileReader = MockFileReader;
      if (originalReadableStream !== undefined) delete global.ReadableStream;

      const result = await browser.getJsonFromFileStreamingAsync(mockFile);
      expect(result).toEqual([{ name: 'John', age: '30' }]);

      if (originalFileReader === undefined) {
        delete global.FileReader;
      } else {
        global.FileReader = originalFileReader;
      }
      if (originalReadableStream !== undefined) global.ReadableStream = originalReadableStream;
    });

    test('getJsonFromFileStreamingAsync rejects with invalid file', async () => {
      await expect(browser.getJsonFromFileStreamingAsync(null)).rejects.toThrow(/File object/);
      await expect(browser.getJsonFromFileStreamingAsync('not a file')).rejects.toThrow(/File object/);
    });
  });
});
