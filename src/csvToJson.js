/* globals FileOperationError */
"use strict";

const fileUtils = require('./util/fileUtils');
const stringUtils = require('./util/stringUtils');
const jsonUtils = require('./util/jsonUtils');
const {
    ConfigurationError,
    CsvFormatError,
    JsonValidationError
} = require('./util/errors');

const DEFAULT_FIELD_DELIMITER = ",";
const QUOTE_CHAR = '"';
const CRLF = '\r\n';
const LF = '\n';
const CR = '\r';

/**
 * Main CSV to JSON converter class
 * Provides chainable API for configuring and converting CSV data
 * @category 2-Sync 
 */
class CsvToJson {

  /**
   * Enable or disable automatic type formatting for values
   * When enabled, numeric strings are converted to numbers, 'true'/'false' to booleans
   * @param {boolean} active - Whether to format values by type
   * @returns {this} For method chaining
   */
  formatValueByType(active) {
    this.printValueFormatByType = active;
    return this;
  }

  /**
   * Enable or disable support for RFC 4180 quoted fields
   * When enabled, fields wrapped in double quotes can contain delimiters and newlines
   * @param {boolean} active - Whether to support quoted fields
   * @returns {this} For method chaining
   */
  supportQuotedField(active) {
    this.isSupportQuotedField = active;
    return this;
  }

  /**
   * Set the field delimiter character
   * @param {string} delimiter - Character(s) to use as field separator (default: ',')
   * @returns {this} For method chaining
   */
  fieldDelimiter(delimiter) {
    this.delimiter = delimiter;
    return this;
  }

  /**
   * Configure whitespace handling in header field names
   * @param {boolean} active - If true, removes all whitespace from header names; if false, only trims edges
   * @returns {this} For method chaining
   */
  trimHeaderFieldWhiteSpace(active) {
    this.isTrimHeaderFieldWhiteSpace = active;
    return this;
  }

  /**
   * Set the row index where CSV headers are located
   * @param {number} indexHeaderValue - Zero-based row index containing headers
   * @returns {this} For method chaining
   * @throws {ConfigurationError} If not a valid number
   */
  indexHeader(indexHeaderValue) {
    if (isNaN(indexHeaderValue)) {
      throw ConfigurationError.invalidHeaderIndex(indexHeaderValue);
    }
    this.indexHeaderValue = indexHeaderValue;
    return this;
  }


  /**
   * Configure sub-array parsing for special field values
   * Fields bracketed by delimiter and containing separator are parsed into arrays
   * @param {string} delimiter - Bracket character (default: '*')
   * @param {string} separator - Item separator within brackets (default: ',')
   * @returns {this} For method chaining
   * @example
   * // Input: "*val1,val2,val3*"  
   * // Output: ["val1", "val2", "val3"]
   * .parseSubArray('*', ',')
   */
  parseSubArray(delimiter = '*',separator = ',') {
    this.parseSubArrayDelimiter = delimiter;
    this.parseSubArraySeparator = separator;
    return this;
  }

  /**
   * Set file encoding for reading CSV files
   * @param {string} encoding - Node.js supported encoding (e.g., 'utf8', 'latin1', 'ascii')
   * @returns {this} For method chaining
   */
  encoding(encoding){
    this.encoding = encoding;
    return this;
  }

  /**
   * Sets a mapper function to transform each row after conversion
   * @param {function(object, number): (object|null)} mapperFn - Function that receives (row, index) and returns transformed row or null to filter out
   * @returns {this} For method chaining
   */
  mapRows(mapperFn) {
    if (typeof mapperFn !== 'function') {
      throw new TypeError('mapperFn must be a function');
    }
    this.rowMapper = mapperFn;
    return this;
  }

  /**
   * Read a CSV file and write the parsed JSON to an output file
   * @param {string} fileInputName - Path to input CSV file
   * @param {string} fileOutputName - Path to output JSON file
   * @throws {FileOperationError} If file read or write fails
   * @throws {CsvFormatError} If CSV is malformed
   */
  generateJsonFileFromCsv(fileInputName, fileOutputName) {
    let jsonStringified = this.getJsonFromCsvStringified(fileInputName);
    fileUtils.writeFile(jsonStringified, fileOutputName);
  }

  /**
   * Read a CSV file and return parsed data as stringified JSON
   * @param {string} fileInputName - Path to input CSV file
   * @returns {string} JSON stringified array of objects
   * @throws {FileOperationError} If file read fails
   * @throws {CsvFormatError} If CSV is malformed
   * @throws {JsonValidationError} If JSON generation fails
   * @example
   * const csvToJson = require('convert-csv-to-json');
   * const jsonString = csvToJson.getJsonFromCsvStringified('resource/input.csv');
   * console.log(jsonString);
   */
  getJsonFromCsvStringified(fileInputName) {
    let json = this.getJsonFromCsv(fileInputName);
    let jsonStringified = JSON.stringify(json, undefined, 1);
    jsonUtils.validateJson(jsonStringified);
    return jsonStringified;
  }

  /**
   * Read a CSV file and return parsed data as JSON array of objects
   * @param {string} fileInputName - Path to input CSV file
   * @returns {Array<object>} Array of objects representing CSV rows
   * @throws {FileOperationError} If file read fails
   * @throws {CsvFormatError} If CSV is malformed
   * @example
   * const csvToJson = require('convert-csv-to-json');
   * const rows = csvToJson.getJsonFromCsv('resource/input.csv');
   * console.log(rows);
   */
  getJsonFromCsv(fileInputName) {
    let parsedCsv = fileUtils.readFile(fileInputName, this.encoding);
    return this.csvToJson(parsedCsv);
  }

