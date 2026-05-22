/* globals CsvFormatError */
'use strict';

const stringUtils = require('./util/stringUtils');

const QUOTE_CHAR = '"';
const CRLF = '\r\n';
const LF = '\n';
const CR = '\r';

/**
 * Handles the processing of CSV data from a stream
 * Encapsulates all stream processing logic following single responsibility principle
 * Works with both Node.js streams and browser ReadableStream
 * @private
 */
class StreamProcessor {
    /**
     * Initialize the stream processor with CSV configuration
     * @param {object} csvConfig - The CSV configuration object
     * @param {object} options - Environment options
     * @param {boolean} options.isBrowser - Whether running in browser environment
     * @param {number} options.chunkSize - Number of rows per chunk for callback processing
     * @param {function(Array<object>, number, number): void} [options.onChunk] - Callback for each chunk
     * @param {function(Array<object>): void} [options.onComplete] - Callback when processing complete
     * @param {function(Error): void} [options.onError] - Callback for errors
     */
    constructor(csvConfig, options = {}) {
        this.csvConfig = csvConfig;
        this.isBrowser = options.isBrowser || (typeof window !== 'undefined' && typeof document !== 'undefined');
        this.buffer = '';
        this.isInsideQuotes = false;
        this.headers = null;
        this.headerRowIndex = csvConfig.indexHeaderValue !== null && !isNaN(csvConfig.indexHeaderValue)
            ? csvConfig.indexHeaderValue
            : 0;
        this.currentRecordIndex = 0;
        this.parsedRecords = [];
        this.dataRowIndex = 0;
        this.ignoredIndexes = new Set(csvConfig.indexesToIgnore || []);

        // Chunked processing options
        this.chunkSize = options.chunkSize || 1000;
        this.onChunk = options.onChunk;
        this.onComplete = options.onComplete;
        this.onError = options.onError;
        this.allRecords = []; // For collecting all records when using callbacks
    }

    /**
     * Process a chunk of data from the stream
     * @param {Buffer|string|Uint8Array} chunk - The data chunk to process
     */
    processChunk(chunk) {
        // Convert chunk to string, handling both Node.js Buffers and browser Uint8Array
        let chunkString;
        if (typeof chunk === 'string') {
            chunkString = chunk;
        } else if (this.isBrowser && typeof globalThis.TextDecoder !== 'undefined') {
            chunkString = new globalThis.TextDecoder().decode(chunk);
        } else if (this.isBrowser) {
            // Fallback for older browsers without TextDecoder
            chunkString = String.fromCharCode.apply(null, new Uint8Array(chunk));
        } else {
            // Node.js environment
            chunkString = chunk.toString();
        }

        this.buffer += chunkString;
        this._processCompleteRecords();
    }

    /**
     * Process a stream with chunked callbacks (for large files)
     * @param {object} stream - The stream to process (Node.js Readable or browser ReadableStream)
     * @returns {Promise<void>} Promise that resolves when streaming starts
     */
    async processStreamWithCallbacks(stream) {
        return new Promise((resolve, reject) => {
            if (this.isBrowser) {
                // Browser ReadableStream
                if (!stream || typeof stream.getReader !== 'function') {
                    const error = new Error('Invalid ReadableStream provided');
                    if (this.onError) this.onError(error);
                    reject(error);
                    return;
                }

                const reader = stream.getReader();

                const processChunk = async () => {
                    try {
                        while (true) {
                            const { done, value } = await reader.read();

                            if (done) {
                                this.finalizeProcessing();
                                this._sendRemainingChunks();
                                if (this.onComplete) this.onComplete(this.allRecords);
                                resolve();
                                return;
                            }

                            this.processChunk(value);
                            this._sendPendingChunks();
                        }
                    } catch (error) {
                        if (this.onError) this.onError(error);
                        reject(error);
                    }
                };

                processChunk();
            } else {
                // Node.js Readable stream
                if (!stream || typeof stream.pipe !== 'function') {
                    const error = new Error('Invalid Readable stream provided');
                    if (this.onError) this.onError(error);
                    reject(error);
                    return;
                }

                stream.on('data', (chunk) => {
                    try {
                        this.processChunk(chunk);
                        this._sendPendingChunks();
                    } catch (error) {
                        if (this.onError) this.onError(error);
                        reject(error);
                    }
                });

                stream.on('end', () => {
                    try {
                        this.finalizeProcessing();
                        this._sendRemainingChunks();
                        if (this.onComplete) this.onComplete(this.allRecords);
                        resolve();
                    } catch (error) {
                        if (this.onError) this.onError(error);
                        reject(error);
                    }
                });

                stream.on('error', (error) => {
                    if (this.onError) this.onError(error);
                    reject(error);
                });
            }
        });
    }

