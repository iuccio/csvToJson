'use strict';
let index = require('../index');

describe('Encoding testing', function () {

    it('should return an object with latin1 encode decoded', function () {
        //when
        let result = index.latin1Encoding().getJsonFromCsv('test/resource/input_latin1_encode.csv');

        //then
        expect(result).not.toBeNull()
        expect(result[0].l_ATC1).toEqual('Système digestif et métabolisme');
    });

});


