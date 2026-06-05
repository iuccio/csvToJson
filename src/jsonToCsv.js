/* globals FileOperationError */
"use strict";

const fileUtils = require('./util/fileUtils');
const stringUtils = require('./util/stringUtils');
const {
    InputValidationError,
    JsonValidationError
} = require('./core/errors');
const Configurable = require('./core/configurable');

const DEFAULT_FIELD_DELIMITER = ",";
const QUOTE_CHAR = '"';
const CRLF = '\r\n';

/**
 * JSON to CSV converter class (Synchronous)
 * Provides chainable API for configuring and converting JSON data to CSV
 * @category 2-Sync 
 */
class JsonToCsv extends Configurable {

  /**
   * Validate that input is a valid JSON array
   * @param {unknown} jsonData - Data to validate
   * @throws {InputValidationError} If not a valid array
   * @private
   */
  validateJsonInput(jsonData) {
    if (!Array.isArray(jsonData)) {
      throw new InputValidationError(
        'jsonData',
        'Array',
        typeof jsonData,
        'JSON input must be an array of objects'
      );
    }
    if (jsonData.length === 0) {
      throw new InputValidationError(
        'jsonData',
        'Non-empty Array',
        'empty array',
        'JSON array must contain at least one object'
      );
    }
  }

  /**
   * Get all field names from JSON array, optionally filtered by ignoreColumnIndexes
   * @param {Array<object>} jsonData - Array of objects
   * @param {object} config - Parser configuration
   * @returns {string[]} Array of field names
   * @private
   */
  extractHeaders(jsonData, config) {
    const headers = new Set();
    
    // Collect all unique keys from all objects
    for (const row of jsonData) {
      if (typeof row === 'object' && row !== null) {
        Object.keys(row).forEach(key => headers.add(key));
      }
    }

    let headerArray = Array.from(headers);

    // Apply header field whitespace trimming if configured
    if (config.isTrimHeaderFieldWhiteSpace) {
      headerArray = headerArray.map(header => 
        stringUtils.trimPropertyName(true, header)
      );
    }

    // Apply column index filtering if configured
    if (config.ignoreColumnIndexes && config.ignoreColumnIndexes.length > 0) {
      headerArray = headerArray.filter((_, index) => 
        !config.ignoreColumnIndexes.includes(index)
      );
    }

    return headerArray;
  }

