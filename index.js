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
 * Prints a digit as Number type (for example 32 instead of '32')
 */
exports.formatValueByType = function (active = true) {
  csvToJson.formatValueByType(active);
  return this;
};

/**
 * If enabled, allows fields wrapped by quotation marks to be parsed correctly and not splitted 
 */
exports.supportQuotedField = function (active = false) {
  csvToJson.supportQuotedField(active);
  return this;
};
/**
 * Defines the field delimiter which will be used to split the fields
 */
exports.fieldDelimiter = function (delimiter) {
  csvToJson.fieldDelimiter(delimiter);
  return this;
};

/**
 * If active the content of the Header Fields is trimmed including the white spaces, e.g. "My Name" -> "MyName"
 */
exports.trimHeaderFieldWhiteSpace = function (active = false) {
  csvToJson.trimHeaderFieldWhiteSpace(active);
  return this;
};

/**
 * Defines the index where the header is defined
 */
exports.indexHeader = function (index) {
  csvToJson.indexHeader(index);
  return this;
};

/**
 * Defines how to match and parse a sub array
 */
exports.parseSubArray = function (delimiter, separator) {
  csvToJson.parseSubArray(delimiter, separator);
  return this;
};

/**
 * Defines a custom encoding to decode a file
 */
exports.customEncoding = function (encoding) {
  csvToJson.encoding = encoding;
  return this;
};

/**
 * Defines a custom encoding to decode a file
 */
exports.utf8Encoding = function utf8Encoding() {
  csvToJson.encoding = encodingOps.utf8;
  return this;
};

/**
 * Defines ucs2 encoding to decode a file
 */
exports.ucs2Encoding = function () {
  csvToJson.encoding = encodingOps.ucs2;
  return this;
};

/**
 * Defines utf16le encoding to decode a file
 */
exports.utf16leEncoding = function () {
  csvToJson.encoding = encodingOps.utf16le;
  return this;
};

/**
 * Defines latin1 encoding to decode a file
 */
exports.latin1Encoding = function () {
  csvToJson.encoding = encodingOps.latin1;
  return this;
};

/**
 * Defines ascii encoding to decode a file
 */
exports.asciiEncoding = function () {
  csvToJson.encoding = encodingOps.ascii;
  return this;
};

/**
 * Defines base64 encoding to decode a file
 */
exports.base64Encoding = function () {
  this.csvToJson = encodingOps.base64;
  return this;
};

/**
 * Defines hex encoding to decode a file
 */
exports.hexEncoding = function () {
  this.csvToJson = encodingOps.hex;
  return this;
};

/**
 * Parses .csv file and put its content into a file in json format.
 * @param {inputFileName} path/filename
 * @param {outputFileName} path/filename
 *
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
 * Parses .csv file and put its content into an Array of Object in json format.
 * @param {inputFileName} path/filename
 * @return {Array} Array of Object in json format
 *
 */
exports.getJsonFromCsv = function(inputFileName) {
  if (!inputFileName) {
    throw new Error("inputFileName is not defined!!!");
  }
  return csvToJson.getJsonFromCsv(inputFileName);
};

exports.csvStringToJson = function(csvString) {
  return csvToJson.csvStringToJson(csvString);
};

/**
 * Parses a csv string and returns a JSON string (validated)
 * @param {csvString} csvString CSV content as string
 * @return {string} JSON stringified result
 */
exports.csvStringToJsonStringified = function(csvString) {
  if (csvString === undefined || csvString === null) {
    throw new Error("csvString is not defined!!!");
  }
  return csvToJson.csvStringToJsonStringified(csvString);
};

/**
 * Parses .csv file and put its content into a file in json format.
 * @param {inputFileName} path/filename
 * @param {outputFileName} path/filename
 *
 * @deprecated Use generateJsonFileFromCsv()
 */
exports.jsonToCsv = function(inputFileName, outputFileName) {
  csvToJson.generateJsonFileFromCsv(inputFileName, outputFileName);
};
