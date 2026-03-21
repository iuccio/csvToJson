/**
 * CsvToJson - CSV to JSON converter library
 * Main entry point providing chainable API for CSV parsing with multiple configuration options
 */

/* globals FileOperationError, CsvFormatError, JsonValidationError, InputValidationError */

"use strict";

let csvToJson = require("./src/csvToJson.js");

const encodingOps = {
    utf8: 'utf8',
    ucs2: 'ucs2',
    utf16le: 'utf16le',
    latin1: 'latin1',
    ascii: 'ascii',
    base64: 'base64',
    hex: 'hex'
};

/**
 * Enable or disable automatic type formatting for values
 * Converts numeric strings to numbers, 'true'/'false' to booleans
 * @category 1-Core API
 * @param {boolean} active - Whether to format values by type (default: true)
 * @returns {object} Module context for method chaining
 */
exports.formatValueByType = function (active = true) {
  csvToJson.formatValueByType(active);
  return this;
};

/**
 * Enable or disable support for RFC 4180 quoted fields
 * When enabled, fields wrapped in double quotes can contain delimiters and newlines
 * @category 1-Core API
 * @param {boolean} active - Whether to support quoted fields (default: false)
 * @returns {object} Module context for method chaining
 */
exports.supportQuotedField = function (active = false) {
  csvToJson.supportQuotedField(active);
  return this;
};
/**
 * Set the field delimiter character used to separate CSV fields
 * @category 1-Core API
 * @param {string} delimiter - Character(s) to use as field separator (default: ',')
 * @returns {object} Module context for method chaining
 */
exports.fieldDelimiter = function (delimiter) {
  csvToJson.fieldDelimiter(delimiter);
  return this;
};

/**
 * Configure whitespace handling in CSV header field names
 * When active, removes all whitespace from header names (e.g., "My Name" → "MyName")
 * When inactive, only trims leading and trailing whitespace
 * @category 1-Core API
 * @param {boolean} active - Whether to remove all whitespace from headers (default: false)
 * @returns {object} Module context for method chaining
 */
exports.trimHeaderFieldWhiteSpace = function (active = false) {
  csvToJson.trimHeaderFieldWhiteSpace(active);
  return this;
};

/**
 * Set the row index where CSV headers are located
 * Use this if headers are not on the first line (row 0)
 * @category 1-Core API
 * @param {number} index - Zero-based row index containing headers
 * @returns {object} Module context for method chaining
 */
exports.indexHeader = function (index) {
  csvToJson.indexHeader(index);
  return this;
};

/**
 * Configure sub-array parsing for special field values
 * Fields bracketed by delimiter and containing separator are parsed into arrays
 * @category 1-Core API
 * @param {string} delimiter - Bracket character (default: '*')
 * @param {string} separator - Item separator within brackets (default: ',')
 * @returns {object} Module context for method chaining
 * @example
 * // Input field: "*val1,val2,val3*"
 * // Output array: ["val1", "val2", "val3"]
 * csvToJson.parseSubArray('*', ',')
 */
exports.parseSubArray = function (delimiter, separator) {
  csvToJson.parseSubArray(delimiter, separator);
  return this;
};

/**
 * Set custom file encoding for reading CSV files
 * Useful for non-UTF8 encoded files
 * @category 1-Core API
 * @param {string} encoding - Node.js supported encoding (e.g., 'utf8', 'latin1', 'ascii')
 * @returns {object} Module context for method chaining
 */
exports.customEncoding = function (encoding) {
  csvToJson.encoding = encoding;
  return this;
};

/**
 * Set UTF-8 encoding (default encoding)
 * @category 1-Core API
 * @returns {object} Module context for method chaining
 */
exports.utf8Encoding = function utf8Encoding() {
  csvToJson.encoding = encodingOps.utf8;
  return this;
};

/**
 * Set UCS-2 encoding for reading files
 * @category 1-Core API
 * @returns {object} Module context for method chaining
 */
exports.ucs2Encoding = function () {
  csvToJson.encoding = encodingOps.ucs2;
  return this;
};

/**
 * Set UTF-16 LE encoding for reading files
 * @category 1-Core API
 * @returns {object} Module context for method chaining
 */
exports.utf16leEncoding = function () {
  csvToJson.encoding = encodingOps.utf16le;
  return this;
};

/**
 * Set Latin-1 (ISO-8859-1) encoding for reading files
 * @category 1-Core API
 * @returns {object} Module context for method chaining
 */
exports.latin1Encoding = function () {
  csvToJson.encoding = encodingOps.latin1;
  return this;
};

/**
 * Set ASCII encoding for reading files
 * @category 1-Core API
 * @returns {object} Module context for method chaining
 */
exports.asciiEncoding = function () {
  csvToJson.encoding = encodingOps.ascii;
  return this;
};

/**
 * Set Base64 encoding for reading files
 * @category 1-Core API
 * @returns {object} Module context for method chaining
 */
exports.base64Encoding = function () {
  this.csvToJson = encodingOps.base64;
  return this;
};

/**
 * Set Hex encoding for reading files
 * @category 1-Core API
 * @returns {object} Module context for method chaining
 */
