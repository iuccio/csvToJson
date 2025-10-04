"use strict";

const fs = require('fs');

/**
 * @param {string} fileInputName 
 * @param {BufferEncoding} encoding 
 * @returns {string}
 */
function readFile(fileInputName, encoding) {
  return fs.readFileSync(fileInputName, encoding).toString();
}

/**
 * @param {string} fileOutputName 
 * @param {string} json 
 */
function writeFile(fileOutputName, json) {
  fs.writeFileSync(fileOutputName, json, { encoding: 'utf8' });
}

const encodings = /** @type {const} */ (['utf8', 'ucs2', 'utf16le', 'latin1', 'ascii', 'base64', 'hex'])
/** @typedef {typeof encodings[number]} BufferEncoding */

const newLineRegex = /\r?\n/;


/**
 * @param {boolean} removeAllWhiteSpace 
 * @param {string} value 
 * @returns {string}
 */
function trimPropertyName(removeAllWhiteSpace, value) {
  return removeAllWhiteSpace
    ? value.replace(/\s/g, '')
    : value.trim();
}

/**
 * @param {string} value 
 * @returns {string|number|boolean}
 */
function getValueFormatByType(value) {
  if (value === undefined || value === '') {
    return '';
  }
  //is Number
  if (!isNaN(/** @type {*} */(value))) {
    return +value;
  }
  // is Boolean
  if (value === "true" || value === "false") {
    return value === 'true' ? true : false;
  }
  return `${value}`;
}

/**
 * @param {Array} values 
 * @returns {boolean}
 */
function hasContent(values) {
  if (values && values.length > 0) {
    for (let i = 0; i < values.length; i++) {
      if (values[i]) {
        return true;
      }
    }
  }
  return false;
}

/**
 * @typedef {object} CsvToJsonOptions
 * @property {string} [delimiter=';'] - The field delimiter which will be used to split the fields
 * @property {BufferEncoding} [encoding='utf8'] - The file encoding
 * @property {number} [indexHeader=0] - The index where the header is defined
 * @property {boolean} [supportQuotedField=false] - Makes parser aware of quoted fields
 * @property {boolean} [printValueFormatByType=false] - Prints a digit as Number type (for example 32 instead of '32')
 * @property {boolean} [parseSubArrays=false] - Whether to parse sub arrays
 * @property {string} [parseSubArrayDelimiter='*'] - The delimiter to identify a sub array
 * @property {string} [parseSubArraySeparator=','] - The separator to split values in a sub array
 * @property {boolean} [trimHeaderFieldWhiteSpace=false] - If active the content of the Header Fields is trimmed including the white spaces, e.g. "My Name" -> "MyName"
 */

/** @typedef {Array<string>} CSVHeaders */

class CsvToJson {
  /** @type {BufferEncoding} */
  #encoding;
  /** @type {number} */

  #indexHeader;
  /** @type {boolean} */

  #supportQuotedField;
  /** @type {boolean} */

  #printValueFormatByType;

  /** @type {boolean} */
  #parseSubArrays;

  /** @type {string} */
  #parseSubArrayDelimiter;

  /** @type {string} */
  #parseSubArraySeparator;

  /** @type {string} */
  #delimiter;

  /** @type {boolean} */
  #shouldTrimHeaderFieldWhiteSpace;

  /**
   * @param {CsvToJsonOptions} opts 
   */
  constructor(opts = {}) {
    this.#delimiter = opts.delimiter || ';';
    this.#encoding = opts.encoding || 'utf8';
    this.#indexHeader = opts.indexHeader || 0;
    this.#supportQuotedField = opts.supportQuotedField || false;
    this.#printValueFormatByType = opts.printValueFormatByType || false;
    this.#parseSubArrays = opts.parseSubArrays || false;
    this.#parseSubArrayDelimiter = opts.parseSubArrayDelimiter || '*';
    this.#parseSubArraySeparator = opts.parseSubArraySeparator || ',';
    this.#shouldTrimHeaderFieldWhiteSpace = opts.trimHeaderFieldWhiteSpace || false;
  }

  /**
   * Prints a digit as Number type (for example 32 instead of '32')
   * @param {boolean} [active = false]
   * @returns {this}
   */
  formatValueByType(active = false) {
    this.#printValueFormatByType = active;
    return this;
  }

  /**
   * Makes parser aware of quoted fields
   * @param {boolean} [active = false]
   * @returns {this}
   */
  setSupportQuotedField(active = false) {
    this.#supportQuotedField = active;
    return this;
  }

