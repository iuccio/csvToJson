(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.csvToJson = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
/* globals CsvFormatError */

"use strict";

const csvToJson = require('./csvToJson');
const { InputValidationError, BrowserApiError } = require('./util/errors');

/**
 * Browser-friendly CSV to JSON API
 * Provides methods for parsing CSV strings and File/Blob objects in browser environments
 * Proxies configuration to sync csvToJson instance
 * @category 4-Browser
 */
class BrowserApi {
  /**
   * Constructor initializes proxy to sync csvToJson instance
   */
  constructor() {
    // reuse the existing csvToJson instance for parsing and configuration
    this.csvToJson = csvToJson;
  }

  /**
   * Enable or disable automatic type formatting for values
   * @param {boolean} active - Whether to format values by type (default: true)
   * @returns {this} For method chaining
   */
  formatValueByType(active = true) {
    this.csvToJson.formatValueByType(active);
    return this;
  }

  /**
   * Enable or disable support for RFC 4180 quoted fields
   * @param {boolean} active - Whether to support quoted fields (default: false)
   * @returns {this} For method chaining
   */
  supportQuotedField(active = false) {
    this.csvToJson.supportQuotedField(active);
    return this;
  }

  /**
   * Set the field delimiter character
   * @param {string} delimiter - Character(s) to use as field separator
   * @returns {this} For method chaining
   */
  fieldDelimiter(delimiter) {
    this.csvToJson.fieldDelimiter(delimiter);
    return this;
  }

  /**
   * Configure whitespace handling in header field names
   * @param {boolean} active - If true, removes all whitespace; if false, only trims edges (default: false)
   * @returns {this} For method chaining
   */
  trimHeaderFieldWhiteSpace(active = false) {
    this.csvToJson.trimHeaderFieldWhiteSpace(active);
    return this;
  }

  /**
   * Set the row index where CSV headers are located
   * @param {number} index - Zero-based row index containing headers
   * @returns {this} For method chaining
   */
  indexHeader(index) {
    this.csvToJson.indexHeader(index);
    return this;
  }

  /**
   * Configure sub-array parsing for special field values
   * @param {string} delimiter - Bracket character (default: '*')
   * @param {string} separator - Item separator within brackets (default: ',')
   * @returns {this} For method chaining
   */
  parseSubArray(delimiter = '*', separator = ',') {
    this.csvToJson.parseSubArray(delimiter, separator);
    return this;
  }

  /**
   * Set a mapper function to transform each row after conversion
   * @param {function(object, number): (object|null)} mapperFn - Function receiving (row, index) that returns transformed row or null to filter
   * @returns {this} For method chaining
   */
  mapRows(mapperFn) {
    this.csvToJson.mapRows(mapperFn);
    return this;
  }

  /**
   * Parse a CSV string and return as JSON array of objects
   * @param {string} csvString - CSV content as string
   * @returns {Array<object>} Array of objects representing CSV rows
   * @throws {InputValidationError} If csvString is invalid
   * @throws {CsvFormatError} If CSV is malformed
   * @example
   * const csvToJson = require('convert-csv-to-json');
   * const rows = csvToJson.browser.csvStringToJson('name,age\nAlice,30');
   * console.log(rows); // [{ name: 'Alice', age: '30' }]
   */
  csvStringToJson(csvString) {
    if (csvString === undefined || csvString === null) {
      throw new InputValidationError(
        'csvString',
        'string',
        `${typeof csvString}`,
        'Provide valid CSV content as a string to parse.'
      );
    }
    return this.csvToJson.csvToJson(csvString);
  }

  /**
   * Parse a CSV string and return as stringified JSON
   * @param {string} csvString - CSV content as string
   * @returns {string} JSON stringified array of objects
   * @throws {InputValidationError} If csvString is invalid
   * @throws {CsvFormatError} If CSV is malformed
   * @example
   * const csvToJson = require('convert-csv-to-json');
   * const jsonString = csvToJson.browser.csvStringToJsonStringified('name,age\nAlice,30');
   * console.log(jsonString);
   */
  csvStringToJsonStringified(csvString) {
    if (csvString === undefined || csvString === null) {
      throw new InputValidationError(
        'csvString',
        'string',
        `${typeof csvString}`,
        'Provide valid CSV content as a string to parse.'
      );
    }
    return this.csvToJson.csvStringToJsonStringified(csvString);
  }

  /**
   * Parse a CSV string asynchronously (returns resolved Promise)
   * @param {string} csvString - CSV content as string
   * @returns {Promise<Array<object>>} Promise resolving to array of objects
   * @throws {InputValidationError} If csvString is invalid
   * @throws {CsvFormatError} If CSV is malformed
   * @example
   * const csvToJson = require('convert-csv-to-json');
   * const rows = await csvToJson.browser.csvStringToJsonAsync('name,age\nAlice,30');
   * console.log(rows);
   */
  csvStringToJsonAsync(csvString) {
    return Promise.resolve(this.csvStringToJson(csvString));
  }

  /**
   * Parse a CSV string asynchronously and return as stringified JSON
   * @param {string} csvString - CSV content as string
   * @returns {Promise<string>} Promise resolving to JSON stringified array
   * @throws {InputValidationError} If csvString is invalid
   * @throws {CsvFormatError} If CSV is malformed
   * @example
   * const csvToJson = require('convert-csv-to-json');
   * const json = await csvToJson.browser.csvStringToJsonStringifiedAsync('name,age\nAlice,30');
   * console.log(json);
   */
  csvStringToJsonStringifiedAsync(csvString) {
    return Promise.resolve(this.csvStringToJsonStringified(csvString));
  }

  /**
   * Parse a browser File or Blob object to JSON array.
   * @param {File|Blob} file - File or Blob to read as text
   * @param {object} [options] - options: { encoding?: string }
   * @returns {Promise<object[]>} Promise resolving to parsed JSON rows
   * @example
   * const csvToJson = require('convert-csv-to-json');
   * const fileInput = document.querySelector('#csvfile').files[0];
   * const rows = await csvToJson.browser.parseFile(fileInput);
   * console.log(rows);
   */
  parseFile(file, options = {}) {
    if (!file) {
      return Promise.reject(new InputValidationError(
        'file',
        'File or Blob object',
        `${typeof file}`,
        'Provide a valid File or Blob object to parse.'
      ));
    }

    return new Promise((resolve, reject) => {
      if (typeof FileReader === 'undefined') {
        reject(BrowserApiError.fileReaderNotAvailable());
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(BrowserApiError.parseFileError(
        reader.error || new Error('Unknown file reading error')
      ));
      reader.onload = () => {
        try {
          const text = reader.result;
          const result = this.csvToJson.csvToJson(String(text));
          resolve(result);
        } catch (err) {
          reject(BrowserApiError.parseFileError(err));
        }
      };

      // If encoding is provided, pass it to readAsText
      if (options.encoding) {
        reader.readAsText(file, options.encoding);
      } else {
        reader.readAsText(file);
      }
    });
  }
}

module.exports = new BrowserApi();

},{"./csvToJson":3,"./util/errors":4}],3:[function(require,module,exports){
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

},{"./util/errors":4,"./util/fileUtils":5,"./util/jsonUtils":6,"./util/stringUtils":7}],4:[function(require,module,exports){
'use strict';

/**
 * Custom error classes following clean code principles
 * Provides clear, actionable error messages with context
 * @category Error Classes
 */

/**
 * Base class for all CSV parsing errors
 * Provides consistent error formatting and context
 * @category Error Classes
 */
class CsvParsingError extends Error {
    /**
     * Create a CSV parsing error
     * @param {string} message - Error message
     * @param {string} code - Error code for identification
     * @param {object} context - Additional context information (default: {})
     */
    constructor(message, code, context = {}) {
        super(message);
        this.name = 'CsvParsingError';
        this.code = code;
        this.context = context;
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Convert error to formatted string with context information
     * @returns {string} Formatted error message including context
     */
    toString() {
        let output = `${this.name}: ${this.message}`;
        
        if (this.context && Object.keys(this.context).length > 0) {
            output += '\n\nContext:';
            Object.entries(this.context).forEach(([key, value]) => {
                output += `\n  ${key}: ${this.formatValue(value)}`;
            });
        }
        
        return output;
    }

    /**
     * Format a context value for display in error message
     * @param {unknown} value - Value to format
     * @returns {string} Formatted value string
     * @private
     */
    formatValue(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'string') return `"${value}"`;
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }
}

/**
 * Input validation errors
 * Thrown when function parameters don't meet expected type or value requirements
 * @category Error Classes
 */
class InputValidationError extends CsvParsingError {
    /**
     * Create an input validation error
     * @param {string} paramName - Name of the invalid parameter
     * @param {string} expectedType - Expected type description
     * @param {string} receivedType - Actual type received
     * @param {string} details - Additional error details (optional)
     */
    constructor(paramName, expectedType, receivedType, details = '') {
        const message = 
            `Invalid input: Parameter '${paramName}' is required.\n` +
            `Expected: ${expectedType}\n` +
            `Received: ${receivedType}${details ? '\n' + details : ''}`;
        
        super(message, 'INPUT_VALIDATION_ERROR', {
            parameter: paramName,
            expectedType,
            receivedType
        });
        this.name = 'InputValidationError';
    }
}

/**
 * Configuration-related errors
 * Thrown when configuration options conflict or are invalid
 * @category Error Classes
 */
class ConfigurationError extends CsvParsingError {
    /**
     * Create a configuration error
     * @param {string} message - Error message
     * @param {object} conflictingOptions - Configuration options in conflict (optional)
     */
    constructor(message, conflictingOptions = {}) {
        super(message, 'CONFIGURATION_ERROR', conflictingOptions);
        this.name = 'ConfigurationError';
    }

    /**
     * Create error for quoted field configuration conflict
     * Occurs when quote character is used as delimiter while quoted fields are enabled
     * @param {string} optionName - Name of the conflicting option
     * @param {string} value - Value that causes the conflict
     * @returns {ConfigurationError} Configured error instance
     * @static
     */
    static quotedFieldConflict(optionName, value) {
        return new ConfigurationError(
            `Configuration conflict: supportQuotedField() is enabled, but ${optionName} is set to '${value}'.\n` +
            `The quote character (") cannot be used as a field delimiter, separator, or sub-array delimiter when quoted field support is active.\n\n` +
            `Solutions:\n` +
            `  1. Use a different character for ${optionName} (e.g., '|', '\\t', ';')\n` +
            `  2. Disable supportQuotedField() if your CSV doesn't contain quoted fields\n` +
            `  3. Refer to RFC 4180 for proper CSV formatting: https://tools.ietf.org/html/rfc4180`,
            { optionName, value, conflictingOption: 'supportQuotedField' }
        );
    }

    /**
     * Create error for invalid header index
     * Occurs when indexHeader() receives non-numeric value
     * @param {unknown} value - Invalid header index value
     * @returns {ConfigurationError} Configured error instance
     * @static
     */
    static invalidHeaderIndex(value) {
        return new ConfigurationError(
            `Invalid configuration: indexHeader() expects a numeric value.\n` +
            `Received: ${typeof value} (${value})\n\n` +
            `Solutions:\n` +
            `  1. Ensure indexHeader() receives a number: indexHeader(0), indexHeader(1), etc.\n` +
            `  2. Headers are typically found on row 0 (first line)\n` +
            `  3. Use indexHeader(2) if headers are on the 3rd line`,
            { parameterName: 'indexHeader', value, type: typeof value }
        );
    }
}

/**
 * CSV parsing errors with detailed context
 * Thrown when CSV format is invalid or malformed
 * @category Error Classes
 */
class CsvFormatError extends CsvParsingError {
    /**
     * Create a CSV format error
     * @param {string} message - Error message
     * @param {object} context - Additional context information (optional)
     */
    constructor(message, context = {}) {
        super(message, 'CSV_FORMAT_ERROR', context);
        this.name = 'CsvFormatError';
    }

    /**
     * Create error for missing CSV header row
     * Occurs when no valid header row is found in CSV
     * @returns {CsvFormatError} Configured error instance
     * @static
     */
    static missingHeader() {
        return new CsvFormatError(
            `CSV parsing error: No header row found.\n` +
            `The CSV file appears to be empty or has no valid header line.\n\n` +
            `Solutions:\n` +
            `  1. Ensure your CSV file contains at least one row (header row)\n` +
            `  2. Verify the file is not empty or contains only whitespace\n` +
            `  3. Check if you need to use indexHeader(n) to specify a non-standard header row\n` +
            `  4. Refer to RFC 4180 for proper CSV format: https://tools.ietf.org/html/rfc4180`
        );
    }

    /**
     * Create error for mismatched quotes in CSV
     * Occurs when quoted fields are not properly closed
     * @param {string} location - Where the error occurred (default: 'CSV')
     * @returns {CsvFormatError} Configured error instance
     * @static
     */
    static mismatchedQuotes(location = 'CSV') {
        return new CsvFormatError(
            `CSV parsing error: Mismatched quotes detected in ${location}.\n` +
            `A quoted field was not properly closed with a matching quote character.\n\n` +
            `RFC 4180 rules for quoted fields:\n` +
            `  • Fields containing delimiters or quotes MUST be enclosed in double quotes\n` +
            `  • To include a quote within a quoted field, use two consecutive quotes: ""\n` +
            `  • Example: "Smith, John" (name contains comma)\n` +
            `  • Example: "He said ""Hello""" (text contains quotes)\n\n` +
            `Solutions:\n` +
            `  1. Review your CSV for properly paired quote characters\n` +
            `  2. Use double quotes ("") to escape quotes within quoted fields\n` +
            `  3. Ensure all commas within field values are inside quotes\n` +
            `  4. Enable supportQuotedField(true) if you're using quoted fields`,
            { location }
        );
    }
}

/**
 * File operation errors
 * Thrown when file read or write operations fail
 * @category Error Classes
 */
class FileOperationError extends CsvParsingError {
    /**
     * Create a file operation error
     * @param {string} operation - Type of operation that failed (e.g., 'read', 'write')
     * @param {string} filePath - Path to the file where operation failed
     * @param {Error} originalError - The underlying error object from Node.js
     */
    constructor(operation, filePath, originalError) {
        const message = 
            `File operation error: Failed to ${operation} file.\n` +
            `File path: ${filePath}\n` +
            `Reason: ${originalError.message}\n\n` +
            `Solutions:\n` +
            `  1. Verify the file path is correct: ${filePath}\n` +
            `  2. Check file permissions (read access for input, write access for output)\n` +
            `  3. Ensure the directory exists and is writable for output files\n` +
            `  4. Verify the file is not in use by another process`;
        
        super(message, 'FILE_OPERATION_ERROR', {
            operation,
            filePath,
            originalError: originalError.message
        });
        this.name = 'FileOperationError';
        this.originalError = originalError;
    }
}

/**
 * JSON validation errors
 * Thrown when parsed CSV data cannot be converted to valid JSON
 * @category Error Classes
 */
class JsonValidationError extends CsvParsingError {
    /**
     * Create a JSON validation error
     * @param {string} csvData - The CSV data that failed validation
     * @param {Error} originalError - The underlying JSON parsing error
     */
    constructor(csvData, originalError) {
        const message = 
            `JSON validation error: The parsed CSV data generated invalid JSON.\n` +
            `This typically indicates malformed field names or values in the CSV.\n` +
            `Original error: ${originalError.message}\n\n` +
            `Solutions:\n` +
            `  1. Check that field names are valid JavaScript identifiers (or will be converted safely)\n` +
            `  2. Review the CSV data for special characters that aren't properly escaped\n` +
            `  3. Enable supportQuotedField(true) for fields containing special characters\n` +
            `  4. Verify that formatValueByType() isn't converting values incorrectly`;
        
        super(message, 'JSON_VALIDATION_ERROR', {
            originalError: originalError.message,
            csvPreview: csvData ? csvData.substring(0, 200) : 'N/A'
        });
        this.name = 'JsonValidationError';
        this.originalError = originalError;
    }
}

/**
 * Browser-specific errors
 * Thrown when browser API operations fail
 * @category Error Classes
 */
class BrowserApiError extends CsvParsingError {
    /**
     * Create a browser API error
     * @param {string} message - Error message
     * @param {object} context - Additional context information (optional)
     */
    constructor(message, context = {}) {
        super(message, 'BROWSER_API_ERROR', context);
        this.name = 'BrowserApiError';
    }

    /**
     * Create error for unavailable FileReader API
     * Occurs when browser doesn't support FileReader
     * @returns {BrowserApiError} Configured error instance
     * @static
     */
    static fileReaderNotAvailable() {
        return new BrowserApiError(
            `Browser compatibility error: FileReader API is not available.\n` +
            `Your browser does not support the FileReader API required for file parsing.\n\n` +
            `Solutions:\n` +
            `  1. Use a modern browser that supports FileReader (Chrome 13+, Firefox 10+, Safari 6+)\n` +
            `  2. Consider using csvStringToJson() or csvStringToJsonAsync() for string-based parsing\n` +
            `  3. Implement a polyfill or alternative file reading method`
        );
    }

    /**
     * Create error for file parsing failure in browser
     * Occurs when file read or CSV parse fails
     * @param {Error} originalError - The underlying error that occurred
     * @returns {BrowserApiError} Configured error instance
     * @static
     */
    static parseFileError(originalError) {
        return new BrowserApiError(
            `Browser file parsing error: Failed to read and parse the file.\n` +
            `Error details: ${originalError.message}\n\n` +
            `Solutions:\n` +
            `  1. Verify the file is a valid CSV file\n` +
            `  2. Check the file encoding (UTF-8 is recommended)\n` +
            `  3. Try a smaller file to isolate the issue\n` +
            `  4. Check browser console for additional error details`,
            { originalError: originalError.message }
        );
    }
}

module.exports = {
    CsvParsingError,
    InputValidationError,
    ConfigurationError,
    CsvFormatError,
    FileOperationError,
    JsonValidationError,
    BrowserApiError
};

},{}],5:[function(require,module,exports){
'use strict';

const fs = require('fs');
const { FileOperationError } = require('./errors');

/**
 * File I/O utilities for reading and writing CSV/JSON files
 * Provides both synchronous and asynchronous file operations
 * @category Utilities
 */
class FileUtils {

    /**
     * Read a file synchronously with specified encoding
     * @param {string} fileInputName - Path to file to read
     * @param {string} encoding - File encoding (e.g., 'utf8', 'latin1')
     * @returns {string} File contents as string
     * @throws {FileOperationError} If file read fails
     */
    readFile(fileInputName, encoding) {
        try {
            return fs.readFileSync(fileInputName, encoding).toString();
        } catch (error) {
            throw new FileOperationError('read', fileInputName, error);
        }
    }

    /**
     * Read a file asynchronously with specified encoding
     * Uses fs.promises when available, falls back to callback-based API
     * @param {string} fileInputName - Path to file to read
     * @param {string} encoding - File encoding (default: 'utf8')
     * @returns {Promise<string>} Promise resolving to file contents
     * @throws {FileOperationError} If file read fails
     */
    readFileAsync(fileInputName, encoding = 'utf8') {
        // Use fs.promises when available for a Promise-based API
        if (fs.promises && typeof fs.promises.readFile === 'function') {
            return fs.promises.readFile(fileInputName, encoding)
                .then(buf => buf.toString())
                .catch(error => {
                    throw new FileOperationError('read', fileInputName, error);
                });
        }
        return new Promise((resolve, reject) => {
            fs.readFile(fileInputName, encoding, (err, data) => {
                if (err) {
                    reject(new FileOperationError('read', fileInputName, err));
                    return;
                }
                resolve(data.toString());
            });
        });
    }

    /**
     * Write content to a file synchronously
     * Logs confirmation message to console on success
     * @param {string} json - Content to write to file
     * @param {string} fileOutputName - Path to output file
     * @throws {FileOperationError} If file write fails
     */
    writeFile(json, fileOutputName) {
        fs.writeFile(fileOutputName, json, function (err) {
            if (err) {
                throw new FileOperationError('write', fileOutputName, err);
            } else {
                console.log('File saved: ' + fileOutputName);
            }
        });
    }

    /**
     * Write content to a file asynchronously
     * Uses fs.promises when available, falls back to callback-based API
     * @param {string} json - Content to write to file
     * @param {string} fileOutputName - Path to output file
     * @returns {Promise<void>} Promise that resolves when write completes
     * @throws {FileOperationError} If file write fails
     */
    writeFileAsync(json, fileOutputName) {
        if (fs.promises && typeof fs.promises.writeFile === 'function') {
            return fs.promises.writeFile(fileOutputName, json)
                .catch(error => {
                    throw new FileOperationError('write', fileOutputName, error);
                });
        }
        return new Promise((resolve, reject) => {
            fs.writeFile(fileOutputName, json, (err) => {
                if (err) return reject(new FileOperationError('write', fileOutputName, err));
                resolve();
            });
        });
    }

}
module.exports = new FileUtils();

},{"./errors":4,"fs":1}],6:[function(require,module,exports){
'use strict';

const { JsonValidationError } = require('./errors');

/**
 * JSON validation utilities
 * @category Utilities
 */
class JsonUtil {

    /**
     * Validate that a string is valid JSON
     * @param {string} json - JSON string to validate
     * @throws {JsonValidationError} If JSON is invalid
     */
    validateJson(json) {
        try {
            JSON.parse(json);
        } catch (err) {
            throw new JsonValidationError(json, err);
        }
    }

}

module.exports = new JsonUtil();
},{"./errors":4}],7:[function(require,module,exports){
'use strict';

/**
 * String processing utilities for CSV parsing
 * @category Utilities
 */
class StringUtils {
    // Regular expressions as constants for better maintainability
    static PATTERNS = {
        INTEGER: /^-?\d+$/,
        FLOAT: /^-?\d*\.\d+$/,
        WHITESPACE: /\s/g
    };

    static BOOLEAN_VALUES = {
        TRUE: 'true',
        FALSE: 'false'
    };

    /**
     * Removes whitespace from property names based on configuration
     * @param {boolean} shouldTrimAll - If true, removes all whitespace, otherwise only trims edges
     * @param {string} propertyName - The property name to process
     * @returns {string} The processed property name
     */
    trimPropertyName(shouldTrimAll, propertyName) {
        if (!propertyName) {
            return '';
        }
        return shouldTrimAll ? 
            propertyName.replace(StringUtils.PATTERNS.WHITESPACE, '') : 
            propertyName.trim();
    }

    /**
     * Converts a string value to its appropriate type while preserving data integrity
     * @param {string} value - The input value to convert
     * @returns {string|number|boolean} The converted value
     */
    getValueFormatByType(value) {
        if (this.isEmpty(value)) {
            return String();
        }

        if (this.isBoolean(value)) {
            return this.convertToBoolean(value);
        }

        if (this.isInteger(value)) {
            return this.convertInteger(value);
        }

        if (this.isFloat(value)) {
            return this.convertFloat(value);
        }

        return String(value);
    }

    /**
     * Checks if a value array contains any non-empty values
     * @param {Array} values - Array to check for content
     * @returns {boolean} True if array has any non-empty values
     */
    hasContent(values = []) {
        return Array.isArray(values) && 
               values.some(value => Boolean(value));
    }

    // Private helper methods for type checking and conversion
    /**
     * Check if a value is empty (undefined or empty string)
     * @param {unknown} value - Value to check
     * @returns {boolean} True if value is undefined or empty string
     * @private
     */
    isEmpty(value) {
        return value === undefined || value === '';
    }

    /**
     * Check if a value is a boolean string ('true' or 'false', case-insensitive)
     * @param {string} value - Value to check
     * @returns {boolean} True if value is 'true' or 'false'
     * @private
     */
    isBoolean(value) {
        const normalizedValue = value.toLowerCase();
        return normalizedValue === StringUtils.BOOLEAN_VALUES.TRUE || 
               normalizedValue === StringUtils.BOOLEAN_VALUES.FALSE;
    }

    /**
     * Check if a value is an integer string (with optional leading minus sign)
     * @param {string} value - Value to check
     * @returns {boolean} True if value matches integer pattern
     * @private
     */
    isInteger(value) {
        return StringUtils.PATTERNS.INTEGER.test(value);
    }

    /**
     * Check if a value is a float string (decimal number with optional leading minus sign)
     * @param {string} value - Value to check
     * @returns {boolean} True if value matches float pattern
     * @private
     */
    isFloat(value) {
        return StringUtils.PATTERNS.FLOAT.test(value);
    }

    /**
     * Check if a numeric string has a leading zero (e.g., '01' or '-01')
     * Leading zeros indicate the value should be kept as a string to preserve formatting
     * @param {string} value - Numeric string value to check
     * @returns {boolean} True if value has a leading zero
     * @private
     */
    hasLeadingZero(value) {
        const isPositiveWithLeadingZero = value.length > 1 && value[0] === '0';
        const isNegativeWithLeadingZero = value.length > 2 && value[0] === '-' && value[1] === '0';
        return isPositiveWithLeadingZero || isNegativeWithLeadingZero;
    }

    /**
     * Convert a boolean string to native boolean value
     * Safely converts 'true' to true and 'false' to false
     * @param {string} value - Boolean string ('true' or 'false')
     * @returns {boolean} Native boolean value
     * @private
     */
    convertToBoolean(value) {
        return JSON.parse(value.toLowerCase());
    }

    /**
     * Convert an integer string to number or keep as string if it has leading zeros
     * Preserves leading zeros in strings (e.g., '007' stays as string)
     * @param {string} value - Integer string to convert
     * @returns {number|string} Number if safe, otherwise string value
     * @private
     */
    convertInteger(value) {
        if (this.hasLeadingZero(value)) {
            return String(value);
        }

        const num = Number(value);
        return Number.isSafeInteger(num) ? num : String(value);
    }

    /**
     * Convert a float string to number or keep as string if conversion is unsafe
     * @param {string} value - Float string to convert
     * @returns {number|string} Number if finite and valid, otherwise string value
     * @private
     */
    convertFloat(value) {
        const num = Number(value);
        return Number.isFinite(num) ? num : String(value);
    }
}

module.exports = new StringUtils();

},{}]},{},[2])(2)
});