    /**
     * Send pending chunks when they reach the chunk size
     * @private
     */
    _sendPendingChunks() {
        if (!this.onChunk) return;

        while (this.parsedRecords.length >= this.chunkSize) {
            const chunk = this.parsedRecords.splice(0, this.chunkSize);
            this.allRecords.push(...chunk);
            this.onChunk(chunk, this.allRecords.length, null); // null for total when streaming
        }
    }

    /**
     * Send any remaining chunks at the end of processing
     * @private
     */
    _sendRemainingChunks() {
        if (!this.onChunk || this.parsedRecords.length === 0) return;

        const chunk = [...this.parsedRecords];
        this.parsedRecords.length = 0; // Clear the array
        this.allRecords.push(...chunk);
        this.onChunk(chunk, this.allRecords.length, this.allRecords.length);
    }

    /**
     * Process a stream directly (unified interface for both environments)
     * @param {object} stream - The stream to process (Node.js Readable or browser ReadableStream)
     * @returns {Promise<Array<object>>} Promise resolving to parsed records
     */
    async processStream(stream) {
        return new Promise((resolve, reject) => {
            if (this.isBrowser) {
                // Browser ReadableStream
                if (!stream || typeof stream.getReader !== 'function') {
                    reject(new Error('Invalid ReadableStream provided'));
                    return;
                }

                const reader = stream.getReader();

                const processChunk = async () => {
                    try {
                        while (true) {
                            const { done, value } = await reader.read();

                            if (done) {
                                this.finalizeProcessing();
                                resolve(this.getResult());
                                return;
                            }

                            this.processChunk(value);
                        }
                    } catch (error) {
                        reject(error);
                    }
                };

                processChunk();
            } else {
                // Node.js Readable stream
                if (!stream || typeof stream.pipe !== 'function') {
                    reject(new Error('Invalid Readable stream provided'));
                    return;
                }

                stream.on('data', (chunk) => {
                    try {
                        this.processChunk(chunk);
                    } catch (error) {
                        reject(error);
                    }
                });

                stream.on('end', () => {
                    try {
                        this.finalizeProcessing();
                        resolve(this.getResult());
                    } catch (error) {
                        reject(error);
                    }
                });

                stream.on('error', (error) => {
                    reject(error);
                });
            }
        });
    }

    /**
     * Finalize processing when the stream ends
     */
    finalizeProcessing() {
        this._processRemainingBuffer();
        this._validateProcessingResult();
    }

    /**
     * Get the final processed result
     * @returns {Array<object>} Array of parsed JSON objects
     */
    getResult() {
        return this.parsedRecords;
    }

    /**
     * Process all complete records currently in the buffer
     * @private
     */
    _processCompleteRecords() {
        const parseResult = this._parseRecordsFromBuffer(this.buffer, this.isInsideQuotes);

        this.buffer = parseResult.remainingBuffer;
        this.isInsideQuotes = parseResult.isInsideQuotes;

        for (const record of parseResult.completeRecords) {
            this._processRecord(record);
            this.currentRecordIndex++;
        }
    }

