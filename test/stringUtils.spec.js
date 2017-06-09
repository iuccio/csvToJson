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
        it('should return type of Number', function () {
            //given
            let value = '23';

            //when
            let result = stringUtils.getValueFormatByType(value);

            //then
            expect(result).to.be.an('number');
            expect(result).to.equal(23);
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
    });


});