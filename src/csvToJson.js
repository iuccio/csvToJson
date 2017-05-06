/*jshint node:true */
/*jshint esversion: 6 */
let fileUtils = require('././util/fileUtils');
let stringUtils = require('././util/stringUtils')

const fieldDelimiter = ';';
const newLine = '\n';

class CsvToJson{

	generateJsonFileFromCsv(fileInputName, fileOutputName) {
		let parsedJson = this.getJsonFromCsv(fileInputName);
		fileUtils.writeJsonFile(parsedJson,fileOutputName);
	}
	
	getJsonFromCsv(fileInputName){
		let parsedCsv = fileUtils.readFile(fileInputName);
		return this.csvToJsonStringfy(parsedCsv)
	}

	csvToJsonStringfy(parsedCsv) {
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
	return JSON.stringify(jsonResult, undefined, 1);
	}
}

module.exports = new CsvToJson();