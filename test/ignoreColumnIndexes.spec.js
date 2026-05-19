'use strict';
let index = require('../index');

describe('Ignore Column Indexes testing', function () {
    it('should ignore column at index 0', function () {
        //when
        let result = index
            .ignoreColumnIndexes([0])
            .getJsonFromCsv('test/resource/input_header_row0.csv');

        //then
        expect(result).toEqual([
            {
                age: '30',
                city: 'NewYork'
            },
            {
                age: '25',
                city: 'Boston'
            }
        ]);
    });

    it('should ignore columns at indexes 0 and 2', function () {
        //when
        let result = index
            .ignoreColumnIndexes([0, 2])
            .getJsonFromCsv('test/resource/input_header_row0.csv');

        //then
        expect(result).toEqual([
            {
                age: '30'
            },
            {
                age: '25'
            }
        ]);
    });

    it('should throw TypeError when indexes is not an array', function () {
        expect(() => index.ignoreColumnIndexes('not an array')).toThrow(
            new TypeError('indexes must be an array of numbers')
        );
    });

    it('should throw TypeError when indexes is null', function () {
        expect(() => index.ignoreColumnIndexes(null)).toThrow(
            new TypeError('indexes must be an array of numbers')
        );
    });

    it('should throw TypeError when indexes is an object', function () {
        expect(() => index.ignoreColumnIndexes({ 0: 1, 1: 2 })).toThrow(
            new TypeError('indexes must be an array of numbers')
        );
    });

    it('should throw TypeError when array contains non-numeric values', function () {
        expect(() => index.ignoreColumnIndexes([0, 'string', 2])).toThrow(
            new TypeError('All elements in indexes must be valid non-negative numbers (>= 0)')
        );
    });

    it('should throw TypeError when array contains NaN', function () {
        expect(() => index.ignoreColumnIndexes([0, NaN, 2])).toThrow(
            new TypeError('All elements in indexes must be valid non-negative numbers (>= 0)')
        );
    });

    it('should throw TypeError when array contains negative numbers', function () {
        expect(() => index.ignoreColumnIndexes([0, -1, 2])).toThrow(
            new TypeError('All elements in indexes must be valid non-negative numbers (>= 0)')
        );
    });

    it('should throw TypeError when array contains floating point numbers', function () {
        expect(() => index.ignoreColumnIndexes([0, 1.5, 2])).toThrow(
            new TypeError('All elements in indexes must be valid non-negative numbers (>= 0)')
        );
    });

    it('should accept empty array', function () {
        let result = index
            .ignoreColumnIndexes([])
            .getJsonFromCsv('test/resource/input_header_row0.csv');

        expect(result.length).toBeGreaterThan(0);
    });

});
