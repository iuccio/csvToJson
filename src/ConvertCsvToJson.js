'use strict';

var fs = require('fs');

const fieldDelimiter = ';';
const newLine = '\n';

var fileInputName = './input.csv';
var fileOutputName = './output.json';

generateJsonFromCsv();

function generateJsonFromCsv() {
	var parsedCsv = fs.readFileSync(fileInputName).toString();
	var parsedJson = csvToJsonStringfy(parsedCsv);
	writeJsonFile(parsedJson);
}

function csvToJsonStringfy(parsedCsv) {
	var lines = parsedCsv.split(newLine);
	var headers = lines[0].split(fieldDelimiter);

	var jsonResult = [];
	for (var i = 1; i < lines.length; i++) {
		var currentLine = lines[i].split(fieldDelimiter);
		var jsonObject = {};
		for (var j = 0; j < headers.length; j++) {
			var propertyName = trimPropertyName(headers[j]);
			var value = getValueFormatByType(currentLine[j]);
			jsonObject[propertyName] = value;
		}
		jsonResult.push(jsonObject);
	}
	return JSON.stringify(jsonResult, undefined, 1);
}

function writeJsonFile(json) {
	fs.writeFile(fileOutputName, json, function(err) {
		if (err) {
			throw err;
		} else {
			console.log('File saved : ' + fileOutputName);
		}
	});
}

function trimPropertyName(value) {
	return value.replace(/\s/g, '');
}

function getValueFormatByType(value) {
	var isNumber = /^\d+$/.test(value);
	if (isNumber) {
		return Number(value);
	}
	return String(value);
}