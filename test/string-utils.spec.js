'use strict';

const { describe, it } = require('./test');
const CsvToJson = require('../src/csv-to-json.js');

describe('StringUtils class testing', function () {

    describe('trimPropertyName()', function () {

        it('Should trim input value with empty spaces', function (t) {
            //given
            let value = ' val ue \n bla ';

            //when
            let result = Object.keys(new CsvToJson({ trimHeaderFieldWhiteSpace: true })
                .csvStringToJson(value)[0])[0];

            //then
            t.assert.strictEqual(result, 'value');
        });

        it('Should trim input value without empty spaces', function (t) {
            //given
            let value = ' val ue \n bla ';

            //when
            let result = Object.keys(new CsvToJson({ trimHeaderFieldWhiteSpace: false })
                .csvStringToJson(value)[0])[0];

            //then
            t.assert.strictEqual(result, 'val ue');
        });
    });

    describe('getValueFormatByType()', function () {
        it('should return type of Number for integers', function (t) {
            //given
            let value = '23';

            //when
            let result = new CsvToJson({ printValueFormatByType: true })
                .csvStringToJson(`key\n${value}`)[0].key;

            //then
            t.assert.strictEqual(typeof result, 'number');
            t.assert.strictEqual(result, 23);
        });

        it('should return type of Number for non-integers', function (t) {
            //given
            let value = '0.23';

            //when
            let result = new CsvToJson({ printValueFormatByType: true })
                .csvStringToJson(`key\n${value}`)[0].key;

            //then
            t.assert.strictEqual(typeof result, 'number');
            t.assert.strictEqual(result, 0.23);
        });

        it('should return type of String when value contains only words', function (t) {
            //given
            let value = 'value';

            //when
            let result = new CsvToJson({ printValueFormatByType: true })
                .csvStringToJson(`key\n${value}`)[0].key;

            //then
            t.assert.strictEqual(typeof result, 'string');
            t.assert.strictEqual(result, 'value');
        });

        it('should return type of String when value contains words and digits', function (t) {
            //given
            let value = '11value';

            //when
            let result = new CsvToJson({ printValueFormatByType: true })
                .csvStringToJson(`key\n${value}`)[0].key;

            //then
            t.assert.strictEqual(typeof result, 'string');
            t.assert.strictEqual(result, '11value');
        });

        it('should return empty value when input value is not defined', function (t) {
            //given
            let value;

            //when
            let result = new CsvToJson({ delimiter: ',', printValueFormatByType: true })
                .csvStringToJson(`key1,key2\n,value2`)[0].key1;

            //then
            t.assert.strictEqual(typeof result, 'string');
            t.assert.strictEqual(result, '');
        });

        it('should return empty value when input value is empty string', function (t) {
            //given
            let value = '';

            //when
            let result = new CsvToJson({ delimiter: ',', printValueFormatByType: true })
                .csvStringToJson(`key1, key2\n${value},value`)[0].key1;

            //then
            t.assert.strictEqual(typeof result, 'string');
            t.assert.strictEqual(result, '');
        });

        it('should return Boolean value when input value is "true"', function (t) {
            //given
            let value = "true";

            //when
            let result = new CsvToJson({ printValueFormatByType: true })
                .csvStringToJson(`key\n${value}`)[0].key;

            //then
            t.assert.strictEqual(typeof result, 'boolean');
            t.assert.strictEqual(result, true);
        });

        it('should return Boolean value when input value is "false"', function (t) {
            //given
            let value = "false";

            //when
            let result = new CsvToJson({ printValueFormatByType: true })
                .csvStringToJson(`key\n${value}`)[0].key;

            //then
            t.assert.strictEqual(typeof result, 'boolean');
            t.assert.strictEqual(result, false);
        });

    });

});
