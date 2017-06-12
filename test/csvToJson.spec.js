'use strict';

let expect = require('chai').expect;
let assert = require('chai').assert;
let csvToJson = require('../src/csvToJson');

let expectedJson = [{
    firstName: 'Constantin',
    lastName: 'Langsdon',
    email: 'clangsdon0@hc360.com',
    gender: 'Male',
    age: "96",
    birth: '10.02.1965'
}, {
    firstName: 'Norah',
    lastName: 'Raison',
    email: 'nraison1@wired.com',
    gender: 'Female',
    age: "32",
    birth: '10.05.2000'
}];

let fileInputName = 'test/resource/input.csv';

describe('CsvToJson class testing', function () {

    it('should return json array', function () {
        //given

        //when
        let result = csvToJson.getJsonFromCsv(fileInputName);

        //then
        expect(result.length).to.equal(expectedJson.length);
        expect(result).to.deep.equal(expectedJson);

    });

    it('should return json array with value formatted by type', function () {
        //given
        expectedJson[0].age = 96;
        expectedJson[1].age = 32;

        //when
        let result = csvToJson.formatValueByType().getJsonFromCsv(fileInputName);

        //then
        expect(result.length).to.equal(expectedJson.length);
        expect(result).to.deep.equal(expectedJson);

    });

    it('should return json array that contains the same property of the csv header', function () {
        //given
        let headers = ['firstName', 'lastName', 'email', 'gender', 'age', 'birth'];

        //when
        let result = csvToJson.getJsonFromCsv(fileInputName);

        //then
        assert.isDefined(result);
        assert.hasAllKeys(result[0],headers);
    });

});