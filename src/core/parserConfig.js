'use strict';

/**
 * Immutable parser configuration snapshot used for concurrent parsing.
 */
class ParserConfig {
  /**
   * Create a frozen parser configuration snapshot.
   * @param {object} options - Parser configuration options
   * @param {string} [options.delimiter] - Field delimiter
   * @param {string} [options.encoding] - File encoding
   * @param {boolean} [options.isSupportQuotedField] - Support quoted fields
   * @param {boolean} [options.isTrimHeaderFieldWhiteSpace] - Trim whitespace in header names
   * @param {number} [options.indexHeaderValue] - Header row index
   * @param {string} [options.parseSubArrayDelimiter] - Sub-array delimiter character
   * @param {string} [options.parseSubArraySeparator] - Sub-array item separator
   * @param {boolean} [options.printValueFormatByType] - Format values by type
   * @param {function(object, number): object|null} [options.rowMapper] - Row mapper function
   * @param {Array<number>} [options.indexesToIgnore] - Column indexes to ignore
   */
  constructor(options = {}) {
    this.delimiter = options.delimiter;
    this.encoding = options.encoding;
    this.isSupportQuotedField = options.isSupportQuotedField;
    this.isTrimHeaderFieldWhiteSpace = options.isTrimHeaderFieldWhiteSpace;
    this.indexHeaderValue = options.indexHeaderValue;
    this.parseSubArrayDelimiter = options.parseSubArrayDelimiter;
    this.parseSubArraySeparator = options.parseSubArraySeparator;
    this.printValueFormatByType = options.printValueFormatByType;
    this.rowMapper = options.rowMapper;
    this.indexesToIgnore = options.indexesToIgnore ? Object.freeze([...options.indexesToIgnore]) : Object.freeze([]);

    Object.freeze(this);
  }
}

module.exports = ParserConfig;
