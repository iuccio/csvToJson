'use strict';

const { describe, it } = require('./test');
const index = require('../index');

describe('Encoding testing', function () {
    it('should return an object with latin1 encode decoded', function (t) {
        //when
        let result = index.latin1Encoding().getJsonFromCsv('test/resource/input_latin1_encode.csv');

        //then
        t.assert.notStrictEqual(result, null);
        t.assert.strictEqual(result[0].l_ATC1, 'Système digestif et métabolisme');
    });
});
