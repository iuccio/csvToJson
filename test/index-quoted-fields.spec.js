'use strict';

const index = require('../index');


describe('API testing quoted fields', function () {
    afterEach(function () {
        index.formatValueByType(false);
        index.supportQuotedField(false)
    });

    it('should handle quoted fields', function () {
        let result = index.fieldDelimiter(',')
                            .supportQuotedField(true)
                            .getJsonFromCsv('test/resource/input_quoted_fields.csv');

        let first = result[0];
        expect(first.lastName).toEqual('Langsdon,Langsdon');

        let second = result[1];
        expect(second.gender).toEqual('Female" ');

        let third = result[2];
        expect(third.lastName).toEqual(',Taborre');

    });

    it('should handle quoted fields', function () {
        let result = index.fieldDelimiter(',')
                            .getJsonFromCsv('test/resource/input_quoted_fields.csv');

        let first = result[0];
        expect(first.lastName).toEqual('"Langsdon');

        let second = result[1];
        expect(second.gender).toEqual('"Female"" "');

        let third = result[2];
        expect(third.lastName).toEqual('"');

    });

    it('should handle quoted fields with subarray', function () {
        let result = index.fieldDelimiter(';')
                            .parseSubArray('*',',')
                            .supportQuotedField(true)
                            .getJsonFromCsv('test/resource/input_quoted_fields_with_subarray.csv');

        let first = result[0];
        expect(first.lastName).toEqual('Langsdon');
        expect(first.sons.length).toEqual(3);
        expect(['anto','diego','hamsik']).toEqual(expect.arrayContaining(first.sons));

        let second = result[1];
        expect(second.gender).toEqual('Male');
        expect(second.sons.length).toEqual(3);
        expect(['12','10','13']).toEqual(expect.arrayContaining(second.sons));

    });

    it('should not handle quoted fields with subarray', function () {
    	let result = index.fieldDelimiter(';')
    						.parseSubArray('*',',')
                          	.getJsonFromCsv('test/resource/input_quoted_fields_with_subarray.csv');

        let first = result[0];
        expect(first.lastName).toEqual('"Langsdon"');
        expect(first.sons.length).toEqual(3);
        expect(['anto','diego','hamsik']).toEqual(expect.arrayContaining(first.sons));

        let second = result[1];
        expect(second.gender).toEqual('"Male"');
        expect(second.sons.length).toEqual(3);
        expect(['12','10','13']).toEqual(expect.arrayContaining(second.sons));

    });

});