  /**
   * Parse CSV string content and return as JSON array of objects
   * @param {string} csvString - CSV content as string
   * @returns {Array<object>} Array of objects representing CSV rows
   * @throws {CsvFormatError} If CSV is malformed
   * @example
   * const csvToJson = require('convert-csv-to-json');
   * const rows = csvToJson.csvStringToJson('name,age\nAlice,30');
   * console.log(rows); // [{ name: 'Alice', age: '30' }]
   */
  csvStringToJson(csvString) {
    return this.csvToJson(csvString);
  }

  /**
   * Parse CSV string content and return as stringified JSON
   * @param {string} csvString - CSV content as string
   * @returns {string} JSON stringified array of objects
   * @throws {CsvFormatError} If CSV is malformed
   * @throws {JsonValidationError} If JSON generation fails
   * @example
   * const csvToJson = require('convert-csv-to-json');
   * const jsonString = csvToJson.csvStringToJsonStringified('name,age\nAlice,30');
   * console.log(jsonString);
   */
  csvStringToJsonStringified(csvString) {
    let json = this.csvStringToJson(csvString);
    let jsonStringified = JSON.stringify(json, undefined, 1);
    jsonUtils.validateJson(jsonStringified);
    return jsonStringified;
  }

  /**
   * Core CSV parsing logic - converts CSV string to JSON array
   * Handles quoted fields per RFC 4180 when configured
   * Applies row mapping and filtering when configured
   * @param {string} parsedCsv - Raw CSV content as string
   * @returns {Array<object>} Array of objects with CSV data
   * @private
   */
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
      throw CsvFormatError.missingHeader();
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
            let row = this.buildJsonResult(headers, currentLine);
            
            // Apply row mapper if defined
            if (this.rowMapper) {
              row = this.rowMapper(row, i - (index + 1)); // Pass row and 0-based row index
              // If mapper returns null/undefined, skip this row (allows filtering)
              if (row != null) {
                jsonResult.push(row);
              }
            } else {
              jsonResult.push(row);
            }
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
      throw CsvFormatError.mismatchedQuotes('CSV');
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

  /**
   * Get the configured field delimiter, or default if not set
   * @returns {string} Field delimiter character
   * @private
   */
  getFieldDelimiter() {
    if (this.delimiter) {
      return this.delimiter;
    }
    return DEFAULT_FIELD_DELIMITER;
  }

  /**
   * Get the configured header row index, or default (0) if not set
   * @returns {number} Header row index
   * @private
   */
  getIndexHeader(){
    if(this.indexHeaderValue !== null && !isNaN(this.indexHeaderValue)){
        return this.indexHeaderValue;
    }
    return 0;
  }

  /**
   * Build a JSON object from headers and field values
   * Applies type formatting and sub-array parsing as configured
   * @param {string[]} headers - Array of header field names
   * @param {string[]} currentLine - Array of field values
   * @returns {object} JSON object with header names as keys
   * @private
   */
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

  /**
   * Parse a field value into a sub-array using configured delimiter and separator
   * @param {string} value - Field value to parse
   * @returns {Array<string|number|boolean>} Array of parsed values
   * @private
   */
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

  /**
   * Check if a field value should be parsed as a sub-array
   * @param {string} value - Field value to check
   * @returns {boolean} True if value is bracketed with sub-array delimiter
   * @private
   */
  isParseSubArray(value){
    if(this.parseSubArrayDelimiter){
      if (value && (value.indexOf(this.parseSubArrayDelimiter) === 0 && value.lastIndexOf(this.parseSubArrayDelimiter) === (value.length - 1))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Validate configuration for conflicts and incompatibilities
   * @throws {ConfigurationError} If incompatible options are set
   * @private
   */
  validateInputConfig(){
    if(this.isSupportQuotedField) {
      if(this.getFieldDelimiter() === '"'){
        throw ConfigurationError.quotedFieldConflict('fieldDelimiter', '"');
      }
      if(this.parseSubArraySeparator === '"'){
        throw ConfigurationError.quotedFieldConflict('parseSubArraySeparator', '"');
      }
      if(this.parseSubArrayDelimiter === '"'){
        throw ConfigurationError.quotedFieldConflict('parseSubArrayDelimiter', '"');
      }
    }
  }

  /**
   * Check if a line contains quote characters
   * @param {string} line - Line to check
   * @returns {boolean} True if line contains quotes
   * @private
   */
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
      throw CsvFormatError.mismatchedQuotes('row');
    }
    
    return fields;
  }

  /**
   * Check if character at index is an escaped quote (double quote)
   * Escaped quotes appear as "" within quoted fields per RFC 4180
   * @param {string} line - Line being parsed
   * @param {number} index - Character index to check
   * @param {boolean} insideQuoted - Whether currently inside a quoted field
   * @returns {boolean} True if character is an escaped quote
   * @private
   */
  isEscapedQuote(line, index, insideQuoted) {
    return insideQuoted && 
           index + 1 < line.length && 
           line[index + 1] === QUOTE_CHAR;
  }

  /**
   * Check if this is an empty quoted field: "" before delimiter or end of line
   * @param {string} line - Line being parsed
   * @param {number} index - Character index to check
   * @param {boolean} insideQuoted - Whether currently inside a quoted field
   * @param {string} currentField - Current field accumulation
   * @param {string} delimiter - Field delimiter character
   * @returns {boolean} True if this represents an empty quoted field
   * @private
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