  /**
   * Defines the field delimiter which will be used to split the fields
   * @param {string} [delimiter=';']
   * @return {this}
   * @throws {TypeError} when the delimiter is not a string or empty
   */
  setDelimiter(delimiter = ';') {
    if (typeof delimiter !== 'string' || delimiter.length === 0) {
      throw new TypeError('The delimiter must be a non empty String!');
    }
    this.#delimiter = delimiter;
    return this;
  }

  /**
   * Configures if the content of the Header Fields is trimmed including the
   * white spaces, e.g. "My Name" -> "MyName"
   * @param {boolean} [active = false]
   * @return {this}
   */
  setShouldtrimHeaderFieldWhiteSpace(active = false) {
    this.#shouldTrimHeaderFieldWhiteSpace = active;
    return this;
  }

  /**
   * Defines the index where the header is defined
   * @param {number} indexHeader
   * @return {this}
   * @throws {TypeError} when the indexHeader is not a number
   */
  setIndexHeader(indexHeader) {
    if (isNaN(indexHeader)) {
      throw new TypeError('The index Header must be a Number!');
    }
    this.#indexHeader = indexHeader;
    return this;
  }

  /**
   * Defines how to match and parse a sub array
   * @param {string} [delimiter='*'] 
   * @param {string} [separator=','] 
   */
  parseSubArray(delimiter = '*', separator = ',') {
    this.#parseSubArrays = true;
    this.#parseSubArrayDelimiter = delimiter;
    this.#parseSubArraySeparator = separator;
  }

  /**
   * Defines the file encoding
   * @param {BufferEncoding} encoding 
   * @return {this}
   */
  setEncoding(encoding = 'utf8') {
    this.#encoding = encoding;
    return this;
  }

  /**
   * Parses .csv file and put its content into a file in json format.
   * @param {string} fileInputName
   * @param {string} fileOutputName
   * @throws {Error} when input or output file name is not defined
   * @return {void}
   */
  generateJsonFileFromCsv(fileInputName, fileOutputName) {
    if (!fileInputName) {
      throw new Error("inputFileName is not defined.");
    }
    if (!fileOutputName) {
      throw new Error("outputFileName is not defined.");
    }
    let jsonStringified = this.getJsonStringifiedFromCsv(fileInputName);
    writeFile(fileOutputName, jsonStringified);
  }

  /**
   * Parses .csv file and converts its content into a string in json format.
   * @param {string} fileInputName 
   * @returns {string}
   */
  getJsonStringifiedFromCsv(fileInputName) {
    let json = this.getJsonFromCsv(fileInputName);
    let jsonStringified = JSON.stringify(json, undefined, 1);
    return jsonStringified;
  }

