"use strict";

const csvToJson = require('./csvToJson');
const { InputValidationError, BrowserApiError } = require('./util/errors');

class BrowserApi {
  constructor() {
    // reuse the existing csvToJson instance for parsing and configuration
    this.csvToJson = csvToJson;
  }

  // Configuration proxies (chainable)
  formatValueByType(active = true) {
    this.csvToJson.formatValueByType(active);
    return this;
  }

  supportQuotedField(active = false) {
    this.csvToJson.supportQuotedField(active);
    return this;
  }

  fieldDelimiter(delimiter) {
    this.csvToJson.fieldDelimiter(delimiter);
    return this;
  }

  trimHeaderFieldWhiteSpace(active = false) {
    this.csvToJson.trimHeaderFieldWhiteSpace(active);
    return this;
  }

  indexHeader(index) {
    this.csvToJson.indexHeader(index);
    return this;
  }

  parseSubArray(delimiter = '*', separator = ',') {
    this.csvToJson.parseSubArray(delimiter, separator);
    return this;
  }

  mapRows(mapperFn) {
    this.csvToJson.mapRows(mapperFn);
    return this;
  }

  // Synchronous parse from CSV string (browser friendly)
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

  // Async parse from CSV string (returns a Promise)
  csvStringToJsonAsync(csvString) {
    return Promise.resolve(this.csvStringToJson(csvString));
  }

  csvStringToJsonStringifiedAsync(csvString) {
    return Promise.resolve(this.csvStringToJsonStringified(csvString));
  }

  /**
   * Parse a browser File or Blob object to JSON array.
   * @param {File|Blob} file - File or Blob to read as text
   * @param {object} options - options: { encoding?: string }
   * @returns {Promise<any[]>}
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
