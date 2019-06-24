"use strict";

let csvToJson = require("./src/csvToJson.js");

/**
 * Prints a digit as Number type (for example 32 instead of '32')
 */
exports.formatValueByType = function() {
  csvToJson.formatValueByType();
  return this;
};

/**
 * Defines the field delimiter which will be used to split the fields
 */
exports.fieldDelimiter = function(delimiter) {
  csvToJson.fieldDelimiter(delimiter);
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
  return csvStringToJson(csvString);
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