  /**
   * Parses .csv file and put its content into an Array of Object in json format.
   * @param {string} fileInputName
   * @return {Array} Array of Object in json format
   * @throws {Error} when input file name is not defined
   */
  getJsonFromCsv(fileInputName) {
    if (!fileInputName) {
      throw new Error("inputFileName is not defined.");
    }
    let parsedCsv = readFile(fileInputName, this.#encoding);
    return this.#parse(parsedCsv);
  }

  /**
   * @param {string} csvString 
   * @returns {Array<object>}
   */
  csvStringToJson(csvString) {
    return this.#parse(csvString);
  }

  /**
   * @param {string} parsedCsv 
   * @returns {Array<object>}
   */
  #parse(parsedCsv) {
    this.#validateInputConfig();
    let lines = parsedCsv.split(newLineRegex);
    const delimiter = this.#delimiter;
    let index = this.#indexHeader;

    /** @type {CSVHeaders} */
    let headers = this.#split(lines[index]);

    // Skip empty lines until we find a header
    while (!hasContent(headers) && index <= lines.length) {
      index = index + 1;
      headers = lines[index].split(delimiter);
    }

    for (let i = 0; i < headers.length; i++) {
      headers[i] = trimPropertyName(this.#shouldTrimHeaderFieldWhiteSpace, headers[i]);
      this.#validateHeader(headers[i]);
    }

    let jsonResult = [];
    for (let i = (index + 1); i < lines.length; i++) {
      const currentLine = this.#split(lines[i]);
      if (hasContent(currentLine)) {
        jsonResult.push(this.buildJsonResult(headers, currentLine));
      }
    }
    return jsonResult;
  }

  /**
   * @param {CSVHeaders} headers 
   * @param {Array<string>} currentLine 
   * @returns {object}
   */
  buildJsonResult(headers, currentLine) {
    const jsonObject = {};
    for (let i = 0; i < headers.length; i++) {
      if (this.#shouldParseValueAsSubArray(currentLine[i])) {
        jsonObject[headers[i]] = this.#parseValueAsSubArray(currentLine[i]);
      } else if (this.#printValueFormatByType) {
        jsonObject[headers[i]] = getValueFormatByType(currentLine[i]);
      } else {
        jsonObject[headers[i]] = currentLine[i];
      }
    }
    return jsonObject;
  }

  /**
   * @param {string} value 
   * @returns {Array}
   */
  #parseValueAsSubArray(value) {
    let extractedValues = value.substring(
      value.indexOf(this.#parseSubArrayDelimiter) + 1,
      value.lastIndexOf(this.#parseSubArrayDelimiter)
    ).trim();
    /** @type {*} */
    const result = extractedValues.split(this.#parseSubArraySeparator);
    if (this.#printValueFormatByType) {
      for (let i = 0; i < result.length; i++) {
        result[i] = getValueFormatByType(result[i]);
      }
    }
    return result;
  }

  /**
   * @param {string} value 
   * @returns {boolean}
   */
  #shouldParseValueAsSubArray(value) {
    return (
      this.#parseSubArrays &&
      value !== '' &&
      value.indexOf(this.#parseSubArrayDelimiter) === 0 &&
      value.lastIndexOf(this.#parseSubArrayDelimiter) === (value.length - 1)
    );
  }

  /**
   * Validates the input configuration
   * @throws {Error} when the configuration is not valid
   */
  #validateInputConfig() {
    if (this.#supportQuotedField) {
      if (this.#delimiter === '"') {
        throw new Error('When SupportQuotedFields is enabled you cannot defined the field delimiter as quote -> ["]');
      }
      if (this.#parseSubArraySeparator === '"') {
        throw new Error('When SupportQuotedFields is enabled you cannot defined the field parseSubArraySeparator as quote -> ["]');
      }
      if (this.#parseSubArrayDelimiter === '"') {
        throw new Error('When SupportQuotedFields is enabled you cannot defined the field parseSubArrayDelimiter as quote -> ["]');
      }
    }
  }

  /**
   * Checks if the line contains doublequotes
   * @param {string} line 
   * @returns {boolean}
   */
  #hasQuotes(line) {
    return line.includes('"');
  }

  /**
   * @param {string} header
   */
  #validateHeader(header) {
    if (
      header === 'prototype' ||
      header === '__proto__' ||
      header === 'constructor'
    ) {
      throw new Error(`The header contains a forbidden field name: ${header}`);
    }
  }

  /**
   * Splits a line into sub values taking care of quoted fields
   * @param {string} line 
   * @returns {Array<string>}
   * @throws {SyntaxError} when the line contains mismatched quotes
   */
  #split(line) {
    if (line.length === 0) {
      return [];
    }

    const delimiter = this.#delimiter;

    if (this.#supportQuotedField && this.#hasQuotes(line)) {
      const chars = line.split('');
      const entry = [''];
      let subIndex = 0;
      let startQuote = false;
      let isDouble = false;
      let c = '';

      for (let i = 0; i < chars.length; i++) {
        c = chars[i];
        if (isDouble) { //when run into double just pop it into current and move on
          entry[subIndex] += c;
          isDouble = false;
          continue;
        }

        if (c !== '"' && c !== delimiter) {
          entry[subIndex] += c;
        } else if (c === delimiter && startQuote) {
          entry[subIndex] += c;
        } else if (c === delimiter) {
          subIndex++
          entry[subIndex] = '';
          continue;
        } else {
          if (chars[i + 1] === '"') {
            //Double quote
            isDouble = true;
            //subSplits[subIndex] += c; //Skip because this is escaped quote
          } else {
            if (!startQuote) {
              startQuote = true;
              //subSplits[subIndex] += c; //Skip because we don't want quotes wrapping value
            } else {
              //end
              startQuote = false;
              //subSplits[subIndex] += c; //Skip because we don't want quotes wrapping value
            }
          }
        }
      }
      if (startQuote) {
        throw new SyntaxError('Row contains mismatched quotes!');
      }
      return entry;
    } else {
      return line.split(delimiter);
    }
  }
}

module.exports = CsvToJson;
module.exports.default = CsvToJson;
module.exports.CsvToJson = CsvToJson;
