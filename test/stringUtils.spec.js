'use strict';

const stringUtils = require('../src/util/stringUtils');

describe('StringUtils', () => {
    describe('trimPropertyName', () => {
        const testCases = [
            {
                name: 'should remove all whitespace when shouldTrimAll is true',
                input: ' value with  spaces ',
                shouldTrimAll: true,
                expected: 'valuewithspaces'
            },
            {
                name: 'should only trim edges when shouldTrimAll is false',
                input: ' val ue ',
                shouldTrimAll: false,
                expected: 'val ue'
            },
            {
                name: 'should handle empty input',
                input: '',
                shouldTrimAll: true,
                expected: ''
            },
            {
                name: 'should handle undefined input',
                input: undefined,
                shouldTrimAll: true,
                expected: ''
            },
            {
                name: 'should handle input with only spaces',
                input: '   ',
                shouldTrimAll: false,
                expected: ''
            }
        ];

        testCases.forEach(({ name, input, shouldTrimAll, expected }) => {
            it(name, () => {
                expect(stringUtils.trimPropertyName(shouldTrimAll, input)).toBe(expected);
            });
        });
    });

    describe('getValueFormatByType', () => {
        describe('Number handling', () => {
            const numberTestCases = [
                {
                    name: 'should convert simple integer to number',
                    input: '42',
                    expectedType: 'number',
                    expectedValue: 42
                },
                {
                    name: 'should convert negative integer to number',
                    input: '-42',
                    expectedType: 'number',
                    expectedValue: -42
                },
                {
                    name: 'should convert decimal to number',
                    input: '3.14',
                    expectedType: 'number',
                    expectedValue: 3.14
                },
                {
                    name: 'should convert negative decimal to number',
                    input: '-3.14',
                    expectedType: 'number',
                    expectedValue: -3.14
                },
                {
                    name: 'should preserve leading zeros as string',
                    input: '00340434621911190873',
                    expectedType: 'string',
                    expectedValue: '00340434621911190873'
                },
                {
                    name: 'should preserve negative numbers with leading zeros as string',
                    input: '-0012345',
                    expectedType: 'string',
                    expectedValue: '-0012345'
                },
                {
                    name: 'should preserve integers above MAX_SAFE_INTEGER as string',
                    input: '9007199254740992', // MAX_SAFE_INTEGER + 1
                    expectedType: 'string',
                    expectedValue: '9007199254740992'
                },
                {
                    name: 'should preserve integers below MIN_SAFE_INTEGER as string',
                    input: '-9007199254740992', // MIN_SAFE_INTEGER - 1
                    expectedType: 'string',
                    expectedValue: '-9007199254740992'
                },
                {
                    name: 'should handle MAX_SAFE_INTEGER as number',
                    input: '9007199254740991',
                    expectedType: 'number',
                    expectedValue: Number.MAX_SAFE_INTEGER
                }
            ];

            numberTestCases.forEach(({ name, input, expectedType, expectedValue }) => {
                it(name, () => {
                    const result = stringUtils.getValueFormatByType(input);
                    expect(typeof result).toBe(expectedType);
                    expect(result).toBe(expectedValue);
                });
            });
        });

        describe('Boolean handling', () => {
            const booleanTestCases = [
                {
                    name: 'should convert lowercase "true" to boolean true',
                    input: 'true',
                    expected: true
                },
                {
                    name: 'should convert lowercase "false" to boolean false',
                    input: 'false',
                    expected: false
                },
                {
                    name: 'should handle uppercase "TRUE"',
                    input: 'TRUE',
                    expected: true
                },
                {
                    name: 'should handle uppercase "FALSE"',
                    input: 'FALSE',
                    expected: false
                },
                {
                    name: 'should handle mixed case "TrUe"',
                    input: 'TrUe',
                    expected: true
                }
            ];

            booleanTestCases.forEach(({ name, input, expected }) => {
                it(name, () => {
                    const result = stringUtils.getValueFormatByType(input);
                    expect(typeof result).toBe('boolean');
                    expect(result).toBe(expected);
                });
            });
        });

        describe('String handling', () => {
            const stringTestCases = [
                {
                    name: 'should keep pure text as string',
                    input: 'hello world',
                    expected: 'hello world'
                },
                {
                    name: 'should keep alphanumeric text as string',
                    input: 'abc123',
                    expected: 'abc123'
                },
                {
                    name: 'should handle undefined input',
                    input: undefined,
                    expected: ''
                },
                {
                    name: 'should handle empty string',
                    input: '',
                    expected: ''
                },
                {
                    name: 'should handle string with special characters',
                    input: '123-abc!@#',
                    expected: '123-abc!@#'
                }
            ];

            stringTestCases.forEach(({ name, input, expected }) => {
                it(name, () => {
                    const result = stringUtils.getValueFormatByType(input);
                    expect(typeof result).toBe('string');
                    expect(result).toBe(expected);
                });
            });
        });
    });

    describe('hasContent', () => {
        const contentTestCases = [
            {
                name: 'should return true for array with some non-empty values',
                input: ['value', '', null, undefined],
                expected: true
            },
            {
                name: 'should return false for empty array',
                input: [],
                expected: false
            },
            {
                name: 'should return false for array with only empty values',
                input: ['', null, undefined],
                expected: false
            },
            {
                name: 'should handle undefined input',
                input: undefined,
                expected: false
            },
            {
                name: 'should handle null input',
                input: null,
                expected: false
            }
        ];

        contentTestCases.forEach(({ name, input, expected }) => {
            it(name, () => {
                expect(stringUtils.hasContent(input)).toBe(expected);
            });
        });
    });
});
