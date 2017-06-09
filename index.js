'use strict';

/**
 * Parse .csv file and put its content into a file in json format.
 * @param {inputFileName} path/filename
 * @param {outputFileName} path/filename
 *
 */
let csvToJson = require('./src/csvToJson.js');
exports.generateJsonFileFromCsv = function (inputFileName, outputFileName) {
    csvToJson.generateJsonFileFromCsv(inputFileName, outputFileName);
};

/**
 * Parse .csv file and put its content into an Array of Object in json format.
 * @param {inputFileName} path/filename
 * @return {Array} Array of Object in json format
 *
 */
exports.getJsonFromCsv = function (inputFileName) {
    return csvToJson.getJsonFromCsv(inputFileName);
};

/**
 * Parse .csv file and put its content into a file in json format.
 * @param {inputFileName} path/filename
 * @param {outputFileName} path/filename
 *
 * @deprecated Use generateJsonFileFromCsv()
 */
exports.jsonToCsv = function (inputFileName, outputFileName) {
    csvToJson.generateJsonFileFromCsv(inputFileName, outputFileName);
};