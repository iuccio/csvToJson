'use strict';
let index = require('../index');

describe('Encoding testing', function () {

    it('should return an object with utf8 encoding decoded', function () {
        let result = index.fieldDelimiter(';').utf8Encoding().getJsonFromCsv('test/resource/input_utf8_encode.csv');
        expect(result).not.toBeNull();
        expect(result[0].l_ATC1).toEqual('Système digestif et métabolisme');
    });

    it('should return an object with latin1 encoding decoded', function () {
        let result = index.fieldDelimiter(';').latin1Encoding().getJsonFromCsv('test/resource/input_latin1_encode.csv');
        expect(result).not.toBeNull();
        expect(result[0].l_ATC1).toEqual('Système digestif et métabolisme');
    });

    it('should return an object with ucs2 encoding decoded', function () {
        let result = index.fieldDelimiter(';').ucs2Encoding().getJsonFromCsv('test/resource/input_ucs2_encode.csv');
        expect(result).not.toBeNull();
        expect(result[0].l_ATC1).toEqual('Système digestif et métabolisme');
    });

    it('should return an object with utf16le encoding decoded', function () {
        let result = index.fieldDelimiter(';').utf16leEncoding().getJsonFromCsv('test/resource/input_utf16le_encode.csv');
        expect(result).not.toBeNull();
        expect(result[0].l_ATC1).toEqual('Système digestif et métabolisme');
    });

    it('should return an object with ascii encoding decoded', function () {
        let result = index.fieldDelimiter(';').asciiEncoding().getJsonFromCsv('test/resource/input_example.csv');
        expect(result).not.toBeNull();
        expect(result[0].firstName).toEqual('Constantin');
    });

    it('should return an object with base64 encoding decoded', function () {
        let result = index.fieldDelimiter(';').base64Encoding().getJsonFromCsv('test/resource/input_base64_encode.csv');
        expect(result).not.toBeNull();
        expect(result[0].firstName).toEqual('Constantin');
    });

    it('should return an object with hex encoding decoded', function () {
        let result = index.fieldDelimiter(';').hexEncoding().getJsonFromCsv('test/resource/input_hex_encode.csv');
        expect(result).not.toBeNull();
        expect(result[0].firstName).toEqual('Constantin');
    });

});


