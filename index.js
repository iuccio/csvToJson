'use strict';

let csvToJson = require('./src/csvToJson.js');

/*
 * Parse .csv file and put its content into a file in json format.
 */
exports.generateJsonFileFromCsv = function (inputFileName, outputFileName) {
    csvToJson.generateJsonFileFromCsv(inputFileName, outputFileName);
};

/*
 * Parse .csv file and put its content into an Array of Object in json format.
 */
exports.getJsonFromCsv = function (inputFileName) {
    return csvToJson.getJsonFromCsv(inputFileName);
};