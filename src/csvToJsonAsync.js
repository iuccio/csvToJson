/* globals CsvFormatError, FileOperationError */
'use strict';

const fileUtils = require('./util/fileUtils');
const stringUtils = require('./util/stringUtils');
const csvToJson = require('./csvToJson');
const { InputValidationError, CsvFormatError } = require('./util/errors');

const QUOTE_CHAR = '"';
const CRLF = '\r\n';
const LF = '\n';
const CR = '\r';

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
     * @param {Readable} stream - Node.js Readable stream containing CSV data
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
        if (!stream || typeof stream.pipe !== 'function') {
            throw new InputValidationError(
                'stream',
                'Readable stream',
                typeof stream,
                'Provide a valid Node.js Readable stream.'
            );
        }

        return new Promise((resolve, reject) => {
            const chunks = [];
            let buffer = '';
            let insideQuotes = false;
            let headers = null;
            let headerIndex = this.csvToJson.getIndexHeader();
            let jsonResult = [];
            let recordIndex = 0;

            stream.on('data', (chunk) => {
                buffer += chunk.toString();
                
                // Process complete records from buffer
                const records = this._parseRecordsFromBuffer(buffer, insideQuotes);
                buffer = records.remainingBuffer;
                insideQuotes = records.insideQuotes;

                // Process each complete record
                for (const record of records.completeRecords) {
                    try {
                        if (headers === null) {
                            // Try to find headers
                            const fields = this.csvToJson.isSupportQuotedField 
                                ? this.csvToJson.split(record)
                                : record.split(this.csvToJson.delimiter || ',');
                            
                            if (stringUtils.hasContent(fields)) {
                                headers = fields;
                                continue;
                            }
                        } else {
                            // Parse data row
                            const fields = this.csvToJson.isSupportQuotedField 
                                ? this.csvToJson.split(record)
                                : record.split(this.csvToJson.delimiter || ',');
                            
                            if (stringUtils.hasContent(fields)) {
                                let row = this.csvToJson.buildJsonResult(headers, fields);
                                
                                // Apply row mapper if defined
                                if (this.csvToJson.rowMapper) {
                                    row = this.csvToJson.rowMapper(row, recordIndex);
                                    recordIndex++;
                                    if (row != null) {
                                        jsonResult.push(row);
                                    }
                                } else {
                                    jsonResult.push(row);
                                    recordIndex++;
                                }
                            }
                        }
                    } catch (error) {
                        reject(error);
                        return;
                    }
                }
            });

            stream.on('end', () => {
                try {
                    // Process any remaining buffer
                    if (buffer.length > 0) {
                        if (insideQuotes) {
                            throw CsvFormatError.mismatchedQuotes('CSV stream');
                        }
                        
                        const records = this._parseRecordsFromBuffer(buffer + '\n', false);
                        for (const record of records.completeRecords) {
                            if (headers === null) {
                                const fields = this.csvToJson.isSupportQuotedField 
                                    ? this.csvToJson.split(record)
                                    : record.split(this.csvToJson.delimiter || ',');
                                
                                if (stringUtils.hasContent(fields)) {
                                    headers = fields;
                                }
                            } else {
                                const fields = this.csvToJson.isSupportQuotedField 
                                    ? this.csvToJson.split(record)
                                    : record.split(this.csvToJson.delimiter || ',');
                                
                                if (stringUtils.hasContent(fields)) {
                                    let row = this.csvToJson.buildJsonResult(headers, fields);
                                    
                                    if (this.csvToJson.rowMapper) {
                                        row = this.csvToJson.rowMapper(row, recordIndex);
                                        recordIndex++;
                                        if (row != null) {
                                            jsonResult.push(row);
                                        }
                                    } else {
                                        jsonResult.push(row);
                                        recordIndex++;
                                    }
                                }
                            }
                        }
                    }

                    // If no headers found and no data, return empty array (empty stream)
                    if (!headers && jsonResult.length === 0) {
                        resolve([]);
                        return;
                    }

                    if (!headers) {
                        throw CsvFormatError.missingHeader();
                    }

                    resolve(jsonResult);
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
     * Parse complete records from buffer, handling quoted fields across chunks
     * @param {string} buffer - Current buffer content
     * @param {boolean} insideQuotes - Whether we're currently inside quotes from previous chunk
     * @returns {object} Object with completeRecords array and remaining buffer/quote state
     * @private
     */
    _parseRecordsFromBuffer(buffer, insideQuotes) {
        const completeRecords = [];
        let currentRecord = '';
        let i = 0;

        while (i < buffer.length) {
            const char = buffer[i];

            // Handle quote characters
            if (char === QUOTE_CHAR) {
                if (insideQuotes && i + 1 < buffer.length && buffer[i + 1] === QUOTE_CHAR) {
                    // Escaped quote: two consecutive quotes = single quote representation
                    currentRecord += QUOTE_CHAR + QUOTE_CHAR;
                    i += 2;
                } else {
                    // Toggle quote state
                    insideQuotes = !insideQuotes;
                    currentRecord += char;
                    i++;
                }
                continue;
            }

            // Handle line endings (only outside quoted fields)
            if (!insideQuotes) {
                let lineEndingLength = this._getLineEndingLength(buffer, i);
                if (lineEndingLength > 0) {
                    completeRecords.push(currentRecord);
                    currentRecord = '';
                    i += lineEndingLength;
                    continue;
                }
            }

            // Regular character
            currentRecord += char;
            i++;
        }

        return {
            completeRecords,
            remainingBuffer: currentRecord,
            insideQuotes
        };
    }

    /**
     * Get the length of line ending at current position
     * @param {string} content - Content to check
     * @param {number} index - Current index
     * @returns {number} Length of line ending
     * @private
     */
    _getLineEndingLength(content, index) {
        if (content.slice(index, index + 2) === CRLF) {
            return 2;
        }
        if (content[index] === LF) {
            return 1;
        }
        if (content[index] === CR && content[index + 1] !== LF) {
            return 1;
        }
        return 0;
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