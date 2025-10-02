'use strict';

const { describe, it, afterEach } = require('./test');
const index = require('../index');

describe('API testing quoted fields', function () {
    afterEach(function () {
        index.formatValueByType(false);
        index.supportQuotedField(false);
    });

    it('should handle quoted fields', function (t) {
        let result = index.fieldDelimiter(',')
            .supportQuotedField(true)
            .getJsonFromCsv('test/resource/input_quoted_fields.csv');

        let first = result[0];
        t.assert.strictEqual(first.lastName, 'Langsdon,Langsdon');

        let second = result[1];
        t.assert.strictEqual(second.gender, 'Female" ');

        let third = result[2];
        t.assert.strictEqual(third.lastName, ',Taborre');
    });

    it('should handle quoted fields', function (t) {
        let result = index.fieldDelimiter(',')
            .getJsonFromCsv('test/resource/input_quoted_fields.csv');

        let first = result[0];
        t.assert.strictEqual(first.lastName, '"Langsdon');

        let second = result[1];
        t.assert.strictEqual(second.gender, '"Female"" "');

        let third = result[2];
        t.assert.strictEqual(third.lastName, '"');
    });

    it('should handle quoted fields with subarray', function (t) {
        let result = index.fieldDelimiter(';')
            .parseSubArray('*', ',')
            .supportQuotedField(true)
            .getJsonFromCsv('test/resource/input_quoted_fields_with_subarray.csv');

        let first = result[0];
        t.assert.strictEqual(first.lastName, 'Langsdon');
        t.assert.strictEqual(first.sons.length, 3);
        t.assert.deepStrictEqual(
            first.sons.sort(),
            ['anto', 'diego', 'hamsik'].sort()
        );

        let second = result[1];
        t.assert.strictEqual(second.gender, 'Male');
        t.assert.strictEqual(second.sons.length, 3);
        t.assert.deepStrictEqual(
            second.sons.sort(),
            ['12', '10', '13'].sort()
        );
    });

    it('should not handle quoted fields with subarray', function (t) {
        let result = index.fieldDelimiter(';')
            .parseSubArray('*', ',')
            .getJsonFromCsv('test/resource/input_quoted_fields_with_subarray.csv');

        let first = result[0];
        t.assert.strictEqual(first.lastName, '"Langsdon"');
        t.assert.strictEqual(first.sons.length, 3);
        t.assert.deepStrictEqual(
            first.sons.sort(),
            ['anto', 'diego', 'hamsik'].sort()
        );

        let second = result[1];
        t.assert.strictEqual(second.gender, '"Male"');
        t.assert.strictEqual(second.sons.length, 3);
        t.assert.deepStrictEqual(
            second.sons.sort(),
            ['12', '10', '13'].sort()
        );
    });

});
