const csvToJson = require('../index');

interface Person { name: string; age: number }

describe('TypeScript - Async API', () => {
  beforeEach(() => {
    csvToJson.formatValueByType(false);
    csvToJson.fieldDelimiter(';');
  });

  test('getJsonFromCsvAsync with raw csv string', async () => {
    const csv = 'name;age\nJohn;30';
    const res = await csvToJson.getJsonFromCsvAsync(csv, { raw: true }) as any[];
    expect(res[0].name).toBe('John');
  });

  test('csvStringToJsonAsync resolves correctly', async () => {
    const csv = 'name;age\nJohn;30';
    const res = await csvToJson.csvStringToJsonAsync(csv) as any[];
    expect(res[0].age).toBe('30');
  });
});

export {};
