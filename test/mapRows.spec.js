'use strict';

let index = require('../index');

let fileInputName = 'test/resource/input.csv';

describe('mapRows() feature testing', function () {

    afterEach(function () {
        // Reset all configuration
        index.formatValueByType(false);
    });

    describe('mapRows() basic transformation', function () {
        it('should transform each row with a mapper function', function () {
            //given
            let mapper = function(row) {
                row.firstName = row.firstName.toUpperCase();
                return row;
            };

            //when
            let result = index.fieldDelimiter(";").mapRows(mapper).getJsonFromCsv(fileInputName);

            //then
            expect(result.length).toEqual(2);
            expect(result[0].firstName).toEqual('CONSTANTIN');
            expect(result[1].firstName).toEqual('NORAH');
        });

        it('should allow adding new properties to rows', function () {
            //given
            let mapper = function(row, index) {
                row.rowNumber = index + 1;
                row.processed = true;
                return row;
            };

            //when
            let result = index.fieldDelimiter(";").mapRows(mapper).getJsonFromCsv(fileInputName);

            //then
            expect(result.length).toEqual(2);
            expect(result[0].rowNumber).toEqual(1);
            expect(result[0].processed).toEqual(true);
            expect(result[1].rowNumber).toEqual(2);
        });

        it('should allow filtering rows by returning null', function () {
            //given
            let mapper = function(row) {
                // Only keep rows with age >= 96
                if (parseInt(row.age) >= 96) {
                    return row;
                }
                return null; // Filter out this row
            };

            //when
            let result = index.fieldDelimiter(";").mapRows(mapper).getJsonFromCsv(fileInputName);

            //then
            expect(result.length).toEqual(1);
            expect(result[0].firstName).toEqual('Constantin');
        });

        it('should allow filtering rows by returning undefined', function () {
            //given
            let mapper = function(row) {
                // Only keep rows with age >= 96
                if (parseInt(row.age) >= 96) {
                    return row;
                }
                return undefined; // Filter out this row
            };

            //when
            let result = index.fieldDelimiter(";").mapRows(mapper).getJsonFromCsv(fileInputName);

            //then
            expect(result.length).toEqual(1);
            expect(result[0].firstName).toEqual('Constantin');
        });

        it('should receive correct row index in mapper function', function () {
            //given
            let indices = [];
            let mapper = function(row, index) {
                indices.push(index);
                return row;
            };

            //when
            let result = index.fieldDelimiter(";").mapRows(mapper).getJsonFromCsv(fileInputName);

            //then
            expect(result.length).toEqual(2);
            expect(indices).toEqual([0, 1]);
        });

        it('should be chainable with other methods', function () {
            //given
            let mapper = function(row) {
                row.email = row.email.toUpperCase();
                return row;
            };

            //when
            let result = index
                .formatValueByType(true)
                .fieldDelimiter(";")
                .mapRows(mapper)
                .trimHeaderFieldWhiteSpace(false)
                .getJsonFromCsv(fileInputName);

            //then
            expect(result.length).toEqual(2);
            expect(result[0].email).toEqual('CLANGSDON0@HC360.COM');
        });
    });

    describe('mapRows() with csvStringToJson', function () {
        it('should work with csvStringToJson', function () {
            //given
            let csvString = 'firstName;lastName;email\nJohn;Doe;john@example.com\nJane;Smith;jane@example.com';
            let mapper = function(row) {
                row.fullName = row.firstName + ' ' + row.lastName;
                return row;
            };

            //when
            let result = index.fieldDelimiter(";").mapRows(mapper).csvStringToJson(csvString);

            //then
            expect(result.length).toEqual(2);
            expect(result[0].fullName).toEqual('John Doe');
            expect(result[1].fullName).toEqual('Jane Smith');
        });
    });

    describe('mapRows() error handling', function () {
        it('should throw error if mapper is not a function', function () {
            //given
            let notAFunction = 'not a function';

            //when & then
            expect(function() {
                index.mapRows(notAFunction);
            }).toThrow(TypeError);
        });
    });

    describe('mapRows() transformation combinations', function () {
        it('should work with formatValueByType', function () {
            //given
            let mapper = function(row) {
                // Mapper should work with already formatted values
                return row;
            };

            //when
            let result = index
                .formatValueByType(true)
                .fieldDelimiter(";")
                .mapRows(mapper)
                .getJsonFromCsv(fileInputName);

            //then
            expect(result.length).toEqual(2);
            // Age should be formatted as number
            expect(typeof result[0].age).toEqual('number');
            expect(result[0].age).toEqual(96);
        });

        it('should allow modifying already formatted values', function () {
            //given
            let mapper = function(row) {
                // Double the age
                if (typeof row.age === 'number') {
                    row.age = row.age * 2;
                }
                return row;
            };

            //when
            let result = index
                .formatValueByType(true)
                .fieldDelimiter(";")
                .mapRows(mapper)
                .getJsonFromCsv(fileInputName);

            //then
            expect(result.length).toEqual(2);
            expect(result[0].age).toEqual(192);
            expect(result[1].age).toEqual(65);
        });
    });

    describe('mapRows() with complex transformations', function () {
        it('should allow complex row transformations', function () {
            //given
            let mapper = function(row, index) {
                return {
                    id: index,
                    name: row.firstName + ' ' + row.lastName,
                    contact: row.email,
                    metadata: {
                        gender: row.gender,
                        birth: row.birth
                    }
                };
            };

            //when
            let result = index.fieldDelimiter(";").mapRows(mapper).getJsonFromCsv(fileInputName);

            //then
            expect(result.length).toEqual(2);
            expect(result[0].name).toEqual('Constantin Langsdon');
            expect(result[0].contact).toEqual('clangsdon0@hc360.com');
            expect(result[0].metadata.gender).toEqual('Male');
            expect(result[1].metadata.birth).toEqual('10.05.2000');
        });
    });
});
