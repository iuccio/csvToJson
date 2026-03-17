"use strict";

let fileUtils = require("././util/fileUtils");
let stringUtils = require("././util/stringUtils");
let jsonUtils = require("././util/jsonUtils");

const newLine = /\r?\n/;
const defaultFieldDelimiter = ",";
const QUOTE_CHAR = '"';
const CRLF = '\r\n';
const LF = '\n';
const CR = '\r';

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

  trimHeaderFieldWhiteSpace(active) {
    this.isTrimHeaderFieldWhiteSpace = active;
    return this;
  }

  indexHeader(indexHeaderValue) {
    if(isNaN(indexHeaderValue)){
        throw new Error('The index Header must be a Number!');
    }
    this.indexHeaderValue = indexHeaderValue;
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

  csvStringToJsonStringified(csvString) {
    let json = this.csvStringToJson(csvString);
    let jsonStringified = JSON.stringify(json, undefined, 1);
    jsonUtils.validateJson(jsonStringified);
    return jsonStringified;
  }

  csvToJson(parsedCsv) {
  	this.validateInputConfig();
    
    // Parse CSV into individual records, respecting quoted fields that may contain newlines
    let records = this.parseRecords(parsedCsv);
    
    let fieldDelimiter = this.getFieldDelimiter();
    let index = this.getIndexHeader();
    let headers;
    
    // Find the header row
    while (index < records.length) {
      if (this.isSupportQuotedField) {
        headers = this.split(records[index]);
      } else {
        headers = records[index].split(fieldDelimiter);
      }
      
      if (stringUtils.hasContent(headers)) {
        break;
      }
      index++;
    }
    
    if (!headers) {
      throw new Error('No header row found in CSV');
    }

    let jsonResult = [];
    for (let i = (index + 1); i < records.length; i++) {
        let currentLine;
        if (this.isSupportQuotedField) {
            currentLine = this.split(records[i]);
        } else {
            currentLine = records[i].split(fieldDelimiter);
        }
        
        if (stringUtils.hasContent(currentLine)) {
            jsonResult.push(this.buildJsonResult(headers, currentLine));
        }
    }
    return jsonResult;
  }

  /**
   * Parse CSV content into individual records, respecting quoted fields that may span multiple lines.
   * RFC 4180 compliant parsing - handles quoted fields that may contain newlines.
   * @param {string} csvContent - The raw CSV content
   * @returns {string[]} Array of record strings
   */
  parseRecords(csvContent) {
    let records = [];
    let currentRecord = '';
    let insideQuotes = false;
    let i = 0;
    
    while (i < csvContent.length) {
      let char = csvContent[i];
      
      // Handle quote characters
      if (char === QUOTE_CHAR) {
        if (insideQuotes && i + 1 < csvContent.length && csvContent[i + 1] === QUOTE_CHAR) {
          // Escaped quote: two consecutive quotes = single quote representation
          currentRecord += QUOTE_CHAR + QUOTE_CHAR;
          i += 2;
        } else {
          // Toggle quote state
          insideQuotes = !insideQuotes;
          currentRecord += char;
          i++;
        }
        continue;
      }
      
      // Handle line endings (only outside quoted fields)
      if (!insideQuotes) {
        let lineEndingLength = this.getLineEndingLength(csvContent, i);
        if (lineEndingLength > 0) {
          records.push(currentRecord);
          currentRecord = '';
          i += lineEndingLength;
          continue;
        }
      }
      
      // Regular character
      currentRecord += char;
      i++;
    }
    
    // Add the last record if not empty
    if (currentRecord.length > 0) {
      records.push(currentRecord);
    }
    
    // Validate matching quotes
    if (insideQuotes) {
      throw new Error('CSV contains mismatched quotes!');
    }
    
    return records;
  }

  /**
   * Get the length of line ending at current position (CRLF=2, LF=1, CR=1, or 0)
   * @param {string} content - CSV content
   * @param {number} index - Current index to check
   * @returns {number} Length of line ending (0 if none)
   */
  getLineEndingLength(content, index) {
    if (content.slice(index, index + 2) === CRLF) {
      return 2;
    }
    if (content[index] === LF) {
      return 1;
    }
    if (content[index] === CR && content[index + 1] !== LF) {
      return 1;
    }
    return 0;
  }

  getFieldDelimiter() {
    if (this.delimiter) {
      return this.delimiter;
    }
    return defaultFieldDelimiter;
  }

  getIndexHeader(){
    if(this.indexHeaderValue !== null && !isNaN(this.indexHeaderValue)){
        return this.indexHeaderValue;
    }
    return 0;
  }

  buildJsonResult(headers, currentLine) {
    let jsonObject = {};
    for (let j = 0; j < headers.length; j++) {
      let propertyName = stringUtils.trimPropertyName(this.isTrimHeaderFieldWhiteSpace, headers[j]);
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

  /**
   * Split a CSV record line into fields, respecting quoted fields per RFC 4180.
   * Handles:
   * - Quoted fields with embedded delimiters and newlines
   * - Escaped quotes (double quotes within quoted fields)
   * - Empty quoted fields
   * @param {string} line - A single CSV record line
   * @returns {string[]} Array of field values
   */
  split(line) {
    if (line.length === 0) {
      return [];
    }
    
    let fields = [];
    let currentField = '';
    let insideQuotes = false;
    let delimiter = this.getFieldDelimiter();
    
    for (let i = 0; i < line.length; i++) {
      let char = line[i];
      
      // Handle quote character
      if (char === QUOTE_CHAR) {
        if (this.isEscapedQuote(line, i, insideQuotes)) {
          // Two consecutive quotes inside quoted field = escaped quote
          currentField += QUOTE_CHAR;
          i++; // Skip next quote
        } else if (this.isEmptyQuotedField(line, i, insideQuotes, currentField, delimiter)) {
          // Empty quoted field: "" at field start before delimiter/end
          i++; // Skip closing quote
        } else {
          // Regular quote: toggle quoted state
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        // Delimiter outside quotes marks field boundary
        fields.push(currentField);
        currentField = '';
      } else {
        // Regular character (including embedded newlines in quoted fields)
        currentField += char;
      }
    }
    
    // Add final field
    fields.push(currentField);
    
    // Validate matching quotes
    if (insideQuotes) {
      throw new Error('Row contains mismatched quotes!');
    }
    
    return fields;
  }

  /**
   * Check if character at index is an escaped quote (double quote)
   * @returns {boolean}
   */
  isEscapedQuote(line, index, insideQuoted) {
    return insideQuoted && 
           index + 1 < line.length && 
           line[index + 1] === QUOTE_CHAR;
  }

  /**
   * Check if this is an empty quoted field: "" before delimiter or end of line
   * @returns {boolean}
   */
  isEmptyQuotedField(line, index, insideQuoted, currentField, delimiter) {
    if (insideQuoted || currentField !== '' || index + 1 >= line.length) {
      return false;
    }
    
    let nextChar = line[index + 1];
    if (nextChar !== QUOTE_CHAR) {
      return false; // Not a quote pair
    }
    
    let afterQuotes = index + 2;
    return afterQuotes === line.length || line[afterQuotes] === delimiter;
  }
}

module.exports = new CsvToJson();
