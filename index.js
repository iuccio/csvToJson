'use strict';

let csvToJson = require('./src/csvToJson.js');

/**
 * Parse .csv file and put its content into a file in json format.
 * @param {inputFileName} path/filename
 * @param {outputFileName} path/filename
 *
 */
exports.formatValueByType = function () {
  csvToJson.formatValueByType();
  return this;
};

exports.generateJsonFileFromCsv = function (inputFileName, outputFileName) {
    if(!inputFileName){
        throw new Error('inputFileName is not defined!!!');
    }
    if(!outputFileName){
        throw new Error('outpuFileName is not defined!!!');
    }
    csvToJson.generateJsonFileFromCsv(this.inputFileName, this.outputFileName);
};

/**
 * Parse .csv file and put its content into an Array of Object in json format.
 * @param {inputFileName} path/filename
 * @return {Array} Array of Object in json format
 *
 */
exports.getJsonFromCsv = function (inputFileName) {
    if(!inputFileName){
        throw new Error('inputFileName is not defined!!!');
    }
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