'use strict';

let csvToJson = require('./src/csvToJson.js');

let fileInputName = './input.csv';
let fileOutputName = './output.json';

csvToJson.generateJsonFileFromCsv(fileInputName, fileOutputName);