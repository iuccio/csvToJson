'use strict';

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
    isEmpty(value) {
        return value === undefined || value === '';
    }

    isBoolean(value) {
        const normalizedValue = value.toLowerCase();
        return normalizedValue === StringUtils.BOOLEAN_VALUES.TRUE || 
               normalizedValue === StringUtils.BOOLEAN_VALUES.FALSE;
    }

    isInteger(value) {
        return StringUtils.PATTERNS.INTEGER.test(value);
    }

    isFloat(value) {
        return StringUtils.PATTERNS.FLOAT.test(value);
    }

    hasLeadingZero(value) {
        const isPositiveWithLeadingZero = value.length > 1 && value[0] === '0';
        const isNegativeWithLeadingZero = value.length > 2 && value[0] === '-' && value[1] === '0';
        return isPositiveWithLeadingZero || isNegativeWithLeadingZero;
    }

    convertToBoolean(value) {
        return JSON.parse(value.toLowerCase());
    }

    convertInteger(value) {
        if (this.hasLeadingZero(value)) {
            return String(value);
        }

        const num = Number(value);
        return Number.isSafeInteger(num) ? num : String(value);
    }

    convertFloat(value) {
        const num = Number(value);
        return Number.isFinite(num) ? num : String(value);
    }
}

module.exports = new StringUtils();