    /**
     * Process any remaining buffer content when stream ends
     * @private
     */
    _processRemainingBuffer() {
        if (this.buffer.length > 0) {
            if (this.isInsideQuotes) {
                throw CsvFormatError.mismatchedQuotes('CSV stream');
            }

            const parseResult = this._parseRecordsFromBuffer(this.buffer + '\n', false);

            for (const record of parseResult.completeRecords) {
                this._processRecord(record);
                this.currentRecordIndex++;
            }
        }
    }

    /**
     * Process a single CSV record
     * @param {string} record - The CSV record to process
     * @private
     */
    _processRecord(record) {
        if (this.headers === null && this.currentRecordIndex === this.headerRowIndex) {
            this._processHeaderRecord(record);
        } else if (this.headers !== null) {
            this._processDataRecord(record);
        }
    }

    /**
     * Process a header record
     * @param {string} record - The header record
     * @private
     */
    _processHeaderRecord(record) {
        const headerFields = this._splitRecord(record);
        if (stringUtils.hasContent(headerFields)) {
            this.headers = headerFields;
        }
    }

    /**
     * Process a data record
     * @param {string} record - The data record
     * @private
     */
    _processDataRecord(record) {
        const dataFields = this._splitRecord(record);
        if (stringUtils.hasContent(dataFields)) {
            const row = this._buildJsonResult(this.headers, dataFields);
            const processedRow = this._applyRowMapper(row);
            if (processedRow !== null) {
                this.parsedRecords.push(processedRow);
            }
        }
    }

    /**
     * Apply row mapper function if configured
     * @param {object} row - The parsed row object
     * @returns {object|null} The processed row or null if filtered out
     * @private
     */
    _applyRowMapper(row) {
        if (this.csvConfig.rowMapper) {
            const mappedRow = this.csvConfig.rowMapper(row, this.dataRowIndex);
            this.dataRowIndex++;
            return mappedRow;
        }
        this.dataRowIndex++;
        return row;
    }

    /**
     * Split a CSV record into fields based on configuration
     * @param {string} record - The record to split
     * @returns {string[]} Array of field values
     * @private
     */
    _splitRecord(record) {
        if (this.csvConfig.isSupportQuotedField) {
            return this._splitWithConfig(record, this.csvConfig);
        }
        return record.split(this.csvConfig.delimiter || ',');
    }

    /**
     * Split a CSV line into fields using parser configuration rules
     * @param {string} line - The CSV line to split
     * @param {object} config - The CSV parser configuration object
     * @returns {string[]} Array of parsed field values
     * @private
     */
    _splitWithConfig(line, config) {
        if (line.length === 0) {
            return [];
        }

        const fields = [];
        let currentField = '';
        let insideQuotes = false;
        const delimiter = config.delimiter || ',';

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === QUOTE_CHAR) {
                if (insideQuotes && i + 1 < line.length && line[i + 1] === QUOTE_CHAR) {
                    currentField += QUOTE_CHAR;
                    i++;
                } else {
                    insideQuotes = !insideQuotes;
                }
            } else if (char === delimiter && !insideQuotes) {
                fields.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
        }

        fields.push(currentField);

        if (insideQuotes) {
            throw CsvFormatError.mismatchedQuotes('row');
        }

