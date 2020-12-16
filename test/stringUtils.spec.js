'use strict';

let expect = require('chai').expect;
let stringUtils = require('../src/util/stringUtils');

describe('StringUtils class testing', function () {

    describe('trimPropertyName()', function () {

        it('Should trim input value', function () {
            //given
            let value = ' value ';

            //when
            let result = stringUtils.trimPropertyName(value);

            //then
            expect(result).to.equal('value');
        });
    });

    describe('getValueFormatByType()', function () {
        it('should return type of Number for integers', function () {
            //given
            let value = '23';

            //when
            let result = stringUtils.getValueFormatByType(value);

            //then
            expect(result).to.be.an('number');
            expect(result).to.equal(23);
        });

        it('should return type of Number for non-integers', function () {
            //given
            let value = '0.23';

            //when
            let result = stringUtils.getValueFormatByType(value);

            //then
            expect(result).to.be.an('number');
            expect(result).to.equal(0.23);
        });

        it('should return type of String when value contains only words', function () {
            //given
            let value = 'value';

            //when
            let result = stringUtils.getValueFormatByType(value);

            //then
            expect(result).to.be.an('string');
            expect(result).to.equal('value');
        });

        it('should return type of String when value contains words and digits', function () {
            //given
            let value = '11value';

            //when
            let result = stringUtils.getValueFormatByType(value);

            //then
            expect(result).to.be.an('string');
            expect(result).to.equal('11value');
        });

        it('should return empty value when input value is not defined', function () {
            //given
            let value;

            //when
            let result = stringUtils.getValueFormatByType(value);

            //then
            expect(result).to.be.an('string');
            expect(result).to.equal('');
        });

        it('should return empty value when input value is empty string', function () {
            //given
            let value = '';

            //when
            let result = stringUtils.getValueFormatByType(value);

            //then
            expect(result).to.be.an('string');
            expect(result).to.equal('');
        });

        it('should return Boolean value when input value is "true"', function () {
            //given
            let value = "true";

            //when
            let result = stringUtils.getValueFormatByType(value);

            //then
            expect(result).to.be.an('boolean');
            expect(result).to.equal(true);
        });

        it('should return Boolean value when input value is "false"', function () {
            //given
            let value = "false";

            //when
            let result = stringUtils.getValueFormatByType(value);

            //then
            expect(result).to.be.an('boolean');
            expect(result).to.equal(false);
        });

    });

});
