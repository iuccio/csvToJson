'use strict';

let expect = require('chai').expect;
let stringUtils = require('../src/util/stringUtils');

describe('StringUtils class testing', function () {

    it('Should trim input value', function () {
        //given
        let value = 'value ';

        //when
        let result = stringUtils.trimPropertyName(value);

        //then
        expect(result).to.equal('value');
    });

});