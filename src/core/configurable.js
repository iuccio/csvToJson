'use strict';

const { ConfigurationError } = require('./errors');
const ParserConfig = require('./parserConfig');

/**
 * Shared configuration builder for CSV parser clients.
 * Provides chainable methods for parser options and snapshots.
 */
class Configurable {
  /**
   * Initialize a configurable parser instance.
   * @param {object} [initialConfig] - Initial parser configuration values
   */
  constructor(initialConfig = {}) {
    this.config = { ...initialConfig };
  }

  /**
   * Enable or disable automatic type formatting for values.
   * @param {boolean} active - Whether to format values by type
   * @returns {this} For method chaining
   */
  formatValueByType(active = true) {
    this.config.printValueFormatByType = active;
    return this;
  }

  /**
   * Enable or disable support for RFC 4180 quoted fields.
   * @param {boolean} active - Whether to support quoted fields
   * @returns {this} For method chaining
   */
  supportQuotedField(active = false) {
    this.config.isSupportQuotedField = active;
    return this;
  }

  /**
   * Set the field delimiter character.
   * @param {string} delimiter - Character(s) to use as field separator
   * @returns {this} For method chaining
   */
  fieldDelimiter(delimiter) {
    this.config.delimiter = delimiter;
    return this;
  }

  /**
   * Configure whitespace handling in header field names.
   * @param {boolean} active - Whether to trim whitespace in header names
   * @returns {this} For method chaining
   */
  trimHeaderFieldWhiteSpace(active = false) {
    this.config.isTrimHeaderFieldWhiteSpace = active;
    return this;
  }

  /**
   * Set the row index where CSV headers are located.
   * @param {number} indexHeaderValue - Zero-based row index containing headers
   * @returns {this} For method chaining
   */
  indexHeader(indexHeaderValue) {
    if (isNaN(indexHeaderValue)) {
      throw ConfigurationError.invalidHeaderIndex(indexHeaderValue);
    }
    this.config.indexHeaderValue = indexHeaderValue;
    return this;
  }

  /**
   * Configure sub-array parsing for special field values.
   * @param {string} delimiter - Bracket character
   * @param {string} separator - Item separator within brackets
   * @returns {this} For method chaining
   */
  parseSubArray(delimiter = '*', separator = ',') {
    this.config.parseSubArrayDelimiter = delimiter;
    this.config.parseSubArraySeparator = separator;
    return this;
  }

  /**
   * Set a mapper function for row transformation.
   * @param {function(object, number): object|null} mapperFn - Function receiving (row, index)
   * @returns {this} For method chaining
   */
  mapRows(mapperFn) {
    if (typeof mapperFn !== 'function') {
      throw new TypeError('mapperFn must be a function');
    }
    this.config.rowMapper = mapperFn;
    return this;
  }

  /**
   * Configure column indexes to exclude from output.
   * @param {Array<number>} indexes - Column indexes to ignore
   * @returns {this} For method chaining
   */
  ignoreColumnIndexes(indexes) {
    this.config.indexesToIgnore = Array.isArray(indexes) ? [...indexes] : [...indexes];
    return this;
  }

  /**
   * Set the file encoding for reading CSV files.
   * @param {string} encoding - Node.js supported encoding
   * @returns {this} For method chaining
   */
  encoding(encoding) {
    this.config.encoding = encoding;
    return this;
  }

  /**
   * Create an immutable parser configuration snapshot.
   * @returns {ParserConfig} Frozen parser configuration
   */
  getParserConfig() {
    return new ParserConfig(this.config);
  }
}

module.exports = Configurable;
