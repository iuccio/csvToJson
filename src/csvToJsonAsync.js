/* globals CsvFormatError, FileOperationError */
'use strict';

const fileUtils = require('./util/fileUtils');
const csvToJson = require('./csvToJson');
const { InputValidationError } = require('./util/errors');
const StreamProcessor = require('./streamProcessor');

/**
 * Asynchronous CSV to JSON converter
 * Proxies configuration to sync instance but provides async file I/O methods
 * @category 3-Async
 */
class CsvToJsonAsync {
    /**
     * Constructor initializes proxy to sync csvToJson instance
     */
    constructor() {
        // Proxy the configuration methods to the sync instance
        this.csvToJson = csvToJson;
    }

    /**
     * Enable or disable automatic type formatting for values
     * @param {boolean} active - Whether to format values by type
     * @returns {this} For method chaining
     */
    formatValueByType(active) {
        this.csvToJson.formatValueByType(active);
        return this;
    }

    /**
     * Enable or disable support for RFC 4180 quoted fields
     * @param {boolean} active - Whether to support quoted fields
     * @returns {this} For method chaining
     */
    supportQuotedField(active) {
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
     * @param {boolean} active - If true, removes all whitespace; if false, only trims edges
     * @returns {this} For method chaining
     */
    trimHeaderFieldWhiteSpace(active) {
        this.csvToJson.trimHeaderFieldWhiteSpace(active);
        return this;
    }

    /**
     * Set the row index where CSV headers are located
     * @param {number} indexHeader - Zero-based row index containing headers
     * @returns {this} For method chaining
     */
    indexHeader(indexHeader) {
        this.csvToJson.indexHeader(indexHeader);
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
     * Set file encoding for reading CSV files
     * @param {string} encoding - Node.js supported encoding (e.g., 'utf8', 'latin1')
     * @returns {this} For method chaining
     */
    encoding(encoding) {
        this.csvToJson.encoding = encoding;
        return this;
    }

    /**
     * Read a CSV file and write parsed JSON to an output file (async)
     * @param {string} fileInputName - Path to input CSV file
     * @param {string} fileOutputName - Path to output JSON file
     * @returns {Promise<void>}
     * @throws {FileOperationError} If file operations fail
     * @throws {CsvFormatError} If CSV is malformed
     */
    async generateJsonFileFromCsv(fileInputName, fileOutputName) {
        const jsonStringified = await this.getJsonFromCsvStringified(fileInputName);
        await fileUtils.writeFileAsync(jsonStringified, fileOutputName);
    }

    /**
     * Read a CSV file and return parsed data as stringified JSON (async)
     * @param {string} fileInputName - Path to input CSV file
     * @returns {Promise<string>} JSON stringified array of objects
     * @throws {FileOperationError} If file read fails
     * @throws {CsvFormatError} If CSV is malformed
     */
    async getJsonFromCsvStringified(fileInputName) {
        const json = await this.getJsonFromCsvAsync(fileInputName);
        return JSON.stringify(json, undefined, 1);
    }

    /**
     * Main async API method for reading CSV and returning parsed JSON
     * Supports reading from file path or parsing CSV string content
     * @param {string} inputFileNameOrCsv - File path or CSV string content
     * @param {object} options - Configuration options
     * @param {boolean} options.raw - If true, treats input as CSV string; if false, reads from file
     * @returns {Promise<Array<object>>} Array of objects representing CSV rows
     * @throws {InputValidationError} If input is invalid
     * @throws {FileOperationError} If file read fails
     * @throws {CsvFormatError} If CSV is malformed
     * @example
     * const csvToJson = require('convert-csv-to-json');
     * const data = await csvToJson.getJsonFromCsvAsync('resource/input.csv');
     * console.log(data);
     */
    async getJsonFromCsvAsync(inputFileNameOrCsv, options = {}) {
        if (inputFileNameOrCsv === null || inputFileNameOrCsv === undefined) {
            throw new InputValidationError(
                'inputFileNameOrCsv',
                'string (file path) or CSV string content',
                `${typeof inputFileNameOrCsv}`,
                'Either provide a valid file path or CSV content as a string.'
            );
        }

        if (options.raw) {
            if (inputFileNameOrCsv === '') {
                return [];
            }
            return this.csvToJson.csvToJson(inputFileNameOrCsv);
        }

        const parsedCsv = await fileUtils.readFileAsync(inputFileNameOrCsv, this.csvToJson.encoding || 'utf8');
        return this.csvToJson.csvToJson(parsedCsv);
    }

    /**
     * Parse CSV string to JSON array (async)
     * @param {string} csvString - CSV content as string
     * @param {object} options - Configuration options (default: { raw: true })
     * @returns {Promise<Array<object>>} Array of objects representing CSV rows
     * @throws {CsvFormatError} If CSV is malformed
     * @example
     * const csvToJson = require('convert-csv-to-json');
     * const data = await csvToJson.csvStringToJsonAsync('name,age\nAlice,30');
     * console.log(data);
     */
    csvStringToJsonAsync(csvString, options = { raw: true }) {
        return this.getJsonFromCsvAsync(csvString, options);
    }

    /**
     * Parse CSV from a Readable stream and return parsed data as JSON array
     * Processes data in chunks for memory-efficient handling of large files
     * @param {object} stream - Node.js Readable stream containing CSV data
     * @returns {Promise<Array<object>>} Promise resolving to array of objects representing CSV rows
     * @throws {InputValidationError} If stream is invalid
     * @throws {CsvFormatError} If CSV is malformed
     * @example
     * const fs = require('fs');
     * const csvToJson = require('convert-csv-to-json');
     * const stream = fs.createReadStream('large.csv');
     * const data = await csvToJson.getJsonFromStreamAsync(stream);
     * console.log(data);
     */
    async getJsonFromStreamAsync(stream) {
        this._validateStream(stream);

        return new Promise((resolve, reject) => {
            const streamProcessor = new StreamProcessor(this.csvToJson);

            stream.on('data', (chunk) => {
                try {
                    streamProcessor.processChunk(chunk);
                } catch (error) {
                    reject(error);
                }
            });

            stream.on('end', () => {
                try {
                    streamProcessor.finalizeProcessing();
                    const result = streamProcessor.getResult();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });

            stream.on('error', (error) => {
                reject(new FileOperationError(`Stream error: ${error.message}`));
            });
        });
    }

    /**
     * Validate that the provided stream is a valid Readable stream
     * @param {object} stream - The stream to validate
     * @throws {InputValidationError} If stream is invalid
     * @private
     */
    _validateStream(stream) {
        if (!stream || typeof stream.pipe !== 'function') {
            throw new InputValidationError(
                'stream',
                'Readable stream',
                typeof stream,
                'Provide a valid Node.js Readable stream.'
            );
        }
    }

    /**
     * Parse CSV from a file path using streaming for memory-efficient processing
     * @param {string} filePath - Path to the CSV file
     * @returns {Promise<Array<object>>} Promise resolving to array of objects representing CSV rows
     * @throws {InputValidationError} If filePath is invalid
     * @throws {FileOperationError} If file cannot be read
     * @throws {CsvFormatError} If CSV is malformed
     * @example
     * const csvToJson = require('convert-csv-to-json');
     * const data = await csvToJson.getJsonFromFileStreamingAsync('large.csv');
     * console.log(data);
     */
    async getJsonFromFileStreamingAsync(filePath) {
        if (!filePath || typeof filePath !== 'string') {
            throw new InputValidationError(
                'filePath',
                'string (file path)',
                typeof filePath,
                'Provide a valid file path as a string.'
            );
        }

        const fs = require('fs');
        const encoding = typeof this.csvToJson.encoding === 'string' ? this.csvToJson.encoding : 'utf8';
        const stream = fs.createReadStream(filePath, { encoding });
        return this.getJsonFromStreamAsync(stream);
    }
}

module.exports = new CsvToJsonAsync();