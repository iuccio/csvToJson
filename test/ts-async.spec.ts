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

  test('mapRows with async API transforms rows', async () => {
    const csv = 'name;age\nJohn;30\nJane;25';
    const res = await csvToJson
      .mapRows((row: any) => {
        row.name = row.name.toUpperCase();
        return row;
      })
      .csvStringToJsonAsync(csv) as any[];
    
    expect(res[0].name).toBe('JOHN');
    expect(res[1].name).toBe('JANE');
  });

  test('mapRows with async API filters rows', async () => {
    const csv = 'name;age\nJohn;30\nBob;17\nJane;25';
    const res = await csvToJson
      .mapRows((row: any) => {
        // Keep only adults
        if (parseInt(row.age) >= 18) {
          return row;
        }
        return null;
      })
      .csvStringToJsonAsync(csv) as any[];
    
    expect(res.length).toBe(2);
    expect(res[0].name).toBe('John');
    expect(res[1].name).toBe('Jane');
  });
});

export {};
