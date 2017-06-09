'use strict';

let fileUtils = require('././util/fileUtils');
let stringUtils = require('././util/stringUtils');

const fieldDelimiter = ';';
const newLine = '\n';

class CsvToJson {

    generateJsonFileFromCsv(fileInputName, fileOutputName) {
        let jsonStringified = this.getJsonFromCsvStringified(fileInputName);
        fileUtils.writeFile(jsonStringified, fileOutputName);
    }

    getJsonFromCsvStringified(fileInputName) {
        let json = this.getJsonFromCsv(fileInputName);
        return JSON.stringify(json, undefined, 1);
    }

    getJsonFromCsv(fileInputName) {
        let parsedCsv = fileUtils.readFile(fileInputName);
        return this.csvToJson(parsedCsv);
    }

    csvToJson(parsedCsv) {
        let lines = parsedCsv.split(newLine);
        let headers = lines[0].split(fieldDelimiter);

        let jsonResult = [];
        for (let i = 1; i < lines.length; i++) {
            let currentLine = lines[i].split(fieldDelimiter);
            let jsonObject = {};
            for (let j = 0; j < headers.length; j++) {
                let propertyName = stringUtils.trimPropertyName(headers[j]);
                let value = stringUtils.getValueFormatByType(currentLine[j]);
                jsonObject[propertyName] = value;
            }
            jsonResult.push(jsonObject);
        }
        return jsonResult;
    }

}

module.exports = new CsvToJson();