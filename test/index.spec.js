'use strict';

const { describe, it, beforeEach, afterEach } = require('./test');
let index = require('../index');

let fileInputName = 'test/resource/input.csv';

describe('API testing', function () {

    describe('getJsonFromCsv() testing', function () {
        let expectedJson;
        beforeEach(function () {
            expectedJson = [{
                firstName: 'Constantin',
                lastName: 'Langsdon',
                email: 'clangsdon0@hc360.com',
                gender: 'Male',
                age: "96",
                birth: '10.02.1965',
                zip: "123",
                registered: "true"
            },
            {
                firstName: 'Norah',
                lastName: 'Raison',
                email: 'nraison1@wired.com',
                gender: 'Female',
                age: "32.5",
                birth: '10.05.2000',
                zip: '',
                registered: "false"
            }];
        });

        it('should return json array', function (t) {
            let result = index.getJsonFromCsv(fileInputName);

            t.assert.strictEqual(result.length, expectedJson.length);
            t.assert.deepStrictEqual(result, expectedJson);
        });

        afterEach(function () {
            index.formatValueByType(false);
        });

        it('should return json array that contains the same property of the csv header', function (t) {
            let headers = ['firstName', 'lastName', 'email', 'gender', 'age', 'birth', 'zip', 'registered'];

            let result = index.getJsonFromCsv(fileInputName);

            const resultHeaders = Object.keys(result[0]);
            t.assert.ok(result !== null);
            t.assert.deepStrictEqual(resultHeaders, headers);
        });

        it('should not remove empty spaces from header field', function (t) {
            let headers = ['first Name', 'last Name', 'email', 'gender', 'age', 'birth'];

            //when
            let result = index.trimHeaderFieldWhiteSpace(false)
                .getJsonFromCsv('test/resource/input_header_with_empty_spaces.csv');

            const resultHeaders = Object.keys(result[0]);
            t.assert.ok(result !== null);
            t.assert.deepStrictEqual(resultHeaders, headers);
        });

        it('should remove empty spaces from header field', function (t) {
            let headers = ['firstName', 'lastName', 'email', 'gender', 'age', 'birth'];

            //when
            let result = index.trimHeaderFieldWhiteSpace(true)
                .getJsonFromCsv('test/resource/input_header_with_empty_spaces.csv');

            const resultHeaders = Object.keys(result[0]);
            t.assert.ok(result !== null);
            t.assert.deepStrictEqual(resultHeaders, headers);
        });

        it('should return json array from csv with tilde as field delimiter', function (t) {
            let result = index.fieldDelimiter('~').getJsonFromCsv('test/resource/input_tilde_delimiter.csv');

            t.assert.strictEqual(result.length, expectedJson.length);
            t.assert.deepStrictEqual(result, expectedJson);
        });

        it('should return json array with subArray', function (t) {
            let expectedResult = [{
                firstName: 'Constantin',
                lastName: 'Langsdon',
                email: 'clangsdon0@hc360.com',
                gender: 'Male',
                age: "96",
                birth: '10.02.1965',
                sons: ['anto', 'diego', 'hamsik']
            }, {
                firstName: 'Constantin',
                lastName: 'Langsdon',
                email: 'clangsdon0@hc360.com',
                gender: 'Male',
                age: "96",
                birth: '10.02.1965',
                sons: ['12', '10', '13']
            }];

            //when
            let result = index.parseSubArray("*", ',').fieldDelimiter(";").getJsonFromCsv('test/resource/input_example_sub_array.csv');

            t.assert.strictEqual(result.length, 2);
            t.assert.deepStrictEqual(result[0].sons, expectedResult[0].sons);
            t.assert.deepStrictEqual(result[1].sons, expectedResult[1].sons);
        });

        it('should return json array with subArray both formatted by type', function (t) {
            let expectedResult = [{
                firstName: 'Constantin',
                lastName: 'Langsdon',
                email: 'clangsdon0@hc360.com',
                gender: 'Male',
                age: "96",
                birth: '10.02.1965',
                sons: ['anto', 'diego', 'hamsik']
            }, {
                firstName: 'Constantin',
                lastName: 'Langsdon',
                email: 'clangsdon0@hc360.com',
                gender: 'Male',
                age: "96",
                birth: '10.02.1965',
                sons: [12, 10, 13]
            }];
            //when            
            let result = index.parseSubArray("*", ',').fieldDelimiter(";").formatValueByType().getJsonFromCsv('test/resource/input_example_sub_array.csv');
            //then
            t.assert.strictEqual(result.length, 2);
            t.assert.deepStrictEqual(result[0].sons, expectedResult[0].sons);
        });

        it('should return json array with value formatted by type', function (t) {
            expectedJson[0].age = 96;
            expectedJson[0].zip = 123;
            expectedJson[1].age = 32.5;
            expectedJson[0].registered = true;
            expectedJson[1].registered = false;

            let result = index.formatValueByType().fieldDelimiter(";").getJsonFromCsv(fileInputName);

            t.assert.strictEqual(result.length, expectedJson.length);
            t.assert.deepStrictEqual(result, expectedJson);
        });

        it('should return json array when file contains empty rows', function (t) {
            let result = index.fieldDelimiter(";").getJsonFromCsv('test/resource/input_with_empty_row_at_the_beginning.csv');

            t.assert.strictEqual(result.length, expectedJson.length);
            t.assert.deepStrictEqual(result, expectedJson);
        });

        it('should return json array header is not the first line', function (t) {
            let result = index.fieldDelimiter(";").indexHeader(5).getJsonFromCsv('test/resource/input_with_header_not_first_line.csv');

            t.assert.strictEqual(result.length, expectedJson.length);
            t.assert.deepStrictEqual(result, expectedJson);
        });
    });

    describe('Input config testing', function () {
        beforeEach(function () {
            index.supportQuotedField(false);
            index.fieldDelimiter(";");
        });

        it('should throw error when isSupportQuotedField active and fieldDelimiter is equal to "', function (t) {
            t.assert.throws(() => {
                index.supportQuotedField(true)
                    .fieldDelimiter('"')
                    .getJsonFromCsv(fileInputName);
            }, /When SupportQuotedFields is enabled you cannot defined the field delimiter as quote -> \["]/);
        });

        it('should throw error when parseSubArrayDelimiter active and fieldDelimiter is equal to "', function (t) {
            t.assert.throws(() => {
                index.supportQuotedField(true)
                    .parseSubArray('"', ',')
                    .getJsonFromCsv(fileInputName);
            }, /When SupportQuotedFields is enabled you cannot defined the field parseSubArrayDelimiter as quote -> \["]/);
        });

        it('should throw error when parseSubArraySeparator active and parseSubArraySeparator is equal to "', function (t) {
            t.assert.throws(() => {
                index.supportQuotedField(true)
                    .parseSubArray('*', '"')
                    .getJsonFromCsv(fileInputName);
            }, /When SupportQuotedFields is enabled you cannot defined the field parseSubArraySeparator as quote -> \["]/);
        });

    });
});
