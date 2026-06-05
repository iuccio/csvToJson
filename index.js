/**
 * CsvToJson - CSV to JSON converter library
 * Main entry point providing chainable API for CSV parsing with multiple configuration options
 */

/* globals FileOperationError, CsvFormatError, JsonValidationError, InputValidationError */

"use strict";

let csvToJson = require("./src/csvToJson.js");
let jsonToCsv = require("./src/jsonToCsv.js");

const encodingOps = {
    utf8: 'utf8',
    ucs2: 'ucs2',
    utf16le: 'utf16le',
    latin1: 'latin1',
    ascii: 'ascii',
    base64: 'base64',
    hex: 'hex'
};

const csvToJsonAsync = require('./src/csvToJsonAsync');
const jsonToCsvAsync = require('./src/jsonToCsvAsync');

/**
 * Apply the same parser configuration update to every parser client.
 * This keeps root-level chainable API calls in sync across sync, async, and browser clients.
 * @param {function(object): void} configFn - Function that applies configuration to a client instance
 * @returns {object} Module exports for chaining
 * @private
 */
function applyConfigToAllClients(configFn) {
  configFn(csvToJson);
  configFn(csvToJsonAsync);
  configFn(jsonToCsv);
  configFn(jsonToCsvAsync);
  if (exports.browser) {
    configFn(exports.browser);
  }
  return exports;
}

/**
 * Enable or disable automatic type formatting for values
 * Converts numeric strings to numbers, 'true'/'false' to booleans
 * @category 1-Core API
 * @param {boolean} active - Whether to format values by type (default: true)
 * @returns {object} Module context for method chaining
 */
exports.formatValueByType = function (active = true) {
  return applyConfigToAllClients(client => client.formatValueByType(active));
};

/**
 * Enable or disable support for RFC 4180 quoted fields
 * When enabled, fields wrapped in double quotes can contain delimiters and newlines
 * @category 1-Core API
 * @param {boolean} active - Whether to support quoted fields (default: false)
 * @returns {object} Module context for method chaining
 */
exports.supportQuotedField = function (active = false) {
  return applyConfigToAllClients(client => client.supportQuotedField(active));
};
/**
 * Set the field delimiter character used to separate CSV fields
 * @category 1-Core API
 * @param {string} delimiter - Character(s) to use as field separator (default: ',')
 * @returns {object} Module context for method chaining
 */
exports.fieldDelimiter = function (delimiter) {
  return applyConfigToAllClients(client => client.fieldDelimiter(delimiter));
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
  return applyConfigToAllClients(client => client.trimHeaderFieldWhiteSpace(active));
};

/**
 * Set the row index where CSV headers are located
 * Use this if headers are not on the first line (row 0)
 * @category 1-Core API
 * @param {number} index - Zero-based row index containing headers
 * @returns {object} Module context for method chaining
 */
exports.indexHeader = function (index) {
  return applyConfigToAllClients(client => client.indexHeader(index));
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
  return applyConfigToAllClients(client => client.parseSubArray(delimiter, separator));
};

/**
 * Set column indexes to ignore
 * Specified columns will be excluded from the JSON output
 * @category 1-Core API
 * @param {Array<number>} indexes - Array of column indexes to ignore
 * @returns {object} Module context for method chaining
 * @example
 * csvToJson.ignoreColumnIndexes([1, 3]) // Ignore columns at index 1 and 3
 */
exports.ignoreColumnIndexes = function (indexes) {
  if (!Array.isArray(indexes)) {
    throw new TypeError('indexes must be an array of numbers');
  }
  if (!indexes.every(idx => Number.isInteger(idx) && idx >= 0)) {
    throw new TypeError('All elements in indexes must be valid non-negative numbers (>= 0)');
  }
  return applyConfigToAllClients(client => client.ignoreColumnIndexes(indexes));
};

/**
 * Set custom file encoding for reading CSV files
 * Useful for non-UTF8 encoded files
 * @category 1-Core API
 * @param {string} encoding - Node.js supported encoding (e.g., 'utf8', 'latin1', 'ascii')
 * @returns {object} Module context for method chaining
 */
exports.customEncoding = function (encoding) {
  return applyConfigToAllClients(client => client.encoding(encoding));
};

