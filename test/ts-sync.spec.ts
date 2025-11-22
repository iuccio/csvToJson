const csvToJson = require('../index');

interface Person { name: string; age: string }

describe('TypeScript - Sync API', () => {
  beforeEach(() => {
    // reset configuration
    csvToJson.formatValueByType(false);
    csvToJson.supportQuotedField(false);
    csvToJson.fieldDelimiter(';');
  });

  test('csvStringToJson returns typed array', () => {
    const csv = 'name;age\nJohn;30';
    const res = csvToJson.csvStringToJson(csv) as Person[];
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].name).toBe('John');
    expect(res[0].age).toBe('30');
  });

  test('csvStringToJsonStringified returns valid JSON string', () => {
    const csv = 'name;age\nJohn;30';
    const s = csvToJson.csvStringToJsonStringified(csv);
    const parsed = JSON.parse(s) as Person[];
    expect(parsed[0].name).toBe('John');
  });
});

export {};