        return fields;
    }

    /**
     * Convert a parsed CSV row into a JSON object using header names
     * @param {string[]} headers - Array of header names
     * @param {string[]} currentLine - Array of field values for the current row
     * @returns {object} Parsed row object keyed by header names
     * @private
     */
    _buildJsonResult(headers, currentLine) {
        const jsonObject = {};
        for (let j = 0; j < headers.length; j++) {
            if (this.ignoredIndexes.has(j)) {
                continue;
            }

            const propertyName = stringUtils.trimPropertyName(this.csvConfig.isTrimHeaderFieldWhiteSpace, headers[j]);
            let value = currentLine[j];

            if (this._isParseSubArray(value)) {
                value = this._buildJsonSubArray(value);
            }

            if (this.csvConfig.printValueFormatByType && !Array.isArray(value)) {
                value = stringUtils.getValueFormatByType(currentLine[j]);
            }

            jsonObject[propertyName] = value;
        }
        return jsonObject;
    }

    /**
     * Determine whether a field value represents a sub-array expression
     * @param {string} value - The field value to inspect
     * @returns {boolean} True when the value is wrapped in the configured sub-array delimiters
     * @private
     */
    _isParseSubArray(value) {
        if (this.csvConfig.parseSubArrayDelimiter) {
            return value && (value.indexOf(this.csvConfig.parseSubArrayDelimiter) === 0 && value.lastIndexOf(this.csvConfig.parseSubArrayDelimiter) === value.length - 1);
        }
        return false;
    }

    /**
     * Parse a field value into a JSON sub-array based on configured delimiters and separators
     * @param {string} value - The quoted sub-array string to parse
     * @returns {Array<string|number|boolean>} Parsed sub-array values
     * @private
     */
    _buildJsonSubArray(value) {
        const extractedValues = value.substring(
            value.indexOf(this.csvConfig.parseSubArrayDelimiter) + 1,
            value.lastIndexOf(this.csvConfig.parseSubArrayDelimiter)
        );
        const items = extractedValues.split(this.csvConfig.parseSubArraySeparator);

        if (this.csvConfig.printValueFormatByType) {
            for (let i = 0; i < items.length; i++) {
                items[i] = stringUtils.getValueFormatByType(items[i]);
            }
        }

        return items;
    }

    /**
     * Parse complete records from buffer, handling quoted fields across chunks
     * @param {string} buffer - Current buffer content
     * @param {boolean} insideQuotes - Whether we're currently inside quotes
     * @returns {object} Object with completeRecords array and remaining buffer/quote state
     * @private
     */
    _parseRecordsFromBuffer(buffer, insideQuotes) {
        const completeRecords = [];
        let currentRecord = '';
        let i = 0;

        while (i < buffer.length) {
            const char = buffer[i];

            if (char === QUOTE_CHAR) {
                const escapedQuoteResult = this._handleEscapedQuote(buffer, i, insideQuotes);
                if (escapedQuoteResult.wasEscaped) {
                    currentRecord += QUOTE_CHAR + QUOTE_CHAR;
                    i = escapedQuoteResult.newIndex;
                    continue;
                } else {
                    insideQuotes = !insideQuotes;
                }
            } else if (!insideQuotes && this._isLineEnding(buffer, i)) {
                const lineEndingLength = this._getLineEndingLength(buffer, i);
                completeRecords.push(currentRecord);
                currentRecord = '';
                i += lineEndingLength;
                continue;
            }

            currentRecord += char;
            i++;
        }

        return {
            completeRecords,
            remainingBuffer: currentRecord,
            isInsideQuotes: insideQuotes
        };
    }

    /**
     * Handle escaped quotes in quoted fields
     * @param {string} buffer - The buffer content
     * @param {number} index - Current index in buffer
     * @param {boolean} insideQuotes - Whether currently inside quotes
     * @returns {object} Result indicating if quote was escaped and new index
     * @private
     */
    _handleEscapedQuote(buffer, index, insideQuotes) {
        if (insideQuotes && index + 1 < buffer.length && buffer[index + 1] === QUOTE_CHAR) {
            return { wasEscaped: true, newIndex: index + 2 };
        }
        return { wasEscaped: false, newIndex: index + 1 };
    }

    /**
     * Check if character at index is a line ending
     * @param {string} buffer - The buffer content
     * @param {number} index - Current index
     * @returns {boolean} True if line ending
     * @private
     */
    _isLineEnding(buffer, index) {
        return this._getLineEndingLength(buffer, index) > 0;
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
     * Validate the final processing result
     * @private
     */
    _validateProcessingResult() {
        if (!this.headers && this.parsedRecords.length === 0) {
            // Empty stream - this is OK
            return;
        }

        if (!this.headers) {
            throw CsvFormatError.missingHeader();
        }
    }
}

module.exports = StreamProcessor;