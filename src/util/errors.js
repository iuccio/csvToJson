'use strict';

/**
 * Custom error classes following clean code principles
 * Provides clear, actionable error messages with context
 * @category Error Classes
 */

/**
 * Base class for all CSV parsing errors
 * Provides consistent error formatting and context
 * @category Error Classes
 */
class CsvParsingError extends Error {
    /**
     * Create a CSV parsing error
     * @param {string} message - Error message
     * @param {string} code - Error code for identification
     * @param {object} context - Additional context information (default: {})
     */
    constructor(message, code, context = {}) {
        super(message);
        this.name = 'CsvParsingError';
        this.code = code;
        this.context = context;
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Convert error to formatted string with context information
     * @returns {string} Formatted error message including context
     */
    toString() {
        let output = `${this.name}: ${this.message}`;
        
        if (this.context && Object.keys(this.context).length > 0) {
            output += '\n\nContext:';
            Object.entries(this.context).forEach(([key, value]) => {
                output += `\n  ${key}: ${this.formatValue(value)}`;
            });
        }
        
        return output;
    }

    /**
     * Format a context value for display in error message
     * @param {unknown} value - Value to format
     * @returns {string} Formatted value string
     * @private
     */
    formatValue(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'string') return `"${value}"`;
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }
}

/**
 * Input validation errors
 * Thrown when function parameters don't meet expected type or value requirements
 * @category Error Classes
 */
class InputValidationError extends CsvParsingError {
    /**
     * Create an input validation error
     * @param {string} paramName - Name of the invalid parameter
     * @param {string} expectedType - Expected type description
     * @param {string} receivedType - Actual type received
     * @param {string} details - Additional error details (optional)
     */
    constructor(paramName, expectedType, receivedType, details = '') {
        const message = 
            `Invalid input: Parameter '${paramName}' is required.\n` +
            `Expected: ${expectedType}\n` +
            `Received: ${receivedType}${details ? '\n' + details : ''}`;
        
        super(message, 'INPUT_VALIDATION_ERROR', {
            parameter: paramName,
            expectedType,
            receivedType
        });
        this.name = 'InputValidationError';
    }
}

/**
 * Configuration-related errors
 * Thrown when configuration options conflict or are invalid
 * @category Error Classes
 */
class ConfigurationError extends CsvParsingError {
    /**
     * Create a configuration error
     * @param {string} message - Error message
     * @param {object} conflictingOptions - Configuration options in conflict (optional)
     */
    constructor(message, conflictingOptions = {}) {
        super(message, 'CONFIGURATION_ERROR', conflictingOptions);
        this.name = 'ConfigurationError';
    }

    /**
     * Create error for quoted field configuration conflict
     * Occurs when quote character is used as delimiter while quoted fields are enabled
     * @param {string} optionName - Name of the conflicting option
     * @param {string} value - Value that causes the conflict
     * @returns {ConfigurationError} Configured error instance
     * @static
     */
    static quotedFieldConflict(optionName, value) {
        return new ConfigurationError(
            `Configuration conflict: supportQuotedField() is enabled, but ${optionName} is set to '${value}'.\n` +
            `The quote character (") cannot be used as a field delimiter, separator, or sub-array delimiter when quoted field support is active.\n\n` +
            `Solutions:\n` +
            `  1. Use a different character for ${optionName} (e.g., '|', '\\t', ';')\n` +
            `  2. Disable supportQuotedField() if your CSV doesn't contain quoted fields\n` +
            `  3. Refer to RFC 4180 for proper CSV formatting: https://tools.ietf.org/html/rfc4180`,
            { optionName, value, conflictingOption: 'supportQuotedField' }
        );
    }

    /**
     * Create error for invalid header index
     * Occurs when indexHeader() receives non-numeric value
     * @param {unknown} value - Invalid header index value
     * @returns {ConfigurationError} Configured error instance
     * @static
     */
    static invalidHeaderIndex(value) {
        return new ConfigurationError(
            `Invalid configuration: indexHeader() expects a numeric value.\n` +
            `Received: ${typeof value} (${value})\n\n` +
            `Solutions:\n` +
            `  1. Ensure indexHeader() receives a number: indexHeader(0), indexHeader(1), etc.\n` +
            `  2. Headers are typically found on row 0 (first line)\n` +
            `  3. Use indexHeader(2) if headers are on the 3rd line`,
            { parameterName: 'indexHeader', value, type: typeof value }
        );
    }
}

/**
 * CSV parsing errors with detailed context
 * Thrown when CSV format is invalid or malformed
 * @category Error Classes
 */
class CsvFormatError extends CsvParsingError {
    /**
     * Create a CSV format error
     * @param {string} message - Error message
     * @param {object} context - Additional context information (optional)
     */
    constructor(message, context = {}) {
        super(message, 'CSV_FORMAT_ERROR', context);
        this.name = 'CsvFormatError';
    }

    /**
     * Create error for missing CSV header row
     * Occurs when no valid header row is found in CSV
     * @returns {CsvFormatError} Configured error instance
     * @static
     */
    static missingHeader() {
        return new CsvFormatError(
            `CSV parsing error: No header row found.\n` +
            `The CSV file appears to be empty or has no valid header line.\n\n` +
            `Solutions:\n` +
            `  1. Ensure your CSV file contains at least one row (header row)\n` +
            `  2. Verify the file is not empty or contains only whitespace\n` +
            `  3. Check if you need to use indexHeader(n) to specify a non-standard header row\n` +
            `  4. Refer to RFC 4180 for proper CSV format: https://tools.ietf.org/html/rfc4180`
        );
    }

