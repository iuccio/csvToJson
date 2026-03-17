'use strict';

const index = require('../index');

describe('Comma Delimiter Tests (RFC 4180 Default)', function () {
  afterEach(function () {
    index.formatValueByType(false);
    index.fieldDelimiter(','); // Reset to default
  });

  describe('Basic Comma Delimiter Parsing', function () {
    it('should parse CSV with comma as delimiter without explicit configuration', function () {
      // Comma is the RFC 4180 default, so no fieldDelimiter() call needed
      let result = index.getJsonFromCsv('test/resource/input_comma_delimiter.csv');

      expect(result.length).toBe(2);
      expect(result[0].firstName).toBe('Constantin');
      expect(result[0].lastName).toBe('Langsdon');
      expect(result[0].email).toBe('clangsdon0@hc360.com');
      expect(result[0].gender).toBe('Male');
      expect(result[0].age).toBe('96');
      expect(result[0].birth).toBe('10.02.1965');
      expect(result[0].zip).toBe('123');
      expect(result[0].registered).toBe('true');
      
      expect(result[1].firstName).toBe('Norah');
      expect(result[1].lastName).toBe('Raison');
      expect(result[1].email).toBe('nraison1@wired.com');
      expect(result[1].gender).toBe('Female');
      expect(result[1].age).toBe('32.5');
      expect(result[1].birth).toBe('10.05.2000');
      expect(result[1].zip).toBe('');
      expect(result[1].registered).toBe('false');
    });

    it('should parse CSV with explicit comma delimiter configuration', function () {
      let result = index.fieldDelimiter(',')
        .getJsonFromCsv('test/resource/input_comma_delimiter.csv');

      expect(result.length).toBe(2);
      expect(result[0].firstName).toBe('Constantin');
      expect(result[1].firstName).toBe('Norah');
    });

    it('should return headers with comma delimiter', function () {
      let result = index.getJsonFromCsv('test/resource/input_comma_delimiter.csv');
      let headers = Object.keys(result[0]);

      expect(headers).toEqual([
        'firstName',
        'lastName',
        'email',
        'gender',
        'age',
        'birth',
        'zip',
        'registered'
      ]);
    });

    it('should handle empty fields with comma delimiter', function () {
      let result = index.getJsonFromCsv('test/resource/input_comma_delimiter.csv');

      expect(result[1].zip).toBe('');
    });
  });

  describe('Comma Delimiter with Type Formatting', function () {
    it('should parse and format values with comma delimiter', function () {
      let result = index.formatValueByType(true)
        .getJsonFromCsv('test/resource/input_comma_delimiter.csv');

      expect(result[0].age).toBe(96); // Formatted as number
      expect(result[0].zip).toBe(123); // Formatted as number
      expect(result[0].registered).toBe(true); // Formatted as boolean
      expect(result[1].age).toBe(32.5); // Float
      expect(result[1].registered).toBe(false); // Boolean false
    });

    it('should preserve leading zeros when formatting with comma delimiter', function () {
      let result = index.formatValueByType(true)
        .getJsonFromCsv('test/resource/input_comma_delimiter.csv');

      expect(result[0].birth).toBe('10.02.1965'); // Preserved as string due to leading zero
    });
  });

  describe('Comma Delimiter String Parsing', function () {
    it('should parse comma-delimited CSV string without explicit configuration', function () {
      let csv = 'name,age,city\nJohn,30,New York\nJane,25,Los Angeles\n';
      let result = index.csvStringToJson(csv);

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('John');
      expect(result[0].age).toBe('30');
      expect(result[0].city).toBe('New York');
      expect(result[1].name).toBe('Jane');
      expect(result[1].age).toBe('25');
      expect(result[1].city).toBe('Los Angeles');
    });

    it('should parse comma-delimited CSV string with explicit configuration', function () {
      let csv = 'id,product,price\n1,Laptop,999\n2,Mouse,25\n';
      let result = index.fieldDelimiter(',').csvStringToJson(csv);

      expect(result.length).toBe(2);
      expect(result[0].product).toBe('Laptop');
      expect(result[0].price).toBe('999');
    });

    it('should return stringified JSON from comma-delimited CSV string', function () {
      let csv = 'name,email\nJohn,john@example.com\n';
      let jsonString = index.csvStringToJsonStringified(csv);
      
      expect(typeof jsonString).toBe('string');
      let parsed = JSON.parse(jsonString);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].name).toBe('John');
      expect(parsed[0].email).toBe('john@example.com');
    });
  });

  describe('Comma Delimiter Edge Cases', function () {
    it('should handle single column with comma delimiter', function () {
      let csv = 'name\nJohn\nJane\n';
      let result = index.csvStringToJson(csv);

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('John');
      expect(result[1].name).toBe('Jane');
    });

    it('should handle trailing comma in comma-delimited CSV', function () {
      let csv = 'name,age,\nJohn,30,\nJane,25,\n';
      let result = index.csvStringToJson(csv);

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('John');
      expect(result[0].age).toBe('30');
      expect(result[0]['']).toBe(''); // Empty header for trailing comma
    });

    it('should handle multiple consecutive commas', function () {
      let csv = 'one,two,three\na,,c\n';
      let result = index.csvStringToJson(csv);

      expect(result[0].one).toBe('a');
      expect(result[0].two).toBe('');
      expect(result[0].three).toBe('c');
    });
  });
});
