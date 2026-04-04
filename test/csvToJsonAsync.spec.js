'use strict';

const assert = require('assert');
const csvToJsonAsync = require('../src/csvToJsonAsync');
const index = require('../index');

describe('Async API testing', () => {
    describe('getJsonFromCsvAsync() with files', () => {
        it('should read and parse CSV file asynchronously', () => {
            return csvToJsonAsync.fieldDelimiter(';')
                .getJsonFromCsvAsync('test/resource/input_example.csv')
                .then(result => {
                    assert.ok(Array.isArray(result));
                    assert.ok(result.length > 0);
                    // First row should have expected fields 
                    assert.ok(result[0].hasOwnProperty('firstName'));
                    assert.ok(result[0].hasOwnProperty('lastName'));
                    assert.strictEqual(result[0].firstName, 'Constantin');
                });
        });

        it('should handle field delimiter in async mode', () => {
            return csvToJsonAsync.fieldDelimiter('~')
                .getJsonFromCsvAsync('test/resource/input_tilde_delimiter.csv')
                .then(result => {
                    assert.ok(Array.isArray(result));
                    assert.ok(result.length > 0);
                    // Verify fields are parsed correctly with custom delimiter
                    assert.strictEqual(result[0].firstName, 'Constantin');
                    assert.strictEqual(result[0].lastName, 'Langsdon');
                });
        });

        it('should reject on missing file', () => {
            return csvToJsonAsync.getJsonFromCsvAsync('nonexistent.csv')
                .then(() => {
                    throw new Error('Should have rejected');
                })
                .catch(err => {
                    // fs.promises.readFile errors are objects with code
                    // fallback fs.readFile errors are Error instances
                    assert.ok(err && (err.code === 'ENOENT' || err.message.includes('ENOENT')));
                });
        });
    });

    describe('getJsonFromCsvAsync() with raw CSV strings', () => {
        beforeEach(() => {
            // Reset to default delimiter for raw string tests
            index.fieldDelimiter(';');
        });

        it('should parse raw CSV string when options.raw=true', () => {
            const csvString = 'name;age;city\nAlice;30;New York\nBob;25;Boston';
            return csvToJsonAsync.getJsonFromCsvAsync(csvString, { raw: true })
                .then(result => {
                    assert.ok(Array.isArray(result));
                    assert.strictEqual(result.length, 2);
                    assert.deepStrictEqual(result[0], {
                        name: 'Alice',
                        age: '30',
                        city: 'New York'
                    });
                    assert.deepStrictEqual(result[1], {
                        name: 'Bob',
                        age: '25',
                        city: 'Boston'
                    });
                });
        });

        it('should format values by type in raw mode', () => {
            const csvString = 'name;age;active\nAlice;30;true\nBob;25;false';
            return index.formatValueByType(true)
                .getJsonFromCsvAsync(csvString, { raw: true })
                .then(result => {
                    assert.ok(Array.isArray(result));
                    assert.strictEqual(result.length, 2);
                    // Age should be number, active should be boolean
                    assert.strictEqual(typeof result[0].age, 'number');
                    assert.strictEqual(typeof result[0].active, 'boolean');
                    assert.strictEqual(result[0].age, 30);
                    assert.strictEqual(result[0].active, true);
                });
        });

        it('should handle empty input with raw=true', () => {
            return csvToJsonAsync.getJsonFromCsvAsync('', { raw: true })
                .then(result => {
                    assert.ok(Array.isArray(result));
                    assert.strictEqual(result.length, 0);
                });
        });

        it('should reject when input is null/undefined', () => {
            return Promise.all([
                index.getJsonFromCsvAsync(null, { raw: true })
                    .then(() => { throw new Error('Should reject null'); })
                    .catch(err => assert.ok(err instanceof Error)),
                index.getJsonFromCsvAsync(undefined, { raw: true })
                    .then(() => { throw new Error('Should reject undefined'); })
                    .catch(err => assert.ok(err instanceof Error))
            ]);
        });
    });

    describe('getJsonFromStreamAsync()', () => {
        const fs = require('fs');
        const { Readable } = require('stream');

        beforeEach(() => {
            // Reset configurations for stream tests
            csvToJsonAsync.fieldDelimiter(',');
            csvToJsonAsync.supportQuotedField(false);
            csvToJsonAsync.formatValueByType(true);
            csvToJsonAsync.trimHeaderFieldWhiteSpace(false);
            csvToJsonAsync.indexHeader(0);
        });

        it('should parse CSV from a readable stream', () => {
            const stream = fs.createReadStream('test/resource/input_example.csv');
            return csvToJsonAsync.fieldDelimiter(';')
                .getJsonFromStreamAsync(stream)
                .then(result => {
                    assert.ok(Array.isArray(result));
                    assert.ok(result.length > 0);
                    assert.ok(result[0].hasOwnProperty('firstName'));
                    assert.ok(result[0].hasOwnProperty('lastName'));
                    assert.strictEqual(result[0].firstName, 'Constantin');
                });
        });

        it('should handle quoted fields in streams', () => {
            const csvData = 'name,description\n"John","A person with a ""quote"" in description"\n"Jane","Simple description"';
            const stream = new Readable();
            stream.push(csvData);
            stream.push(null); // End the stream

            return csvToJsonAsync.supportQuotedField(true)
                .getJsonFromStreamAsync(stream)
                .then(result => {
                    assert.ok(Array.isArray(result));
                    assert.strictEqual(result.length, 2);
                    assert.strictEqual(result[0].name, 'John');
                    assert.strictEqual(result[0].description, 'A person with a "quote" in description');
                    assert.strictEqual(result[1].name, 'Jane');
                    assert.strictEqual(result[1].description, 'Simple description');
                });
        });

        it('should reject when stream is not provided', () => {
            return csvToJsonAsync.getJsonFromStreamAsync(null)
                .then(() => { throw new Error('Should reject'); })
                .catch(err => assert.ok(err instanceof Error));
        });

        it('should handle empty stream', () => {
            const stream = new Readable();
            stream.push('');
            stream.push(null);

            return csvToJsonAsync.getJsonFromStreamAsync(stream)
                .then(result => {
                    assert.ok(Array.isArray(result));
                    assert.strictEqual(result.length, 0);
                });
        });

        it('should parse CSV from a file path using streaming', () => {
            return csvToJsonAsync.fieldDelimiter(';')
                .getJsonFromFileStreamingAsync('test/resource/input_example.csv')
                .then(result => {
                    assert.ok(Array.isArray(result));
                    assert.ok(result.length > 0);
                    assert.ok(result[0].hasOwnProperty('firstName'));
                    assert.ok(result[0].hasOwnProperty('lastName'));
                    assert.strictEqual(result[0].firstName, 'Constantin');
                });
        });

        it('should reject when file path is invalid', () => {
            return csvToJsonAsync.getJsonFromFileStreamingAsync(null)
                .then(() => { throw new Error('Should reject'); })
                .catch(err => assert.ok(err instanceof Error));
        });
    });
});