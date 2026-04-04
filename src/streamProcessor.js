/* globals CsvFormatError */
/**
 * @typedef {import('stream').Readable} Readable
 * @typedef {ReadableStream} ReadableStream
 */
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
     */
    constructor(csvConfig, options = {}) {
        this.csvConfig = csvConfig;
        this.isBrowser = options.isBrowser || (typeof window !== 'undefined' && typeof document !== 'undefined');
        this.buffer = '';
        this.isInsideQuotes = false;
        this.headers = null;
        this.headerRowIndex = csvConfig.getIndexHeader();
        this.currentRecordIndex = 0;
        this.parsedRecords = [];
        this.dataRowIndex = 0;
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
     * Process a stream directly (unified interface for both environments)
     * @param {Readable|ReadableStream} stream - The stream to process
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
            const row = this.csvConfig.buildJsonResult(this.headers, dataFields);
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
            return this.csvConfig.split(record);
        }
        return record.split(this.csvConfig.delimiter || ',');
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