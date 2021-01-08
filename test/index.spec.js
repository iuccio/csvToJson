'use strict';

let expect = require('chai').expect;
let assert = require('chai').assert;
let index = require('../index');


let fileInputName = 'test/resource/input.csv';

describe('API testing', function () {

    describe('getJsonFromCsv() testing', function () {
        let expectedJson;
        beforeEach(function () {
            expectedJson = [{
                firstName: 'Constantin',
                lastName: 'Langsdon',
                email: 'clangsdon0@hc360.com',
                gender: 'Male',
                age: "96",
                birth: '10.02.1965',
                zip: "123",
                registered: "true"
            },
                {
                    firstName: 'Norah',
                    lastName: 'Raison',
                    email: 'nraison1@wired.com',
                    gender: 'Female',
                    age: "32.5",
                    birth: '10.05.2000',
                    zip: '',
                    registered: "false"
                }];
        });
        it('should return json array', function () {
            //given

            //when
            let result = index.getJsonFromCsv(fileInputName);

            //then
            expect(result.length).to.equal(expectedJson.length);
            expect(result).to.deep.equal(expectedJson);
        });

        afterEach(function () {
           index.formatValueByType(false);
        });


        it('should return json array that contains the same property of the csv header', function () {
            //given
            let headers = ['firstName', 'lastName', 'email', 'gender', 'age', 'birth','zip','registered'];

            //when
            let result = index.getJsonFromCsv(fileInputName);

            //then
            assert.isDefined(result);
            assert.hasAllKeys(result[0], headers);
        });

        it('should return json array from csv with tilde as field delimiter', function () {
            //given

            //when
            let result = index.fieldDelimiter('~').getJsonFromCsv('test/resource/input_tilde_delimiter.csv');

            //then
            expect(result.length).to.equal(expectedJson.length);
            expect(result).to.deep.equal(expectedJson);
        });

        it('should return json array with subArray', function () {
            //given

            let expectedResult = [{
                firstName: 'Constantin',
                lastName: 'Langsdon',
                email: 'clangsdon0@hc360.com',
                gender: 'Male',
                age: "96",
                birth: '10.02.1965',
                sons: ['anto','diego','hamsik']
            },{
                firstName: 'Constantin',
                lastName: 'Langsdon',
                email: 'clangsdon0@hc360.com',
                gender: 'Male',
                age: "96",
                birth: '10.02.1965',
                sons: ['12','10','13']
            }];
            //when
            let result = index.parseSubArray("*",',').fieldDelimiter(";").getJsonFromCsv('test/resource/input_example_sub_array.csv');
            //then
            expect(result.length).to.equal(2);
            expect(result[0].sons).to.deep.equal(expectedResult[0].sons);
            expect(result[1].sons).to.deep.equal(expectedResult[1].sons);

        });

        it('should return json array with subArray both formatted by type', function () {
            //given

            let expectedResult = [{
                firstName: 'Constantin',
                lastName: 'Langsdon',
                email: 'clangsdon0@hc360.com',
                gender: 'Male',
                age: "96",
                birth: '10.02.1965',
                sons: ['anto','diego','hamsik']
            },{
                firstName: 'Constantin',
                lastName: 'Langsdon',
                email: 'clangsdon0@hc360.com',
                gender: 'Male',
                age: "96",
                birth: '10.02.1965',
                sons: [12,10,13]
            }];
            //when
            let result = index.parseSubArray("*",',').fieldDelimiter(";").formatValueByType().getJsonFromCsv('test/resource/input_example_sub_array.csv');
            //then
            expect(result.length).to.equal(2);
            expect(result[0].sons).to.deep.equal(expectedResult[0].sons);

        });

        it('should return json array with value formatted by type', function () {
            //given
            expectedJson[0].age = 96;
            expectedJson[0].zip = 123;
            expectedJson[1].age = 32.5;
            expectedJson[0].registered = true;
            expectedJson[1].registered = false;

            //when
            let result = index.formatValueByType().fieldDelimiter(";").getJsonFromCsv(fileInputName);

            //then
            expect(result.length).to.equal(expectedJson.length);
            expect(result).to.deep.equal(expectedJson);
        });

    });

});
