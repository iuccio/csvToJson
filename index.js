/*jshint node:true */
/*jshint esversion: 6 */
var csvToJson = require('./src/csvToJson.js')

var fileInputName = './input.csv';
let fileOutputName = './output.json';

csvToJson.generateJsonFileFromCsv(fileInputName, fileOutputName);