'use strict';
let index = require('../index');

describe('csvStringToJsonStringified()', function () {
    it('should parse csv content string and return validated JSON string', function () {
        let csv = 'firstName;lastName;email;gender;age;birth;zip;registered\nConstantin;Langsdon;clangsdon0@hc360.com;Male;96;10.02.1965;123;true\nNorah;Raison;nraison1@wired.com;Female;32.5;10.05.2000;;false\n';
        let jsonString = index.csvStringToJsonStringified(csv);
        expect(typeof jsonString).toBe('string');
        // should be valid JSON
        let parsed = JSON.parse(jsonString);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBe(2);
        expect(parsed[0].firstName).toBe('Constantin');
        expect(parsed[1].firstName).toBe('Norah');
    });
});
