/* globals CsvFormatError */

"use strict";

const csvToJson = require('./csvToJson');
const Configurable = require('./configurable');
const { InputValidationError, BrowserApiError } = require('./util/errors');
const StreamProcessor = require('./streamProcessor');

/**
 * Browser-friendly CSV to JSON API
 * Provides methods for parsing CSV strings and File/Blob objects in browser environments
 * Uses isolated parser configuration via ParserConfig snapshots
 * @category 4-Browser
 */
class BrowserApi extends Configurable {
  /**
   * Constructor initializes proxy to sync csvToJson instance
   */
  constructor() {
    super();
    // reuse the existing csvToJson instance for parsing
    this.csvToJson = csvToJson;
  }

  /**
   * Validate CSV text input for browser methods.
   * @param {string} csvString - CSV content as string
   * @throws {InputValidationError} If the input is not a valid string
   * @private
   */
  _validateCsvString(csvString) {
    if (csvString === undefined || csvString === null) {
      throw new InputValidationError(
        'csvString',
        'string',
        `${typeof csvString}`,
        'Provide valid CSV content as a string to parse.'
      );
    }
  }

  /**
   * Parse CSV text using a frozen parser configuration snapshot.
   * @param {string} csvString - CSV content as string
   * @returns {Array<object>} Parsed CSV rows
   * @private
   */
  _parseCsvText(csvString) {
    const config = this.getParserConfig();
    return this.csvToJson.csvToJsonWithConfig(String(csvString), config);
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
    this._validateCsvString(csvString);
    return this._parseCsvText(csvString);
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
    this._validateCsvString(csvString);
    const rows = this._parseCsvText(csvString);
    return JSON.stringify(rows, undefined, 1);
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
          resolve(this._parseCsvText(reader.result));
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

    const config = this.getParserConfig();
    const streamProcessor = new StreamProcessor(config, { isBrowser: true });
    return streamProcessor.processStream(stream);
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
    if (typeof file.stream === 'function') {
      // Use native streaming if available
      const stream = file.stream();
      return this.getJsonFromStreamAsync(stream);
    } else {
      // Fallback to regular file parsing for older browsers
      return this.parseFile(file);
    }
  }

  /**
   * Parse CSV from a File object using streaming with progress callbacks for large files
   * Processes data in chunks to avoid memory issues with large datasets
   * @param {File} file - File object containing CSV data
   * @param {object} options - Processing options
   * @param {function(Array<object>, number, number): void} options.onChunk - Callback for each chunk of processed rows
   * @param {function(Array<object>): void} [options.onComplete] - Callback when processing is complete
   * @param {function(Error): void} [options.onError] - Callback for errors
   * @param {number} [options.chunkSize] - Number of rows per chunk (default: 1000)
   * @returns {Promise<void>} Promise that resolves when streaming starts
   * @throws {InputValidationError} If file or options are invalid
   * @example
   * const csvToJson = require('convert-csv-to-json');
   * const fileInput = document.querySelector('#csvfile').files[0];
   *
   * await csvToJson.browser.getJsonFromFileStreamingAsyncWithCallback(fileInput, {
   *   chunkSize: 500,
   *   onChunk: (rows, processed, total) => {
   *     console.log(`Processed ${processed}/${total} rows`);
   *     // Handle chunk of rows here
   *   },
   *   onComplete: (allRows) => {
   *     console.log('Processing complete!');
   *   },
   *   onError: (error) => {
   *     console.error('Error:', error);
   *   }
   * });
   */
  async getJsonFromFileStreamingAsyncWithCallback(file, options = {}) {
    if (!file || !(file instanceof File)) {
      throw new InputValidationError(
        'file',
        'File object',
        typeof file,
        'Provide a valid File object.'
      );
    }

    if (!options.onChunk || typeof options.onChunk !== 'function') {
      throw new InputValidationError(
        'options.onChunk',
        'function',
        typeof options.onChunk,
        'Provide a callback function to handle processed chunks.'
      );
    }

    const chunkSize = options.chunkSize || 1000;
    const config = this.getParserConfig();
    const streamProcessor = new StreamProcessor(config, {
      isBrowser: true,
      chunkSize,
      onChunk: options.onChunk,
      onComplete: options.onComplete,
      onError: options.onError
    });

    // Check if the file supports streaming
    if (typeof file.stream === 'function') {
      // Use native streaming if available
      const stream = file.stream();
      return streamProcessor.processStreamWithCallbacks(stream);
    } else {
      // Fallback to regular file parsing for older browsers
      return this.parseFileWithCallbacks(file, options);
    }
  }

  /**
   * Parse a File object with progress callbacks (fallback for non-streaming browsers)
   * @param {File} file - File object to parse
   * @param {object} options - Processing options
   * @private
   */
  async parseFileWithCallbacks(file, options) {
    const chunkSize = options.chunkSize || 1000;
    const onChunk = options.onChunk;
    const onComplete = options.onComplete;
    const onError = options.onError;

    return new Promise((resolve, reject) => {
      if (typeof FileReader === 'undefined') {
        const error = BrowserApiError.fileReaderNotAvailable();
        if (onError) onError(error);
        reject(error);
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => {
        const error = BrowserApiError.parseFileError(
          reader.error || new Error('Unknown file reading error')
        );
        if (onError) onError(error);
        reject(error);
      };

      reader.onload = () => {
        try {
          const allRows = this._parseCsvText(reader.result);

          // Process in chunks
          let processed = 0;
          const total = allRows.length;

          const processChunk = () => {
            const chunk = allRows.slice(processed, processed + chunkSize);
            if (chunk.length > 0) {
              onChunk(chunk, processed + chunk.length, total);
              processed += chunk.length;
              // Use setTimeout to avoid blocking the UI
              setTimeout(processChunk, 0);
            } else {
              if (onComplete) onComplete(allRows);
              resolve();
            }
          };

          processChunk();
        } catch (err) {
          const error = BrowserApiError.parseFileError(err);
          if (onError) onError(error);
          reject(error);
        }
      };

      reader.readAsText(file);
    });
  }

}

module.exports = new BrowserApi();