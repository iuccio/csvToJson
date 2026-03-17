'use strict';

const index = require('../index');

describe('RFC 4180 Compliance Tests', function () {
    afterEach(function () {
        index.formatValueByType(false);
        index.supportQuotedField(false);
        index.fieldDelimiter(','); // Reset to RFC 4180 default
    });

    describe('RFC 4180 Default Comma Delimiter', function () {
        it('should use comma as default delimiter (RFC 4180)', function () {
            let csv = 'firstName,lastName,email\nJohn,Doe,john@example.com\n';
            let result = index.supportQuotedField(true).csvStringToJson(csv);
            
            expect(result.length).toBe(1);
            expect(result[0].firstName).toBe('John');
            expect(result[0].lastName).toBe('Doe');
            expect(result[0].email).toBe('john@example.com');
        });
    });

    describe('RFC 4180 Quoted Fields', function () {
        it('should handle quoted fields with commas inside', function () {
            let csv = 'firstName,lastName,email\n"Doe, John",Smith,"john.smith@example.com,support@example.com"\n';
            let result = index.supportQuotedField(true).csvStringToJson(csv);
            
            expect(result.length).toBe(1);
            expect(result[0].firstName).toBe('Doe, John');
            expect(result[0].lastName).toBe('Smith');
            expect(result[0].email).toBe('john.smith@example.com,support@example.com');
        });

        it('should handle escaped quotes (double quotes within quoted field)', function () {
            let csv = 'name,description\n"Item","""Premium"" Product"\n';
            let result = index.supportQuotedField(true).csvStringToJson(csv);
            
            expect(result.length).toBe(1);
            expect(result[0].name).toBe('Item');
            expect(result[0].description).toBe('"Premium" Product');
        });

        it('should handle multi-line fields with newlines inside quotes', function () {
            let csv = 'id,name,description\n1,"John Doe","Line 1\nLine 2\nLine 3"\n2,"Jane Smith","Single line"\n';
            let result = index.supportQuotedField(true).csvStringToJson(csv);
            
            expect(result.length).toBe(2);
            expect(result[0].id).toBe('1');
            expect(result[0].name).toBe('John Doe');
            expect(result[0].description).toContain('Line 1');
            expect(result[0].description).toContain('Line 2');
            expect(result[0].description).toContain('Line 3');
            expect(result[1].id).toBe('2');
        });

        it('should handle mixed quoted and unquoted fields', function () {
            let csv = 'id,name,status\n1,John,"Active, Important"\n2,"Jane Doe",Inactive\n';
            let result = index.supportQuotedField(true).csvStringToJson(csv);
            
            expect(result.length).toBe(2);
            expect(result[0].id).toBe('1');
            expect(result[0].name).toBe('John');
            expect(result[0].status).toBe('Active, Important');
            expect(result[1].id).toBe('2');
            expect(result[1].name).toBe('Jane Doe');
            expect(result[1].status).toBe('Inactive');
        });

        it('should preserve spaces inside quoted fields', function () {
            let csv = 'code,name\nA," Item with spaces "\nB," Another item "\n';
            let result = index.supportQuotedField(true).csvStringToJson(csv);
            
            expect(result.length).toBe(2);
            expect(result[0].name).toBe(' Item with spaces ');
            expect(result[1].name).toBe(' Another item ');
        });

        it('should handle empty quoted fields', function () {
            let csv = 'first,second,third\n"","value",""\n';
            let result = index.supportQuotedField(true).csvStringToJson(csv);
            
            expect(result.length).toBe(1);
            expect(result[0].first).toBe('');
            expect(result[0].second).toBe('value');
            expect(result[0].third).toBe('');
        });

        it('should handle complex multi-line quoted field with commas and quotes', function () {
            let csv = 'id,content\n1,"This is a ""complex"" field,\nwith a comma and newline"\n';
            let result = index.supportQuotedField(true).csvStringToJson(csv);
            
            expect(result.length).toBe(1);
            expect(result[0].id).toBe('1');
            expect(result[0].content).toContain('This is a "complex" field,');
            expect(result[0].content).toContain('with a comma and newline');
        });
    });

    describe('RFC 4180 Line Endings', function () {
        it('should handle CRLF line endings correctly', function () {
            let csv = 'id,name\r\n1,John\r\n2,Jane\r\n';
            let result = index.supportQuotedField(true).csvStringToJson(csv);
            
            expect(result.length).toBe(2);
            expect(result[0].id).toBe('1');
            expect(result[0].name).toBe('John');
            expect(result[1].id).toBe('2');
            expect(result[1].name).toBe('Jane');
        });

        it('should handle LF line endings correctly', function () {
            let csv = 'id,name\n1,John\n2,Jane\n';
            let result = index.supportQuotedField(true).csvStringToJson(csv);
            
            expect(result.length).toBe(2);
            expect(result[0].id).toBe('1');
            expect(result[1].name).toBe('Jane');
        });

        it('should handle mixed LF and CRLF line endings', function () {
            let csv = 'id,name\r\n1,John\n2,Jane\r\n';
            let result = index.supportQuotedField(true).csvStringToJson(csv);
            
            expect(result.length).toBe(2);
            expect(result[0].value).toBeUndefined();
            expect(result[0].id).toBe('1');
        });
    });

    describe('RFC 4180 Empty Fields and Records', function () {
        it('should handle empty fields', function () {
            let csv = 'id,name,email\n1,John,\n2,,jane@example.com\n';
            let result = index.supportQuotedField(true).csvStringToJson(csv);
            
            expect(result.length).toBe(2);
            expect(result[0].email).toBe('');
            expect(result[1].name).toBe('');
        });

        it('should handle trailing empty fields', function () {
            let csv = 'id,name,optional1,optional2\n1,John,,\n2,Jane,value,\n';
            let result = index.supportQuotedField(true).csvStringToJson(csv);
            
            expect(result.length).toBe(2);
            expect(result[0].optional1).toBe('');
            expect(result[0].optional2).toBe('');
            expect(result[1].optional1).toBe('value');
            expect(result[1].optional2).toBe('');
        });
    });

    describe('RFC 4180 Quote Escaping Edge Cases', function () {
        it('should handle multiple consecutive escaped quotes', function () {
            let csv = 'text\n"""multiple""quotes""here"""\n';
            let result = index.supportQuotedField(true).csvStringToJson(csv);
            
            expect(result.length).toBe(1);
            expect(result[0].text).toBe('"multiple"quotes"here"');
        });

        it('should handle quote at start and end of field', function () {
            let csv = 'text\n"""quoted text"""\n';
            let result = index.supportQuotedField(true).csvStringToJson(csv);
            
            expect(result.length).toBe(1);
            expect(result[0].text).toBe('"quoted text"');
        });
    });
});