/**
 * Set UTF-8 encoding (default encoding)
 * @category 1-Core API
 * @returns {object} Module context for method chaining
 */
exports.utf8Encoding = function utf8Encoding() {
  return applyConfigToAllClients(client => client.encoding(encodingOps.utf8));
};

/**
 * Set UCS-2 encoding for reading files
 * @category 1-Core API
 * @returns {object} Module context for method chaining
 */
exports.ucs2Encoding = function () {
  return applyConfigToAllClients(client => client.encoding(encodingOps.ucs2));
};

/**
 * Set UTF-16 LE encoding for reading files
 * @category 1-Core API
 * @returns {object} Module context for method chaining
 */
exports.utf16leEncoding = function () {
  return applyConfigToAllClients(client => client.encoding(encodingOps.utf16le));
};

/**
 * Set Latin-1 (ISO-8859-1) encoding for reading files
 * @category 1-Core API
 * @returns {object} Module context for method chaining
 */
exports.latin1Encoding = function () {
  return applyConfigToAllClients(client => client.encoding(encodingOps.latin1));
};

/**
 * Set ASCII encoding for reading files
 * @category 1-Core API
 * @returns {object} Module context for method chaining
 */
exports.asciiEncoding = function () {
  return applyConfigToAllClients(client => client.encoding(encodingOps.ascii));
};

/**
 * Set Base64 encoding for reading files
 * @category 1-Core API
 * @returns {object} Module context for method chaining
 */
exports.base64Encoding = function () {
  return applyConfigToAllClients(client => client.encoding(encodingOps.base64));
};

/**
 * Set Hex encoding for reading files
 * @category 1-Core API
 * @returns {object} Module context for method chaining
 */
