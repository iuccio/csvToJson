'use strict';

let index = require('../index');
let fs = require('fs');
let path = require('path');

describe('JSON to CSV API testing', function () {

    describe('jsonToCsvStringified() testing', function () {
        let testData;
        let testDataMultipleFields;

        beforeEach(function () {
            testData = [
                { firstName: 'John', lastName: 'Doe', age: 30 },
                { firstName: 'Jane', lastName: 'Smith', age: 25 }
            ];

            testDataMultipleFields = [
                { id: 1, name: 'Alice', department: 'Engineering', salary: 95000 },
                { id: 2, name: 'Bob', department: 'Sales', salary: 75000 },
                { id: 3, name: 'Charlie', department: 'Marketing', salary: 65000 }
            ];
        });

        it('should convert JSON array to CSV string', function () {
            //when
            let result = index.jsonToCsvStringified(testData);

            //then
            expect(result).toBeDefined();
            expect(typeof result).toBe('string');
            expect(result).toContain('firstName');
            expect(result).toContain('John');
            expect(result).toContain('Jane');
        });

        it('should include all fields in CSV header', function () {
            //when
            let result = index.jsonToCsvStringified(testDataMultipleFields);

            //then
            let lines = result.split('\r\n');
            let headers = lines[0];
            expect(headers).toContain('id');
            expect(headers).toContain('name');
            expect(headers).toContain('department');
            expect(headers).toContain('salary');
        });

        it('should handle special characters and quotes', function () {
            //given
            let dataWithQuotes = [
                { name: 'John "Jack" Doe', city: 'New York' },
                { name: 'Jane Smith', city: 'Los Angeles' }
            ];

            //when
            let result = index.jsonToCsvStringified(dataWithQuotes);

            //then
            expect(result).toBeDefined();
            expect(result).toContain('John');
        });

        it('should handle fields with commas', function () {
            //given
            let dataWithCommas = [
                { name: 'John, Jr.', address: 'Main St, Apt 5' },
                { name: 'Jane Smith', address: 'Oak Ave, Suite 200' }
            ];

            //when
            let result = index.jsonToCsvStringified(dataWithCommas);

            //then
            expect(result).toBeDefined();
            // Commas in fields should be handled (quoted)
            expect(result).toContain('John');
        });

        it('should throw error for empty array', function () {
            //given
            let emptyData = [];

            //then
            expect(() => index.jsonToCsvStringified(emptyData)).toThrow();
        });

        it('should throw error if input is not an array', function () {
            //given
            let notAnArray = { name: 'John' };

            //then
            expect(() => index.jsonToCsvStringified(notAnArray)).toThrow();
        });

        afterEach(function () {
            index.formatValueByType(false);
        });
    });

    describe('Alias testing', function () {
        let testData;

        beforeEach(function () {
            testData = [
                { name: 'Alice', email: 'alice@example.com' },
                { name: 'Bob', email: 'bob@example.com' }
            ];
        });

        it('should work the same as jsonToCsvStringified', function () {
            //when
            let result = index.jsonToCsvStringified(testData);

            //then
            expect(result).toBeDefined();
            expect(typeof result).toBe('string');
            expect(result).toContain('name');
            expect(result).toContain('email');
        });
    });

    describe('generateCsvFileFromJson() testing', function () {
        let testData;
        let outputFile;

        beforeEach(function () {
            testData = [
                { id: 1, name: 'Alice', status: 'active' },
                { id: 2, name: 'Bob', status: 'inactive' }
            ];
            outputFile = 'test/resource/output_from_json.csv';
        });

        it('should create CSV file from JSON array', function () {
            //when
            index.generateCsvFileFromJson(testData, outputFile);

            //then
            expect(fs.existsSync(outputFile)).toBe(true);
            let content = fs.readFileSync(outputFile, 'utf8');
            expect(content).toContain('id');
            expect(content).toContain('Alice');
        });

        it('should throw error if json data is not defined', function () {
            //then
            expect(() => index.generateCsvFileFromJson(null, outputFile)).toThrow();
        });

        it('should throw error if output file name is not defined', function () {
            //then
            expect(() => index.generateCsvFileFromJson(testData, null)).toThrow();
        });

        afterEach(function () {
            // Cleanup
            if (fs.existsSync(outputFile)) {
                fs.unlinkSync(outputFile);
            }
        });
    });

    describe('getCsvFromJson() testing', function () {
        let inputJsonFile;
        let testJsonData;

        beforeEach(function () {
            inputJsonFile = 'test/resource/input_data.json';
            testJsonData = [
                { product: 'Laptop', price: 1200, stock: 5 },
                { product: 'Mouse', price: 25, stock: 100 }
            ];
            fs.writeFileSync(inputJsonFile, JSON.stringify(testJsonData), 'utf8');
        });

        it('should read JSON file and return CSV string', function () {
            //when
            let result = index.getCsvFromJson(inputJsonFile);

            //then
            expect(result).toBeDefined();
            expect(typeof result).toBe('string');
            expect(result).toContain('product');
            expect(result).toContain('Laptop');
        });

        it('should throw error if file does not exist', function () {
            //given
            let nonExistentFile = 'test/resource/nonexistent.json';

            //then
            expect(() => index.getCsvFromJson(nonExistentFile)).toThrow();
        });

        it('should throw error if input file name is not defined', function () {
            //then
            expect(() => index.getCsvFromJson(null)).toThrow();
        });

        afterEach(function () {
            // Cleanup
            if (fs.existsSync(inputJsonFile)) {
                fs.unlinkSync(inputJsonFile);
            }
        });
    });

    describe('generateCsvFileFromJsonFile() testing', function () {
        let inputJsonFile;
        let outputCsvFile;
        let testJsonData;

        beforeEach(function () {
            inputJsonFile = 'test/resource/input_test.json';
            outputCsvFile = 'test/resource/output_test.csv';
            testJsonData = [
                { name: 'Product A', category: 'Electronics', price: 99.99 },
                { name: 'Product B', category: 'Books', price: 19.99 }
            ];
            fs.writeFileSync(inputJsonFile, JSON.stringify(testJsonData), 'utf8');
        });

        it('should convert JSON file to CSV file', function () {
            //when
            index.generateCsvFileFromJsonFile(inputJsonFile, outputCsvFile);

            //then
            expect(fs.existsSync(outputCsvFile)).toBe(true);
            let content = fs.readFileSync(outputCsvFile, 'utf8');
            expect(content).toContain('name');
            expect(content).toContain('Product A');
        });

        it('should throw error if input file name is not defined', function () {
            //then
            expect(() => index.generateCsvFileFromJsonFile(null, outputCsvFile)).toThrow();
        });

        it('should throw error if output file name is not defined', function () {
            //then
            expect(() => index.generateCsvFileFromJsonFile(inputJsonFile, null)).toThrow();
        });

        afterEach(function () {
            // Cleanup
            if (fs.existsSync(inputJsonFile)) {
                fs.unlinkSync(inputJsonFile);
            }
            if (fs.existsSync(outputCsvFile)) {
                fs.unlinkSync(outputCsvFile);
            }
        });
    });

    describe('jsonToCsvAsync() testing', function () {
        let testData;

        beforeEach(function () {
            testData = [
                { id: 1, title: 'Task 1', priority: 'High' },
                { id: 2, title: 'Task 2', priority: 'Low' }
            ];
        });

        it('should convert JSON to CSV asynchronously', function (done) {
            //when
            index.jsonToCsvAsync(testData).then(function (result) {
                //then
                expect(result).toBeDefined();
                expect(typeof result).toBe('string');
                expect(result).toContain('id');
                expect(result).toContain('Task 1');
                done();
            }).catch(function (err) {
                done(err);
            });
        });
    });

    describe('jsonToCsvStringAsync() testing', function () {
        let testData;
        let jsonString;

        beforeEach(function () {
            testData = [
                { user: 'Alice', role: 'Admin', active: true },
                { user: 'Bob', role: 'User', active: false }
            ];
            jsonString = JSON.stringify(testData);
        });

        it('should convert JSON string to CSV asynchronously', function (done) {
            //when
            index.jsonToCsvStringAsync(jsonString, { raw: true }).then(function (result) {
                //then
                expect(result).toBeDefined();
                expect(typeof result).toBe('string');
                expect(result).toContain('user');
                expect(result).toContain('Alice');
                done();
            }).catch(function (err) {
                done(err);
            });
        });

        it('should convert JSON array directly to CSV asynchronously', function (done) {
            //when
            index.jsonToCsvStringAsync(testData, { raw: true }).then(function (result) {
                //then
                expect(result).toBeDefined();
                expect(typeof result).toBe('string');
                expect(result).toContain('Alice');
                done();
            }).catch(function (err) {
                done(err);
            });
        });
    });

    describe('generateCsvFileFromJsonAsync() testing', function () {
        let testData;
        let outputFile;

        beforeEach(function () {
            testData = [
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }
            ];
            outputFile = 'test/resource/async_output.csv';
        });

        it('should generate CSV file from JSON asynchronously', function (done) {
            //when
            index.generateCsvFileFromJsonAsync(testData, outputFile)
                .then(function () {
                    //then
                    expect(fs.existsSync(outputFile)).toBe(true);
                    let content = fs.readFileSync(outputFile, 'utf8');
                    expect(content).toContain('id');
                    expect(content).toContain('Item 1');
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should throw error if json data is not defined', function (done) {
            //then
            expect(() => index.generateCsvFileFromJsonAsync(null, outputFile)).toThrow();
            done();
        });

        afterEach(function () {
            // Cleanup
            if (fs.existsSync(outputFile)) {
                fs.unlinkSync(outputFile);
            }
        });
    });

    describe('getCsvFromJsonAsync() testing', function () {
        let inputJsonFile;
        let testJsonData;

        beforeEach(function () {
            inputJsonFile = 'test/resource/async_input.json';
            testJsonData = [
                { type: 'A', value: 100 },
                { type: 'B', value: 200 }
            ];
            fs.writeFileSync(inputJsonFile, JSON.stringify(testJsonData), 'utf8');
        });

        it('should read JSON file and return CSV string asynchronously', function (done) {
            //when
            index.getCsvFromJsonAsync(inputJsonFile)
                .then(function (result) {
                    //then
                    expect(result).toBeDefined();
                    expect(typeof result).toBe('string');
                    expect(result).toContain('type');
                    expect(result).toContain('value');
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        afterEach(function () {
            // Cleanup
            if (fs.existsSync(inputJsonFile)) {
                fs.unlinkSync(inputJsonFile);
            }
        });
    });

    describe('generateCsvFileFromJsonFileAsync() testing', function () {
        let inputJsonFile;
        let outputCsvFile;
        let testJsonData;

        beforeEach(function () {
            inputJsonFile = 'test/resource/async_source.json';
            outputCsvFile = 'test/resource/async_target.csv';
            testJsonData = [
                { field1: 'data1', field2: 'value1' },
                { field1: 'data2', field2: 'value2' }
            ];
            fs.writeFileSync(inputJsonFile, JSON.stringify(testJsonData), 'utf8');
        });

        it('should convert JSON file to CSV file asynchronously', function (done) {
            //when
            index.generateCsvFileFromJsonFileAsync(inputJsonFile, outputCsvFile)
                .then(function () {
                    //then
                    expect(fs.existsSync(outputCsvFile)).toBe(true);
                    let content = fs.readFileSync(outputCsvFile, 'utf8');
                    expect(content).toContain('field1');
                    expect(content).toContain('data1');
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        afterEach(function () {
            // Cleanup
            if (fs.existsSync(inputJsonFile)) {
                fs.unlinkSync(inputJsonFile);
            }
            if (fs.existsSync(outputCsvFile)) {
                fs.unlinkSync(outputCsvFile);
            }
        });
    });

    describe('Custom field delimiter testing', function () {
        let testData;

        beforeEach(function () {
            testData = [
                { col1: 'value1', col2: 'value2' },
                { col1: 'value3', col2: 'value4' }
            ];
        });

        it('should use custom field delimiter', function () {
            //when
            let result = index.fieldDelimiter(';').jsonToCsvStringified(testData);

            //then
            expect(result).toContain(';');
            let lines = result.split('\r\n');
            let headerFields = lines[0].split(';');
            expect(headerFields.length).toBe(2);
        });

        it('should use pipe as delimiter', function () {
            //when
            let result = index.fieldDelimiter('|').jsonToCsvStringified(testData);

            //then
            expect(result).toContain('|');
        });

        afterEach(function () {
            index.fieldDelimiter(','); // Reset to default
        });
    });

    describe('Header field whitespace trimming testing', function () {
        let testData;

        beforeEach(function () {
            testData = [
                { 'First Name': 'John', 'Last Name': 'Doe' },
                { 'First Name': 'Jane', 'Last Name': 'Smith' }
            ];
        });

        it('should trim header whitespace when configured', function () {
            //when
            let result = index.trimHeaderFieldWhiteSpace(true).jsonToCsvStringified(testData);

            //then
            expect(result).toBeDefined();
            expect(typeof result).toBe('string');
        });

        afterEach(function () {
            index.trimHeaderFieldWhiteSpace(false); // Reset to default
        });
    });

    describe('Handle null and undefined values', function () {
        let testData;

        beforeEach(function () {
            testData = [
                { name: 'Alice', email: null, age: 30 },
                { name: 'Bob', email: undefined, age: 25 }
            ];
        });

        it('should handle null values in JSON', function () {
            //when
            let result = index.jsonToCsvStringified(testData);

            //then
            expect(result).toBeDefined();
            expect(typeof result).toBe('string');
            expect(result).toContain('Alice');
        });

        it('should handle undefined values in JSON', function () {
            //when
            let result = index.jsonToCsvStringified(testData);

            //then
            expect(result).toBeDefined();
            expect(result).toContain('Bob');
        });
    });

    describe('Handle array and object values', function () {
        let testData;

        beforeEach(function () {
            testData = [
                { name: 'Alice', tags: ['tag1', 'tag2'], metadata: { key: 'value' } },
                { name: 'Bob', tags: ['tag3'], metadata: { info: 'data' } }
            ];
        });

        it('should handle array values in JSON', function () {
            //when
            let result = index.jsonToCsvStringified(testData);

            //then
            expect(result).toBeDefined();
            expect(typeof result).toBe('string');
            expect(result).toContain('Alice');
        });

        it('should handle object values in JSON', function () {
            //when
            let result = index.jsonToCsvStringified(testData);

            //then
            expect(result).toBeDefined();
            expect(result).toContain('Bob');
        });
    });
});
