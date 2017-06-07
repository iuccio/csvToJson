'use strict';

let csvToJson = require('./src/csvToJson.js');

exports.jsonToCsv= function(input,output){
    csvToJson.generateJsonFileFromCsv(input, output);

};