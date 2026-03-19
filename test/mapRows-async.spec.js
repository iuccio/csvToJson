'use strict';

let index = require('../index');

let fileInputName = 'test/resource/input.csv';

describe('mapRows() with async API', function () {

    afterEach(function () {
        // Reset all configuration
        index.formatValueByType(false);
    });

    describe('mapRows() with getJsonFromCsvAsync', function () {
        it('should transform each row asynchronously', async function () {
            //given
            let mapper = function(row) {
                row.firstName = row.firstName.toUpperCase();
                return row;
            };

            //when
            let result = await index
                .fieldDelimiter(";")
                .mapRows(mapper)
                .getJsonFromCsvAsync(fileInputName);

            //then
            expect(result.length).toEqual(2);
            expect(result[0].firstName).toEqual('CONSTANTIN');
            expect(result[1].firstName).toEqual('NORAH');
        });

        it('should allow filtering rows asynchronously', async function () {
            //given
            let mapper = function(row) {
                // Only keep rows with age >= 96
                if (parseInt(row.age) >= 96) {
                    return row;
                }
                return null;
            };

            //when
            let result = await index
                .fieldDelimiter(";")
                .mapRows(mapper)
                .getJsonFromCsvAsync(fileInputName);

            //then
            expect(result.length).toEqual(1);
            expect(result[0].firstName).toEqual('Constantin');
        });

        it('should work with formatValueByType', async function () {
            //given
            let mapper = function(row) {
                if (typeof row.age === 'number') {
                    row.age = row.age * 2;
                }
                return row;
            };

            //when
            let result = await index
                .formatValueByType(true)
                .fieldDelimiter(";")
                .mapRows(mapper)
                .getJsonFromCsvAsync(fileInputName);

            //then
            expect(result.length).toEqual(2);
            expect(result[0].age).toEqual(192);
            expect(result[1].age).toEqual(65);
        });
    });

    describe('mapRows() with csvStringToJsonAsync', function () {
        it('should transform rows from CSV string asynchronously', async function () {
            //given
            let csvString = 'firstName;lastName;email\nJohn;Doe;john@example.com\nJane;Smith;jane@example.com';
            let mapper = function(row, index) {
                row.id = index + 1;
                row.fullName = row.firstName + ' ' + row.lastName;
                return row;
            };

            //when
            let result = await index
                .fieldDelimiter(";")
                .mapRows(mapper)
                .csvStringToJsonAsync(csvString);

            //then
            expect(result.length).toEqual(2);
            expect(result[0].id).toEqual(1);
            expect(result[0].fullName).toEqual('John Doe');
            expect(result[1].id).toEqual(2);
            expect(result[1].fullName).toEqual('Jane Smith');
        });

        it('should allow filtering async rows from CSV string', async function () {
            //given
            let csvString = 'name;age\nAlice;25\nBob;17\nCharlie;30';
            let mapper = function(row) {
                // Filter: keep only adults (age >= 18)
                if (parseInt(row.age) >= 18) {
                    return row;
                }
                return null;
            };

            //when
            let result = await index
                .fieldDelimiter(";")
                .mapRows(mapper)
                .csvStringToJsonAsync(csvString);

            //then
            expect(result.length).toEqual(2);
            expect(result[0].name).toEqual('Alice');
            expect(result[1].name).toEqual('Charlie');
        });
    });

    describe('mapRows() with complex async transformations', function () {
        it('should allow complex row transformations in async context', async function () {
            //given
            let mapper = function(row, index) {
                return {
                    id: index,
                    person: {
                        name: row.firstName + ' ' + row.lastName,
                        email: row.email,
                        age: row.age
                    }
                };
            };

            //when
            let result = await index
                .fieldDelimiter(";")
                .mapRows(mapper)
                .getJsonFromCsvAsync(fileInputName);

            //then
            expect(result.length).toEqual(2);
            expect(result[0].person.name).toEqual('Constantin Langsdon');
            expect(result[0].person.email).toEqual('clangsdon0@hc360.com');
            expect(result[1].person.name).toEqual('Norah Raison');
        });

        it('should support adding metadata asynchronously', async function () {
            //given
            let mapper = function(row, index) {
                row.metadata = {
                    processed: true,
                    rowIndex: index,
                    timestamp: '2026-03-18'
                };
                return row;
            };

            //when
            let result = await index
                .fieldDelimiter(";")
                .mapRows(mapper)
                .getJsonFromCsvAsync(fileInputName);

            //then
            expect(result.length).toEqual(2);
            expect(result[0].metadata.processed).toEqual(true);
            expect(result[0].metadata.rowIndex).toEqual(0);
            expect(result[0].metadata.timestamp).toEqual('2026-03-18');
        });
    });
});
