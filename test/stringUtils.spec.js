'use strict';

let stringUtils = require('../src/util/stringUtils');

describe('StringUtils class testing', function () {

    describe('trimPropertyName()', function () {

        it('Should trim input value with empty spaces', function () {
            //given
            let value = ' value ';

            //when
            let result = stringUtils.trimPropertyName(true,value);

            //then
            expect(result).toEqual('value');
        });

        it('Should trim input value without empty spaces', function () {
            //given
            let value = ' val ue ';

            //when
            let result = stringUtils.trimPropertyName(false,value);

            //then
            expect(result).toEqual('val ue');
        });
    });

    describe('getValueFormatByType()', function () {
        it('should return type of Number for integers', function () {
            //given
            let value = '23';

            //when
            let result = stringUtils.getValueFormatByType(value);

            //then
            expect(typeof result).toEqual('number');
            expect(result).toEqual(23);
        });

        it('should return type of Number for non-integers', function () {
            //given
            let value = '0.23';

            //when
            let result = stringUtils.getValueFormatByType(value);

            //then
            expect(typeof result).toEqual('number');
            expect(result).toEqual(0.23);
        });

        it('should return type of String when value contains only words', function () {
            //given
            let value = 'value';

            //when
            let result = stringUtils.getValueFormatByType(value);

            //then
            expect(typeof result).toEqual('string');
            expect(result).toEqual('value');
        });

        it('should return type of String when value contains words and digits', function () {
            //given
            let value = '11value';

            //when
            let result = stringUtils.getValueFormatByType(value);

            //then
            expect(typeof result).toEqual('string');
            expect(result).toEqual('11value');
        });

        it('should return empty value when input value is not defined', function () {
            //given
            let value;

            //when
            let result = stringUtils.getValueFormatByType(value);

            //then
            expect(typeof result).toEqual('string');
            expect(result).toEqual('');
        });

        it('should return empty value when input value is empty string', function () {
            //given
            let value = '';

            //when
            let result = stringUtils.getValueFormatByType(value);

            //then
            expect(typeof result).toEqual('string');
            expect(result).toEqual('');
        });

        it('should return Boolean value when input value is "true"', function () {
            //given
            let value = "true";

            //when
            let result = stringUtils.getValueFormatByType(value);

            //then
            expect(typeof result).toEqual('boolean');
            expect(result).toEqual(true);
        });

        it('should return Boolean value when input value is "false"', function () {
            //given
            let value = "false";

            //when
            let result = stringUtils.getValueFormatByType(value);

            //then
            expect(typeof result).toEqual('boolean');
            expect(result).toEqual(false);
        });

    });

});
