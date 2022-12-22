"use strict";

let fileUtils = require("././util/fileUtils");
let stringUtils = require("././util/stringUtils");
let jsonUtils = require("././util/jsonUtils");

const newLine = /\r?\n/;
const defaultFieldDelimiter = ";";

class CsvToJson {

  formatValueByType(active) {
    this.printValueFormatByType = active;
    return this;
  }

  fieldDelimiter(delimiter) {
    this.delimiter = delimiter;
    return this;
  }

  indexHeader(indexHeader) {
    if(isNaN(indexHeader)){
        throw new Error('The index Header must be a Number!');
    }
    this.indexHeader = indexHeader;
    return this;
  }


  parseSubArray(delimiter = '*',separator = ',') {
    this.parseSubArrayDelimiter = delimiter;
    this.parseSubArraySeparator = separator;
  }

  encoding(encoding){
    this.encoding = encoding;
    return this;
  }

  generateJsonFileFromCsv(fileInputName, fileOutputName) {
    let jsonStringified = this.getJsonFromCsvStringified(fileInputName);
    fileUtils.writeFile(jsonStringified, fileOutputName);
  }

  getJsonFromCsvStringified(fileInputName) {
    let json = this.getJsonFromCsv(fileInputName);
    let jsonStringified = JSON.stringify(json, undefined, 1);
    jsonUtils.validateJson(jsonStringified);
    return jsonStringified;
  }

  getJsonFromCsv(fileInputName) {
    let parsedCsv = fileUtils.readFile(fileInputName, this.encoding);
    return this.csvToJson(parsedCsv);
  }

  csvStringToJson(csvString) {
    return this.csvToJson(csvString);
  }

  csvToJson(parsedCsv) {
    let lines = parsedCsv.split(newLine);
    let fieldDelimiter = this.getFieldDelimiter();
    let index = this.getIndexHeader();
    let headers = lines[index].split(fieldDelimiter);

    while(!stringUtils.hasContent(headers) && index <= lines.length){
        index = index + 1;
        headers = lines[index].split(fieldDelimiter);
    }

    let jsonResult = [];
    for (let i = (index + 1); i < lines.length; i++) {
      let currentLine = lines[i].split(fieldDelimiter);
      if (stringUtils.hasContent(currentLine)) {
        jsonResult.push(this.buildJsonResult(headers, currentLine));
      }
    }
    return jsonResult;
  }

  getFieldDelimiter() {
    if (this.delimiter) {
      return this.delimiter;
    }
    return defaultFieldDelimiter;
  }

  getIndexHeader(){
    if(this.indexHeader !== null && !isNaN(this.indexHeader)){
        return this.indexHeader;
    }
    return 0;
  }

  buildJsonResult(headers, currentLine) {
    let jsonObject = {};
    for (let j = 0; j < headers.length; j++) {
      let propertyName = stringUtils.trimPropertyName(headers[j]);
      let value = currentLine[j];

      if(this.isParseSubArray(value)){
        value = this.buildJsonSubArray(value);
      }

      if (this.printValueFormatByType && !Array.isArray(value)) {
        value = stringUtils.getValueFormatByType(currentLine[j]);
      }

      jsonObject[propertyName] = value;
    }
    return jsonObject;
  }

  buildJsonSubArray(value) {
    let extractedValues = value.substring(
        value.indexOf(this.parseSubArrayDelimiter) + 1,
        value.lastIndexOf(this.parseSubArrayDelimiter)
    );
    extractedValues.trim();
    value = extractedValues.split(this.parseSubArraySeparator);
    if(this.printValueFormatByType){
      for(let i=0; i < value.length; i++){
        value[i] = stringUtils.getValueFormatByType(value[i]);
      }
    }
    return value;
  }

  isParseSubArray(value){
    if(this.parseSubArrayDelimiter){
      if (value && (value.indexOf(this.parseSubArrayDelimiter) === 0 && value.lastIndexOf(this.parseSubArrayDelimiter) === (value.length - 1))) {
        return true;
      }
    }
    return false;
  }

}

module.exports = new CsvToJson();