exports.hexEncoding = function () {
  return applyConfigToAllClients(client => client.encoding(encodingOps.hex));
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
  return applyConfigToAllClients(client => client.mapRows(mapperFn));
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
 * Parse CSV file asynchronously and return parsed data as JSON array.
 * @param {string} input - Path to file or CSV string
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
exports.getJsonFromCsvAsync = function(input, options) {
  return csvToJsonAsync.getJsonFromCsvAsync(input, options);
};

/**
 * Parse a raw CSV string asynchronously and return parsed JSON objects.
 * @param {string} input - CSV content as a string
 * @param {object} [options] - Configuration options
 * @param {boolean} [options.raw] - If true, treats input as CSV content
 * @returns {Promise<Array<object>>} Promise resolving to array of parsed objects
 * @category 1-Core API
 */
exports.csvStringToJsonAsync = function(input, options) {
  return csvToJsonAsync.csvStringToJsonAsync(input, options);
};

/**
 * Parse a raw CSV string asynchronously and return a JSON string.
 * @param {string} input - CSV content as a string
 * @returns {Promise<string>} Promise resolving to JSON string
 * @category 1-Core API
 */
exports.csvStringToJsonStringifiedAsync = function(input) {
  return csvToJsonAsync.csvStringToJsonStringifiedAsync(input);
};

/**
 * Parse a CSV file asynchronously and write the parsed JSON to an output file.
 * @param {string} input - Path to the input CSV file
 * @param {string} output - Path to the output JSON file
 * @returns {Promise<void>} Promise resolving when file is written
 * @category 1-Core API
 */
exports.generateJsonFileFromCsvAsync = function(input, output) {
  return csvToJsonAsync.generateJsonFileFromCsv(input, output);
};

/**
 * Parse CSV from a Readable stream and return parsed data as JSON array.
 * Processes data in chunks for memory-efficient handling of large files.
 * @param {object} stream - Node.js Readable stream containing CSV data
 * @returns {Promise<Array<object>>} Promise resolving to array of objects representing CSV rows
 * @throws {InputValidationError} If stream is invalid
 * @throws {CsvFormatError} If CSV is malformed
 * @category 1-Core API
 * @example
 * const fs = require('fs');
 * const csvToJson = require('convert-csv-to-json');
 * const stream = fs.createReadStream('large.csv');
 * const data = await csvToJson.getJsonFromStreamAsync(stream);
 * console.log(data);
 */
exports.getJsonFromStreamAsync = function(stream) {
  return csvToJsonAsync.getJsonFromStreamAsync(stream);
};

/**
 * Parse CSV from a file path using streaming for memory-efficient processing.
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array<object>>} Promise resolving to array of objects representing CSV rows
 * @throws {InputValidationError} If filePath is invalid
 * @throws {FileOperationError} If file cannot be read
 * @throws {CsvFormatError} If CSV is malformed
 * @category 1-Core API
 * @example
 * const csvToJson = require('convert-csv-to-json');
 * const data = await csvToJson.getJsonFromFileStreamingAsync('large.csv');
 * console.log(data);
 */
exports.getJsonFromFileStreamingAsync = function(filePath) {
  return csvToJsonAsync.getJsonFromFileStreamingAsync(filePath);
};

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

// ======================== JSON to CSV API ========================

/**
 * Convert JSON array to CSV string (synchronous)
 * @param {Array<object>} jsonData - Array of objects to convert
 * @returns {string} CSV formatted string
 * @throws {InputValidationError} If jsonData is invalid
 * @category 2-Core API
 * @example
 * const converter = require('convert-csv-to-json');
 * const rows = [{name: 'Alice', age: 30}, {name: 'Bob', age: 25}];
 * const csv = converter.jsonToCsvStringified(rows);
 * console.log(csv);
 */
exports.jsonToCsvStringified = function(jsonData) {
  if (!jsonData) {
    throw new Error("jsonData is not defined!!!");
  }
  return jsonToCsv.jsonToCsvStringified(jsonData);
};

/**
 * Convert JSON array and write to CSV file (synchronous)
 * @param {Array<object>} jsonData - Array of objects to convert
 * @param {string} fileOutputName - Path to output CSV file
 * @throws {Error} If jsonData or fileOutputName is not defined
 * @throws {InputValidationError} If jsonData is invalid
 * @throws {FileOperationError} If file write fails
 * @category 2-Core API
 * @example
 * const converter = require('convert-csv-to-json');
 * const rows = [{name: 'Alice', age: 30}, {name: 'Bob', age: 25}];
 * converter.generateCsvFileFromJson(rows, 'output.csv');
 */
exports.generateCsvFileFromJson = function(jsonData, fileOutputName) {
  if (!jsonData) {
    throw new Error("jsonData is not defined!!!");
  }
  if (!fileOutputName) {
    throw new Error("fileOutputName is not defined!!!");
  }
  jsonToCsv.generateCsvFileFromJson(jsonData, fileOutputName);
};

/**
 * Read JSON file and convert to CSV string (synchronous)
 * @param {string} fileInputName - Path to input JSON file
 * @returns {string} CSV formatted string
 * @throws {Error} If fileInputName is not defined
 * @throws {FileOperationError} If file read fails
 * @throws {JsonValidationError} If JSON is invalid
 * @category 2-Core API
 * @example
 * const converter = require('convert-csv-to-json');
 * const csv = converter.getCsvFromJson('data.json');
 * console.log(csv);
 */
exports.getCsvFromJson = function(fileInputName) {
  if (!fileInputName) {
    throw new Error("fileInputName is not defined!!!");
  }
  return jsonToCsv.getCsvFromJson(fileInputName);
};

/**
 * Generate CSV file from JSON file (synchronous)
 * @param {string} fileInputName - Path to input JSON file
 * @param {string} fileOutputName - Path to output CSV file
 * @throws {Error} If fileInputName or fileOutputName is not defined
 * @throws {FileOperationError} If file operations fail
 * @throws {JsonValidationError} If JSON is invalid
 * @category 2-Core API
 * @example
 * const converter = require('convert-csv-to-json');
 * converter.generateCsvFileFromJsonFile('input.json', 'output.csv');
 */
exports.generateCsvFileFromJsonFile = function(fileInputName, fileOutputName) {
  if (!fileInputName) {
    throw new Error("fileInputName is not defined!!!");
  }
  if (!fileOutputName) {
    throw new Error("fileOutputName is not defined!!!");
  }
  jsonToCsv.generateCsvFileFromJsonFile(fileInputName, fileOutputName);
};

/**
 * Convert JSON array to CSV string (asynchronous)
 * @param {Array<object>} jsonData - Array of objects to convert
 * @returns {Promise<string>} Promise resolving to CSV formatted string
 * @throws {InputValidationError} If jsonData is invalid
 * @category 2-Core API
 * @example
 * const converter = require('convert-csv-to-json');
 * const rows = [{name: 'Alice', age: 30}, {name: 'Bob', age: 25}];
 * const csv = await converter.jsonToCsvAsync(rows);
 * console.log(csv);
 */
exports.jsonToCsvAsync = function(jsonData) {
  return jsonToCsvAsync.jsonToCsvAsync(jsonData, { raw: true });
};

/**
 * Convert JSON array from raw string/data asynchronously
 * @param {string|Array} input - JSON string or array of objects
 * @param {object} [options] - Configuration options
 * @param {boolean} [options.raw] - If true, treats input as JSON data; if false, reads from file
 * @returns {Promise<string>} Promise resolving to CSV formatted string
 * @throws {InputValidationError} If input is invalid
 * @throws {JsonValidationError} If JSON parsing fails
 * @category 2-Core API
 * @example
 * const converter = require('convert-csv-to-json');
 * const jsonString = '[{"name":"Alice","age":30}]';
 * const csv = await converter.jsonToCsvStringAsync(jsonString, {raw: true});
 */
exports.jsonToCsvStringAsync = function(input, options) {
  return jsonToCsvAsync.jsonToCsvAsync(input, options);
};

/**
 * Convert JSON array and write to CSV file (asynchronous)
 * @param {Array<object>} jsonData - Array of objects to convert
 * @param {string} fileOutputName - Path to output CSV file
 * @returns {Promise<void>} Promise resolving when file is written
 * @throws {InputValidationError} If jsonData is invalid
 * @throws {FileOperationError} If file write fails
 * @category 2-Core API
 * @example
 * const converter = require('convert-csv-to-json');
 * const rows = [{name: 'Alice', age: 30}, {name: 'Bob', age: 25}];
 * await converter.generateCsvFileFromJsonAsync(rows, 'output.csv');
 */
exports.generateCsvFileFromJsonAsync = function(jsonData, fileOutputName) {
  if (!jsonData) {
    throw new Error("jsonData is not defined!!!");
  }
  if (!fileOutputName) {
    throw new Error("fileOutputName is not defined!!!");
  }
  return jsonToCsvAsync.generateCsvFileFromJson(jsonData, fileOutputName);
};

/**
 * Read JSON file and generate CSV file (asynchronous)
 * @param {string} fileInputName - Path to input JSON file
 * @param {string} fileOutputName - Path to output CSV file
 * @returns {Promise<void>} Promise resolving when file is written
 * @throws {FileOperationError} If file operations fail
 * @throws {JsonValidationError} If JSON is invalid
 * @category 2-Core API
 * @example
 * const converter = require('convert-csv-to-json');
 * await converter.generateCsvFileFromJsonFileAsync('input.json', 'output.csv');
 */
exports.generateCsvFileFromJsonFileAsync = function(fileInputName, fileOutputName) {
  if (!fileInputName) {
    throw new Error("fileInputName is not defined!!!");
  }
  if (!fileOutputName) {
    throw new Error("fileOutputName is not defined!!!");
  }
  return jsonToCsvAsync.generateCsvFileFromJsonFile(fileInputName, fileOutputName);
};

/**
 * Read JSON file and return converted CSV string (asynchronous)
 * @param {string} fileInputName - Path to input JSON file
 * @returns {Promise<string>} Promise resolving to CSV formatted string
 * @throws {FileOperationError} If file read fails
 * @throws {JsonValidationError} If JSON is invalid
 * @category 2-Core API
 * @example
 * const converter = require('convert-csv-to-json');
 * const csv = await converter.getCsvFromJsonAsync('data.json');
 * console.log(csv);
 */
exports.getCsvFromJsonAsync = function(fileInputName) {
  if (!fileInputName) {
    throw new Error("fileInputName is not defined!!!");
  }
  return jsonToCsvAsync.getCsvFromJson(fileInputName);
};

exports.browser = require('./src/browserApi');