    /**
     * Create error for mismatched quotes in CSV
     * Occurs when quoted fields are not properly closed
     * @param {string} location - Where the error occurred (default: 'CSV')
     * @returns {CsvFormatError} Configured error instance
     * @static
     */
    static mismatchedQuotes(location = 'CSV') {
        return new CsvFormatError(
            `CSV parsing error: Mismatched quotes detected in ${location}.\n` +
            `A quoted field was not properly closed with a matching quote character.\n\n` +
            `RFC 4180 rules for quoted fields:\n` +
            `  • Fields containing delimiters or quotes MUST be enclosed in double quotes\n` +
            `  • To include a quote within a quoted field, use two consecutive quotes: ""\n` +
            `  • Example: "Smith, John" (name contains comma)\n` +
            `  • Example: "He said ""Hello""" (text contains quotes)\n\n` +
            `Solutions:\n` +
            `  1. Review your CSV for properly paired quote characters\n` +
            `  2. Use double quotes ("") to escape quotes within quoted fields\n` +
            `  3. Ensure all commas within field values are inside quotes\n` +
            `  4. Enable supportQuotedField(true) if you're using quoted fields`,
            { location }
        );
    }
}

/**
 * File operation errors
 * Thrown when file read or write operations fail
 * @category Error Classes
 */
class FileOperationError extends CsvParsingError {
    /**
     * Create a file operation error
     * @param {string} operation - Type of operation that failed (e.g., 'read', 'write')
     * @param {string} filePath - Path to the file where operation failed
     * @param {Error} originalError - The underlying error object from Node.js
     */
    constructor(operation, filePath, originalError) {
        const message = 
            `File operation error: Failed to ${operation} file.\n` +
            `File path: ${filePath}\n` +
            `Reason: ${originalError.message}\n\n` +
            `Solutions:\n` +
            `  1. Verify the file path is correct: ${filePath}\n` +
            `  2. Check file permissions (read access for input, write access for output)\n` +
            `  3. Ensure the directory exists and is writable for output files\n` +
            `  4. Verify the file is not in use by another process`;
        
        super(message, 'FILE_OPERATION_ERROR', {
            operation,
            filePath,
            originalError: originalError.message
        });
        this.name = 'FileOperationError';
        this.originalError = originalError;
    }
}

/**
 * JSON validation errors
 * Thrown when parsed CSV data cannot be converted to valid JSON
 * @category Error Classes
 */
class JsonValidationError extends CsvParsingError {
    /**
     * Create a JSON validation error
     * @param {string} csvData - The CSV data that failed validation
     * @param {Error} originalError - The underlying JSON parsing error
     */
    constructor(csvData, originalError) {
        const message = 
            `JSON validation error: The parsed CSV data generated invalid JSON.\n` +
            `This typically indicates malformed field names or values in the CSV.\n` +
            `Original error: ${originalError.message}\n\n` +
            `Solutions:\n` +
            `  1. Check that field names are valid JavaScript identifiers (or will be converted safely)\n` +
            `  2. Review the CSV data for special characters that aren't properly escaped\n` +
            `  3. Enable supportQuotedField(true) for fields containing special characters\n` +
            `  4. Verify that formatValueByType() isn't converting values incorrectly`;
        
        super(message, 'JSON_VALIDATION_ERROR', {
            originalError: originalError.message,
            csvPreview: csvData ? csvData.substring(0, 200) : 'N/A'
        });
        this.name = 'JsonValidationError';
        this.originalError = originalError;
    }
}

/**
 * Browser-specific errors
 * Thrown when browser API operations fail
 * @category Error Classes
 */
class BrowserApiError extends CsvParsingError {
    /**
     * Create a browser API error
     * @param {string} message - Error message
     * @param {object} context - Additional context information (optional)
     */
    constructor(message, context = {}) {
        super(message, 'BROWSER_API_ERROR', context);
        this.name = 'BrowserApiError';
    }

    /**
     * Create error for unavailable FileReader API
     * Occurs when browser doesn't support FileReader
     * @returns {BrowserApiError} Configured error instance
     * @static
     */
    static fileReaderNotAvailable() {
        return new BrowserApiError(
            `Browser compatibility error: FileReader API is not available.\n` +
            `Your browser does not support the FileReader API required for file parsing.\n\n` +
            `Solutions:\n` +
            `  1. Use a modern browser that supports FileReader (Chrome 13+, Firefox 10+, Safari 6+)\n` +
            `  2. Consider using csvStringToJson() or csvStringToJsonAsync() for string-based parsing\n` +
            `  3. Implement a polyfill or alternative file reading method`
        );
    }

    /**
     * Create error for file parsing failure in browser
     * Occurs when file read or CSV parse fails
     * @param {Error} originalError - The underlying error that occurred
     * @returns {BrowserApiError} Configured error instance
     * @static
     */
    static parseFileError(originalError) {
        return new BrowserApiError(
            `Browser file parsing error: Failed to read and parse the file.\n` +
            `Error details: ${originalError.message}\n\n` +
            `Solutions:\n` +
            `  1. Verify the file is a valid CSV file\n` +
            `  2. Check the file encoding (UTF-8 is recommended)\n` +
            `  3. Try a smaller file to isolate the issue\n` +
            `  4. Check browser console for additional error details`,
            { originalError: originalError.message }
        );
    }
}

module.exports = {
    CsvParsingError,
    InputValidationError,
    ConfigurationError,
    CsvFormatError,
    FileOperationError,
    JsonValidationError,
    BrowserApiError
};
