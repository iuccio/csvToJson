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