  /**
   * Escape a CSV field value according to RFC 4180
   * @param {string} value - Field value to escape
   * @param {string} delimiter - Field delimiter
   * @returns {string} Escaped field value
   * @private
   */
  escapeField(value, delimiter) {
    const stringValue = String(value);
    
    // Check if field needs quoting
    if (stringValue.includes(delimiter) || 
        stringValue.includes(QUOTE_CHAR) || 
        stringValue.includes('\n') || 
        stringValue.includes('\r')) {
      // Escape quotes by doubling them
      const escaped = stringValue.replace(/"/g, '""');
      return `${QUOTE_CHAR}${escaped}${QUOTE_CHAR}`;
    }
    
    return stringValue;
  }

  /**
   * Convert a single row object to CSV field values
   * @param {object} row - Row object
   * @param {string[]} headers - Header field names
   * @param {object} config - Parser configuration
   * @returns {string} CSV formatted row
   * @private
   */
  rowToCSVRecord(row, headers, config) {
    const delimiter = this.getFieldDelimiter(config);
    
    const fields = headers.map(header => {
      const value = row[header];
      
      // Handle null/undefined values
      if (value === null || value === undefined) {
        return '';
      }
      
      // Handle arrays - convert to string representation
      if (Array.isArray(value)) {
        const arrayString = value.join(';');
        return this.escapeField(arrayString, delimiter);
      }
      
      // Handle objects - convert to JSON string
      if (typeof value === 'object') {
        const objectString = JSON.stringify(value);
        return this.escapeField(objectString, delimiter);
      }
      
      return this.escapeField(value, delimiter);
    });

    return fields.join(delimiter);
  }

  /**
   * Get the field delimiter from configuration
   * @param {object} config - Parser configuration
   * @returns {string} Field delimiter
   * @private
   */
  getFieldDelimiter(config) {
    return config.delimiter || DEFAULT_FIELD_DELIMITER;
  }

  /**
   * Convert JSON array to CSV string
   * @param {Array<object>} jsonData - Array of objects to convert
   * @param {object} config - Parser configuration object
   * @returns {string} CSV formatted string
   * @throws {InputValidationError} If jsonData is not a valid array
   * @private
   */
  jsonToCsvWithConfig(jsonData, config) {
    this.validateJsonInput(jsonData);

    const headers = this.extractHeaders(jsonData, config);
    const lines = [];

    // Add header row
    const headerDelimiter = this.getFieldDelimiter(config);
    lines.push(headers.join(headerDelimiter));

    // Add data rows
    for (const row of jsonData) {
      if (typeof row === 'object' && row !== null) {
        const csvRecord = this.rowToCSVRecord(row, headers, config);
        lines.push(csvRecord);
      }
    }

    return lines.join(CRLF);
  }

  /**
   * Convert JSON array to CSV string (wrapper for internal use)
   * @param {Array<object>} jsonData - Array of objects to convert
   * @returns {string} CSV formatted string
   * @private
   */
  jsonToCsv(jsonData) {
    return this.jsonToCsvWithConfig(jsonData, this.getParserConfig());
  }

  /**
   * Convert JSON array and write to CSV file
   * @param {Array<object>} jsonData - Array of objects to convert
   * @param {string} fileOutputName - Path to output CSV file
   * @throws {InputValidationError} If jsonData is invalid
   * @throws {FileOperationError} If file write fails
   * @example
   * const jsonToCsv = require('convert-csv-to-json').jsonToCsv;
   * const data = [{name: 'Alice', age: 30}, {name: 'Bob', age: 25}];
   * jsonToCsv.generateCsvFileFromJson(data, 'output.csv');
   */
  generateCsvFileFromJson(jsonData, fileOutputName) {
    const csv = this.jsonToCsv(jsonData);
    fileUtils.writeFile(csv, fileOutputName);
  }

  /**
   * Convert JSON array to CSV string
   * @param {Array<object>} jsonData - Array of objects to convert
   * @returns {string} CSV formatted string
   * @throws {InputValidationError} If jsonData is not valid
   * @example
   * const jsonToCsv = require('convert-csv-to-json').jsonToCsv;
   * const data = [{name: 'Alice', age: 30}, {name: 'Bob', age: 25}];
   * const csv = jsonToCsv.jsonToCsvStringified(data);
   * console.log(csv);
   */
  jsonToCsvStringified(jsonData) {
    return this.jsonToCsv(jsonData);
  }

  /**
   * Convert JSON array from file to CSV string
   * @param {string} fileInputName - Path to input JSON file
   * @returns {string} CSV formatted string
   * @throws {FileOperationError} If file read fails
   * @throws {InputValidationError} If JSON is invalid
   * @example
   * const jsonToCsv = require('convert-csv-to-json').jsonToCsv;
   * const csv = jsonToCsv.getCsvFromJsonStringified('data.json');
   * console.log(csv);
   */
  getCsvFromJsonStringified(fileInputName) {
    const json = this.getCsvFromJson(fileInputName);
    return json;
  }

  /**
   * Read JSON file and convert to CSV string
   * @param {string} fileInputName - Path to input JSON file
   * @returns {string} CSV formatted string
   * @throws {FileOperationError} If file read fails
   * @throws {InputValidationError} If JSON is invalid
   * @example
   * const jsonToCsv = require('convert-csv-to-json').jsonToCsv;
   * const csv = jsonToCsv.getCsvFromJson('data.json');
   * console.log(csv);
   */
  getCsvFromJson(fileInputName) {
    const config = this.getParserConfig();
    const jsonString = fileUtils.readFile(fileInputName, config.encoding || 'utf8');
    let jsonData;
    try {
      jsonData = JSON.parse(jsonString);
    } catch (err) {
      throw new JsonValidationError(jsonString, err);
    }
    return this.jsonToCsv(jsonData);
  }

  /**
   * Generate CSV file from JSON file
   * @param {string} fileInputName - Path to input JSON file
   * @param {string} fileOutputName - Path to output CSV file
   * @throws {FileOperationError} If file operations fail
   * @throws {JsonValidationError} If JSON is invalid
   * @example
   * const jsonToCsv = require('convert-csv-to-json').jsonToCsv;
   * jsonToCsv.generateCsvFileFromJsonFile('input.json', 'output.csv');
   */
  generateCsvFileFromJsonFile(fileInputName, fileOutputName) {
    const csv = this.getCsvFromJson(fileInputName);
    fileUtils.writeFile(csv, fileOutputName);
  }

}

module.exports = new JsonToCsv();
