'use strict';

/**
 * String processing utilities for CSV parsing
 * @category Utilities
 */
class StringUtils {
    // Regular expressions as constants for better maintainability
    static PATTERNS = {
        INTEGER: /^-?\d+$/,
        FLOAT: /^-?\d*\.\d+$/,
        WHITESPACE: /\s/g
    };

    static BOOLEAN_VALUES = {
        TRUE: 'true',
        FALSE: 'false'
    };

    /**
     * Removes whitespace from property names based on configuration
     * @param {boolean} shouldTrimAll - If true, removes all whitespace, otherwise only trims edges
     * @param {string} propertyName - The property name to process
     * @returns {string} The processed property name
     */
    trimPropertyName(shouldTrimAll, propertyName) {
        if (!propertyName) {
            return '';
        }
        return shouldTrimAll ? 
            propertyName.replace(StringUtils.PATTERNS.WHITESPACE, '') : 
            propertyName.trim();
    }

    /**
     * Converts a string value to its appropriate type while preserving data integrity
     * @param {string} value - The input value to convert
     * @returns {string|number|boolean} The converted value
     */
    getValueFormatByType(value) {
        if (this.isEmpty(value)) {
            return String();
        }

        if (this.isBoolean(value)) {
            return this.convertToBoolean(value);
        }

        if (this.isInteger(value)) {
            return this.convertInteger(value);
        }

        if (this.isFloat(value)) {
            return this.convertFloat(value);
        }

        return String(value);
    }

    /**
     * Checks if a value array contains any non-empty values
     * @param {Array} values - Array to check for content
     * @returns {boolean} True if array has any non-empty values
     */
    hasContent(values = []) {
        return Array.isArray(values) && 
               values.some(value => Boolean(value));
    }

    // Private helper methods for type checking and conversion
    /**
     * Check if a value is empty (undefined or empty string)
     * @param {unknown} value - Value to check
     * @returns {boolean} True if value is undefined or empty string
     * @private
     */
    isEmpty(value) {
        return value === undefined || value === '';
    }

    /**
     * Check if a value is a boolean string ('true' or 'false', case-insensitive)
     * @param {string} value - Value to check
     * @returns {boolean} True if value is 'true' or 'false'
     * @private
     */
    isBoolean(value) {
        const normalizedValue = value.toLowerCase();
        return normalizedValue === StringUtils.BOOLEAN_VALUES.TRUE || 
               normalizedValue === StringUtils.BOOLEAN_VALUES.FALSE;
    }

    /**
     * Check if a value is an integer string (with optional leading minus sign)
     * @param {string} value - Value to check
     * @returns {boolean} True if value matches integer pattern
     * @private
     */
    isInteger(value) {
        return StringUtils.PATTERNS.INTEGER.test(value);
    }

    /**
     * Check if a value is a float string (decimal number with optional leading minus sign)
     * @param {string} value - Value to check
     * @returns {boolean} True if value matches float pattern
     * @private
     */
    isFloat(value) {
        return StringUtils.PATTERNS.FLOAT.test(value);
    }

    /**
     * Check if a numeric string has a leading zero (e.g., '01' or '-01')
     * Leading zeros indicate the value should be kept as a string to preserve formatting
     * @param {string} value - Numeric string value to check
     * @returns {boolean} True if value has a leading zero
     * @private
     */
    hasLeadingZero(value) {
        const isPositiveWithLeadingZero = value.length > 1 && value[0] === '0';
        const isNegativeWithLeadingZero = value.length > 2 && value[0] === '-' && value[1] === '0';
        return isPositiveWithLeadingZero || isNegativeWithLeadingZero;
    }

    /**
     * Convert a boolean string to native boolean value
     * Safely converts 'true' to true and 'false' to false
     * @param {string} value - Boolean string ('true' or 'false')
     * @returns {boolean} Native boolean value
     * @private
     */
    convertToBoolean(value) {
        return JSON.parse(value.toLowerCase());
    }

    /**
     * Convert an integer string to number or keep as string if it has leading zeros
     * Preserves leading zeros in strings (e.g., '007' stays as string)
     * @param {string} value - Integer string to convert
     * @returns {number|string} Number if safe, otherwise string value
     * @private
     */
    convertInteger(value) {
        if (this.hasLeadingZero(value)) {
            return String(value);
        }

        const num = Number(value);
        return Number.isSafeInteger(num) ? num : String(value);
    }

    /**
     * Convert a float string to number or keep as string if conversion is unsafe
     * @param {string} value - Float string to convert
     * @returns {number|string} Number if finite and valid, otherwise string value
     * @private
     */
    convertFloat(value) {
        const num = Number(value);
        return Number.isFinite(num) ? num : String(value);
    }
}

module.exports = new StringUtils();
