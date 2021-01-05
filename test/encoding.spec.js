'use strict';

let expect = require('chai').expect;
let assert = require('chai').assert;
let index = require('../index');

describe('Encoding testing', function () {

    it('should return an object with latin1 encode decoded', function () {
        //when
        let result = index.latin1Encoding().getJsonFromCsv('test/resource/input_latin1_encode.csv');

        //then
        assert.isNotEmpty(result);
        expect(result[0].l_ATC1).to.be.equal('Système digestif et métabolisme');
        expect(result[0]).to.deep.include({l_ATC1: 'Système digestif et métabolisme'});
    });

});


