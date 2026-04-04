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

  /**
   * Parse CSV from a browser ReadableStream and return parsed data as JSON array
   * Processes data in chunks for memory-efficient handling of large streams
   * @param {object} stream - Browser ReadableStream containing CSV data
   * @returns {Promise<Array<object>>} Promise resolving to array of objects representing CSV rows
   * @throws {InputValidationError} If stream is invalid
   * @throws {BrowserApiError} If streaming is not supported or parsing fails
   * @example
   * const csvToJson = require('convert-csv-to-json');
   * const response = await fetch('large-dataset.csv');
   * const stream = response.body;
   * const data = await csvToJson.browser.getJsonFromStreamAsync(stream);
   * console.log(data);
   */
  async getJsonFromStreamAsync(stream) {
    if (typeof ReadableStream === 'undefined') {
      throw BrowserApiError.streamingNotSupported();
    }

    if (!stream || typeof stream.getReader !== 'function') {
      throw new InputValidationError(
        'stream',
        'ReadableStream',
        typeof stream,
        'Provide a valid browser ReadableStream.'
      );
    }

    return new Promise((resolve, reject) => {
      const reader = stream.getReader();
      let buffer = '';
      let headers = null;
      const parsedRecords = [];
      let currentRecordIndex = 0;
      const headerRowIndex = this.csvToJson.getIndexHeader();

      const processChunk = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              // Process any remaining buffer
              if (buffer.length > 0) {
                const result = this._processBrowserRecord(buffer, headers, parsedRecords, currentRecordIndex, headerRowIndex);
                headers = result.headers;
              }
              resolve(parsedRecords);
              return;
            }

            // Convert chunk to string and add to buffer
            buffer += (typeof value === 'string') ? value : 
                     (typeof globalThis.TextDecoder !== 'undefined' ? new globalThis.TextDecoder().decode(value) : 
                      String.fromCharCode.apply(null, new Uint8Array(value)));

            // Process complete records from buffer
            const bufferResult = this._processBrowserBuffer(buffer, headers, parsedRecords, currentRecordIndex, headerRowIndex);
            buffer = bufferResult.buffer;
            headers = bufferResult.headers;
            currentRecordIndex++;
          }
        } catch (error) {
          reject(BrowserApiError.parseFileError(error));
        }
      };

      processChunk();
    });
  }

  /**
   * Parse CSV from a File object using streaming for memory-efficient processing
   * @param {File} file - File object containing CSV data
   * @returns {Promise<Array<object>>} Promise resolving to array of objects representing CSV rows
   * @throws {InputValidationError} If file is invalid
   * @throws {BrowserApiError} If streaming is not supported or parsing fails
   * @example
   * const csvToJson = require('convert-csv-to-json');
   * const fileInput = document.querySelector('#csvfile').files[0];
   * const data = await csvToJson.browser.getJsonFromFileStreamingAsync(fileInput);
   * console.log(data);
   */
  async getJsonFromFileStreamingAsync(file) {
    if (!file || !(file instanceof File)) {
      throw new InputValidationError(
        'file',
        'File object',
        typeof file,
        'Provide a valid File object.'
      );
    }

    // Check if the file supports streaming
    if (typeof file.stream === 'function' && file.hasOwnProperty('stream')) {
      // Use native streaming if available
      const stream = file.stream();
      return this.getJsonFromStreamAsync(stream);
    } else {
      // Fallback to regular file parsing for older browsers
      return this.parseFile(file);
    }
  }

  /**
   * Process buffer to extract complete records (browser implementation)
   * @param {string} buffer - Current buffer content
   * @param {Array<string>|null} headers - CSV headers
   * @param {Array<object>} parsedRecords - Output array for parsed records
   * @param {number} currentRecordIndex - Current record index
   * @param {number} headerRowIndex - Index of header row
   * @returns {object} Object with buffer and updated headers
   * @private
   */
  _processBrowserBuffer(buffer, headers, parsedRecords, currentRecordIndex, headerRowIndex) {
    const lines = buffer.split('\n');
    const completeLines = lines.slice(0, -1); // All lines except the last (potentially incomplete)
    const remainingBuffer = lines[lines.length - 1];

    for (const line of completeLines) {
      if (line.trim()) { // Skip empty lines
        const result = this._processBrowserRecord(line, headers, parsedRecords, currentRecordIndex, headerRowIndex);
        headers = result.headers;
        currentRecordIndex++;
      }
    }

    return { buffer: remainingBuffer, headers };
  }

  /**
   * Process a single CSV record (browser implementation)
   * @param {string} record - CSV record to process
   * @param {Array<string>|null} headers - CSV headers
   * @param {Array<object>} parsedRecords - Output array for parsed records
   * @param {number} currentRecordIndex - Current record index
   * @param {number} headerRowIndex - Index of header row
   * @returns {object} Object with updated headers
   * @private
   */
  _processBrowserRecord(record, headers, parsedRecords, currentRecordIndex, headerRowIndex) {
    if (headers === null && currentRecordIndex === headerRowIndex) {
      // Process header record
      const headerFields = this._splitBrowserRecord(record);
      if (headerFields.length > 0) {
        headers = headerFields;
      }
    } else if (headers !== null) {
      // Process data record
      const dataFields = this._splitBrowserRecord(record);
      if (dataFields.length > 0) {
        const row = this.csvToJson.buildJsonResult(headers, dataFields);
        parsedRecords.push(row);
      }
    }
    return { headers };
  }

  /**
   * Split a CSV record into fields (browser implementation)
   * @param {string} record - Record to split
   * @returns {string[]} Array of field values
   * @private
   */
  _splitBrowserRecord(record) {
    if (this.csvToJson.isSupportQuotedField) {
      return this.csvToJson.split(record);
    }
    return record.split(this.csvToJson.delimiter || ',');
  }
}

module.exports = new BrowserApi();