exports.hexEncoding = function () {
  this.csvToJson = encodingOps.hex;
  return this;
};

/**
 * Set a mapper function to transform each row after conversion
 * The mapper function receives (row, index) where row is the JSON object 
 * and index is the 0-based row number. Return null/undefined to filter out rows.
 * @category 1-Core API
 * @param {function(object, number): (object|null)} mapperFn - Function to transform each row
 * @returns {object} Module context for method chaining
 * @example
 * csvToJson
 *   .mapRows((row, idx) => idx % 2 === 0 ? row : null) // Keep every other row
 *   .getJsonFromCsv('input.csv')
 */
exports.mapRows = function (mapperFn) {
  csvToJson.mapRows(mapperFn);
  return this;
};

/**
 * Parse CSV file and write the parsed JSON to an output file (synchronous)
 * @param {string} inputFileName - Path to input CSV file
 * @param {string} outputFileName - Path to output JSON file
 * @throws {Error} If inputFileName or outputFileName is not defined
 * @throws {FileOperationError} If file operations fail
 * @throws {CsvFormatError} If CSV is malformed
 * @category 1-Core API
 * @example
 * const csvToJson = require('convert-csv-to-json');
 * csvToJson.generateJsonFileFromCsv('input.csv', 'output.json');
 */
exports.generateJsonFileFromCsv = function(inputFileName, outputFileName) {
  if (!inputFileName) {
    throw new Error("inputFileName is not defined!!!");
  }
  if (!outputFileName) {
    throw new Error("outputFileName is not defined!!!");
  }
  csvToJson.generateJsonFileFromCsv(inputFileName, outputFileName);
};

/**
 * Parse CSV file and return parsed data as JSON array of objects (synchronous)
 * @param {string} inputFileName - Path to input CSV file
 * @returns {Array<object>} Array of objects representing CSV rows
 * @throws {Error} If inputFileName is not defined
 * @throws {FileOperationError} If file read fails
 * @throws {CsvFormatError} If CSV is malformed
 * @category 1-Core API
 * @example
 * const csvToJson = require('convert-csv-to-json');
 * const rows = csvToJson.getJsonFromCsv('resource/input.csv');
 * console.log(rows);
 */
exports.getJsonFromCsv = function(inputFileName) {
  if (!inputFileName) {
    throw new Error("inputFileName is not defined!!!");
  }
  return csvToJson.getJsonFromCsv(inputFileName);
};

/**
 * Parse CSV file asynchronously and return parsed data as JSON array
 * @param {string} inputFileNameOrCsv - Path to file or CSV string
 * @param {object} options - Configuration options
 * @param {boolean} options.raw - If true, treats first param as CSV content; if false, reads from file
 * @returns {Promise<Array<object>>} Promise resolving to array of objects
 * @throws {InputValidationError} If input is invalid
 * @throws {FileOperationError} If file read fails
 * @throws {CsvFormatError} If CSV is malformed
 * @category 1-Core API
 * @example
 * const csvToJson = require('convert-csv-to-json');
 * const data = await csvToJson.getJsonFromCsvAsync('resource/input.csv');
 * console.log(data);
 */
const csvToJsonAsync = require('./src/csvToJsonAsync');

// Re-export all async API methods
Object.assign(exports, {
  getJsonFromCsvAsync: function(input, options) {
    return csvToJsonAsync.getJsonFromCsvAsync(input, options);
  },
  csvStringToJsonAsync: function(input, options) {
    return csvToJsonAsync.csvStringToJsonAsync(input, options);
  },
  csvStringToJsonStringifiedAsync: function(input) {
    return csvToJsonAsync.csvStringToJsonStringifiedAsync(input);
  },
  generateJsonFileFromCsvAsync: function(input, output) {
    return csvToJsonAsync.generateJsonFileFromCsv(input, output);
  }
});

/**
 * Parse a CSV string and return as JSON array of objects (synchronous)
 * @param {string} csvString - CSV content as string
 * @returns {Array<object>} Array of objects representing CSV rows
 * @throws {InputValidationError} If csvString is invalid
 * @throws {CsvFormatError} If CSV is malformed
 * @category 1-Core API
 * @example
 * const csvToJson = require('convert-csv-to-json');
 * const rows = csvToJson.csvStringToJson('name,age\nAlice,30');
 * console.log(rows); // [{ name: 'Alice', age: '30' }]
 */
exports.csvStringToJson = function(csvString) {
  return csvToJson.csvStringToJson(csvString);
};

/**
 * Parse CSV string and return as stringified JSON (synchronous)
 * @param {string} csvString - CSV content as string
 * @returns {string} JSON stringified array of objects
 * @throws {InputValidationError} If csvString is invalid
 * @throws {CsvFormatError} If CSV is malformed
 * @throws {JsonValidationError} If JSON generation fails
 * @category 1-Core API
 */
exports.csvStringToJsonStringified = function(csvString) {
  if (csvString === undefined || csvString === null) {
    throw new Error("csvString is not defined!!!");
  }
  return csvToJson.csvStringToJsonStringified(csvString);
};



exports.browser = require('./src/browserApi');
