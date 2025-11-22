"use strict";

const csvToJson = require('./csvToJson');

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

  // Synchronous parse from CSV string (browser friendly)
  csvStringToJson(csvString) {
    if (csvString === undefined || csvString === null) {
      throw new Error('csvString is not defined!!!');
    }
    return this.csvToJson.csvToJson(csvString);
  }

  csvStringToJsonStringified(csvString) {
    if (csvString === undefined || csvString === null) {
      throw new Error('csvString is not defined!!!');
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
      return Promise.reject(new Error('file is not defined!!!'));
    }

    return new Promise((resolve, reject) => {
      if (typeof FileReader === 'undefined') {
        reject(new Error('FileReader is not available in this environment'));
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
      reader.onload = () => {
        try {
          const text = reader.result;
          const result = this.csvToJson.csvToJson(String(text));
          resolve(result);
        } catch (err) {
          reject(err);
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
