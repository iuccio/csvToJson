/*jshint node:true */
/*jshint esversion: 6 */
let fs = require('fs');

const fieldDelimiter = ';';
const newLine = '\n';

let fileInputName = './input.csv';
let fileOutputName = './output.json';

generateJsonFromCsv();

function generateJsonFromCsv() {
	let parsedCsv = fs.readFileSync(fileInputName).toString();
	let parsedJson = csvToJsonStringfy(parsedCsv);
	writeJsonFile(parsedJson);
}

function csvToJsonStringfy(parsedCsv) {
	let lines = parsedCsv.split(newLine);
	let headers = lines[0].split(fieldDelimiter);

	let jsonResult = [];
	for (let i = 1; i < lines.length; i++) {
		let currentLine = lines[i].split(fieldDelimiter);
		let jsonObject = {};
		for (let j = 0; j < headers.length; j++) {
			let propertyName = trimPropertyName(headers[j]);
			let value = getValueFormatByType(currentLine[j]);
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
	let isNumber = /^\d+$/.test(value);
	if (isNumber) {
		return Number(value);
	}
	return String(value);
}