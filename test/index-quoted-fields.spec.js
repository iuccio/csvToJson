'use strict';

let expect = require('chai').expect;
let assert = require('chai').assert;
const index = require('../index');


describe('API testing quoted fields', function () {
    afterEach(function () {
        index.formatValueByType(false);
    });

    it('should handle quoted fields', function () {
        let result = index.fieldDelimiter(',').getJsonFromCsv('test/resource/input_quoted_fields.csv');

        let first = result[0];
        expect(first.lastName).to.equal('Langsdon');
            
        let second = result[1];
        expect(second.gender).to.equal('Female" ');

        let third = result[2];
        expect(third.lastName).to.equal(',Taborre');

    });

    it('should handle quoted fields with subarray', function () {
        let result = index.fieldDelimiter(';').parseSubArray('*',',').getJsonFromCsv('test/resource/input_quoted_fields_with_subarray.csv');

        let first = result[0];
        expect(first.lastName).to.equal('Langsdon');
        expect(first.sons.length).to.equal(3);
        expect(first.sons).to.have.members(['anto','diego','hamsik']);

        let second = result[1];
        expect(second.gender).to.equal('Male');
        expect(second.sons.length).to.equal(3);
        expect(second.sons).to.have.members(['12','10','13']);

    });

});
