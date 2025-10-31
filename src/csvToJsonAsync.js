'use strict';

const fileUtils = require('./util/fileUtils');
const csvToJson = require('./csvToJson');

class CsvToJsonAsync {
    constructor() {
        // Proxy the configuration methods to the sync instance
        this.csvToJson = csvToJson;
    }

    /**
     * Set value type formatting
     */
    formatValueByType(active) {
        this.csvToJson.formatValueByType(active);
        return this;
    }

    /**
     * Set quoted field support
     */
    supportQuotedField(active) {
        this.csvToJson.supportQuotedField(active);
        return this;
    }

    /**
     * Set field delimiter
     */
    fieldDelimiter(delimiter) {
        this.csvToJson.fieldDelimiter(delimiter);
        return this;
    }

    /**
     * Trim header field whitespace
     */
    trimHeaderFieldWhiteSpace(active) {
        this.csvToJson.trimHeaderFieldWhiteSpace(active);
        return this;
    }

    /**
     * Set header index
     */
    indexHeader(indexHeader) {
        this.csvToJson.indexHeader(indexHeader);
        return this;
    }

    /**
     * Set sub-array parsing options
     */
    parseSubArray(delimiter = '*', separator = ',') {
        this.csvToJson.parseSubArray(delimiter, separator);
        return this;
    }

    /**
     * Set encoding
     */
    encoding(encoding) {
        this.csvToJson.encoding = encoding;
        return this;
    }

    /**
     * Async version of generateJsonFileFromCsv
     */
    async generateJsonFileFromCsv(fileInputName, fileOutputName) {
        const jsonStringified = await this.getJsonFromCsvStringified(fileInputName);
        await fileUtils.writeFileAsync(jsonStringified, fileOutputName);
    }

    /**
     * Async version that returns stringified JSON from CSV file
     */
    async getJsonFromCsvStringified(fileInputName) {
        const json = await this.getJsonFromCsvAsync(fileInputName);
        return JSON.stringify(json, undefined, 1);
    }

    /**
     * Main async API method. If options.raw is true, treats input as CSV string.
     * Otherwise reads from file path.
     */
    async getJsonFromCsvAsync(inputFileNameOrCsv, options = {}) {
        if (inputFileNameOrCsv === null || inputFileNameOrCsv === undefined) {
            throw new Error('inputFileNameOrCsv is not defined!!!');
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
     * Parse CSV string to JSON asynchronously
     */
    csvStringToJsonAsync(csvString, options = { raw: true }) {
        return this.getJsonFromCsvAsync(csvString, options);
    }

    /**
     * Parse CSV string to stringified JSON asynchronously
     */
    async csvStringToJsonStringifiedAsync(csvString) {
        const json = await this.csvStringToJsonAsync(csvString);
        return JSON.stringify(json, undefined, 1);
    }
}

module.exports = new CsvToJsonAsync();