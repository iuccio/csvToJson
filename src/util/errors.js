'use strict';

/**
 * Custom error classes following clean code principles
 * Provides clear, actionable error messages with context
 */

/**
 * Base class for all CSV parsing errors
 * Provides consistent error formatting and context
 */
class CsvParsingError extends Error {
    constructor(message, code, context = {}) {
        super(message);
        this.name = 'CsvParsingError';
        this.code = code;
        this.context = context;
        Error.captureStackTrace(this, this.constructor);
    }

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
 */
class InputValidationError extends CsvParsingError {
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
 */
class ConfigurationError extends CsvParsingError {
    constructor(message, conflictingOptions = {}) {
        super(message, 'CONFIGURATION_ERROR', conflictingOptions);
        this.name = 'ConfigurationError';
    }

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
 */
class CsvFormatError extends CsvParsingError {
    constructor(message, context = {}) {
        super(message, 'CSV_FORMAT_ERROR', context);
        this.name = 'CsvFormatError';
    }

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
 */
class FileOperationError extends CsvParsingError {
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
 */
class JsonValidationError extends CsvParsingError {
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
 */
class BrowserApiError extends CsvParsingError {
    constructor(message, context = {}) {
        super(message, 'BROWSER_API_ERROR', context);
        this.name = 'BrowserApiError';
    }

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
