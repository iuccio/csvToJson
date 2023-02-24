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

  supportQuotedField(active) {
    this.isSupportQuotedField = active;
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
  	this.validateInputConfig();
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
        let currentLine;
        if(this.isSupportQuotedField){
            currentLine = this.split(lines[i]);
        }
        else{
            currentLine = lines[i].split(fieldDelimiter);
        }
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

  validateInputConfig(){
  	if(this.isSupportQuotedField) {
  	 	if(this.getFieldDelimiter() === '"'){
  	 		throw new Error('When SupportQuotedFields is enabled you cannot defined the field delimiter as quote -> ["]');
  	 	}
  	 	if(this.parseSubArraySeparator === '"'){
  	 		throw new Error('When SupportQuotedFields is enabled you cannot defined the field parseSubArraySeparator as quote -> ["]');
  	 	}
  	 	if(this.parseSubArrayDelimiter === '"'){
  	 		throw new Error('When SupportQuotedFields is enabled you cannot defined the field parseSubArrayDelimiter as quote -> ["]');
  	 	}
  	}
  }

  hasQuotes(line) {
    return line.includes('"');
  }

  split(line) {
    if(line.length == 0){
      return [];
    }
    let delim = this.getFieldDelimiter();
    let subSplits = [''];
    if (this.hasQuotes(line)) {
        let chars = line.split('');

        let subIndex = 0;
        let startQuote = false;
        let isDouble = false;
        chars.forEach((c, i, arr) => {
            if (isDouble) { //when run into double just pop it into current and move on
                subSplits[subIndex] += c;
                isDouble = false;
                return;
            }

            if (c != '"' && c != delim ) {
                subSplits[subIndex] += c;
            } else if(c == delim && startQuote){
                subSplits[subIndex] += c;
            } else if( c == delim ){
                subIndex++
                subSplits[subIndex] = '';
                return;
            } else {
                if (arr[i + 1] === '"') {
                    //Double quote
                    isDouble = true;
                    //subSplits[subIndex] += c; //Skip because this is escaped quote
                } else {
                    if (!startQuote) {
                        startQuote = true;
                        //subSplits[subIndex] += c; //Skip because we don't want quotes wrapping value
                    } else {
                        //end
                        startQuote = false;
                        //subSplits[subIndex] += c; //Skip because we don't want quotes wrapping value
                    }
                }
            }
        });
        if(startQuote){
            throw new Error('Row contains mismatched quotes!');
        }
        return subSplits;
    } else {
        return line.split(delim);
    }
  }
}

module.exports = new CsvToJson();
