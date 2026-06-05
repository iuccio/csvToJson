/* globals FileOperationError */
'use strict';

const fileUtils = require('./util/fileUtils');
const jsonToCsv = require('./jsonToCsv');
const Configurable = require('./core/configurable');
const { InputValidationError, JsonValidationError } = require('./core/errors');

/**
 * Asynchronous JSON to CSV converter
 * Provides async file I/O methods and isolated parser configuration
 * @category 3-Async
 */
class JsonToCsvAsync extends Configurable {
    /**
     * Constructor initializes proxy to sync jsonToCsv instance
     */
    constructor() {
        super();
        this.jsonToCsv = jsonToCsv;
    }

    /**
     * Convert JSON array and write to CSV file (async)
     * @param {Array<object>} jsonData - Array of objects to convert
     * @param {string} fileOutputName - Path to output CSV file
     * @returns {Promise<void>}
     * @throws {InputValidationError} If jsonData is invalid
     * @throws {FileOperationError} If file write fails
     * @example
     * const jsonToCsvAsync = require('convert-csv-to-json').jsonToCsvAsync;
     * const data = [{name: 'Alice', age: 30}, {name: 'Bob', age: 25}];
     * await jsonToCsvAsync.generateCsvFileFromJson(data, 'output.csv');
     */
    async generateCsvFileFromJson(jsonData, fileOutputName) {
        const csv = this.jsonToCsvStringified(jsonData);
        await fileUtils.writeFileAsync(csv, fileOutputName);
    }

    /**
     * Read JSON file and generate CSV file (async)
     * @param {string} fileInputName - Path to input JSON file
     * @param {string} fileOutputName - Path to output CSV file
     * @returns {Promise<void>}
     * @throws {FileOperationError} If file operations fail
     * @throws {JsonValidationError} If JSON is invalid
     * @example
     * const jsonToCsvAsync = require('convert-csv-to-json').jsonToCsvAsync;
     * await jsonToCsvAsync.generateCsvFileFromJsonFile('input.json', 'output.csv');
     */
    async generateCsvFileFromJsonFile(fileInputName, fileOutputName) {
        const csv = await this.getCsvFromJson(fileInputName);
        await fileUtils.writeFileAsync(csv, fileOutputName);
    }

    /**
     * Read JSON file and return converted CSV string (async)
     * @param {string} fileInputName - Path to input JSON file
     * @returns {Promise<string>} CSV formatted string
     * @throws {FileOperationError} If file read fails
     * @throws {JsonValidationError} If JSON is invalid
     * @example
     * const jsonToCsvAsync = require('convert-csv-to-json').jsonToCsvAsync;
     * const csv = await jsonToCsvAsync.getCsvFromJson('data.json');
     * console.log(csv);
     */
    async getCsvFromJson(fileInputName) {
        const config = this.getParserConfig();
        const jsonString = await fileUtils.readFileAsync(fileInputName, config.encoding || 'utf8');
        let jsonData;
        try {
            jsonData = JSON.parse(jsonString);
        } catch (err) {
            throw new JsonValidationError(jsonString, err);
        }
        return this.jsonToCsvStringified(jsonData);
    }

    /**
     * Convert JSON array to CSV string
     * Synchronous method - returns a Promise for consistency with async pattern
     * @param {Array<object>} jsonData - Array of objects to convert
     * @returns {string} CSV formatted string
     * @throws {InputValidationError} If jsonData is not valid
     * @example
     * const jsonToCsvAsync = require('convert-csv-to-json').jsonToCsvAsync;
     * const data = [{name: 'Alice', age: 30}, {name: 'Bob', age: 25}];
     * const csv = jsonToCsvAsync.jsonToCsvStringified(data);
     * console.log(csv);
     */
    jsonToCsvStringified(jsonData) {
        const config = this.getParserConfig();
        return this.jsonToCsv.jsonToCsvWithConfig(jsonData, config);
    }

    /**
     * Convert JSON array from raw string/data asynchronously
     * @param {string|Array} input - JSON string or array of objects
     * @param {object} [options] - Configuration options
     * @param {boolean} [options.raw] - If true, treats input as JSON data; if false, reads from file
     * @returns {Promise<string>} CSV formatted string
     * @throws {InputValidationError} If input is invalid
     * @throws {JsonValidationError} If JSON parsing fails
     * @example
     * const jsonToCsvAsync = require('convert-csv-to-json').jsonToCsvAsync;
     * const jsonString = '[{"name":"Alice","age":30}]';
     * const csv = await jsonToCsvAsync.jsonToCsvAsync(jsonString, {raw: true});
     */
    async jsonToCsvAsync(input, options) {
        if (options && options.raw) {
            // Input is raw JSON string or already parsed data
            let jsonData;
            if (typeof input === 'string') {
                try {
                    jsonData = JSON.parse(input);
                } catch (err) {
                    throw new JsonValidationError(input, err);
                }
            } else {
                jsonData = input;
            }
            return this.jsonToCsvStringified(jsonData);
        } else {
            // Input is file path
            return this.getCsvFromJson(input);
        }
    }

}

module.exports = new JsonToCsvAsync();
