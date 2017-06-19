'use strict';

let expect = require('chai').expect;
let assert = require('chai').assert;
let index = require('../index');

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

describe('API testing', function () {

    describe('getJsonFromCsv() testing', function () {

        it('should return json array', function () {
            //given

            //when
            let result = index.getJsonFromCsv(fileInputName);

            //then
            expect(result.length).to.equal(expectedJson.length);
            expect(result).to.deep.equal(expectedJson);

        });

        it('should return json array with value formatted by type', function () {
            //given
            expectedJson[0].age = 96;
            expectedJson[1].age = 32;

            //when
            let result = index.formatValueByType().getJsonFromCsv(fileInputName);

            //then
            expect(result.length).to.equal(expectedJson.length);
            expect(result).to.deep.equal(expectedJson);

        });

        it('should return json array that contains the same property of the csv header', function () {
            //given
            let headers = ['firstName', 'lastName', 'email', 'gender', 'age', 'birth'];

            //when
            let result = index.getJsonFromCsv(fileInputName);

            //then
            assert.isDefined(result);
            assert.hasAllKeys(result[0], headers);
        });


        it('should return json array from csv with tilde ad field delimiter', function () {
            //given

            //when
            let result = index.fieldDelimiter('~').getJsonFromCsv('test/resource/input_tilde_delimiter.csv');

            //then
            expect(result.length).to.equal(expectedJson.length);
            expect(result).to.deep.equal(expectedJson);

        });
    });
});