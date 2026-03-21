'use strict';

const { JsonValidationError } = require('./errors');

/**
 * JSON validation utilities
 * @category Utilities
 */
class JsonUtil {

    /**
     * Validate that a string is valid JSON
     * @param {string} json - JSON string to validate
     * @throws {JsonValidationError} If JSON is invalid
     */
    validateJson(json) {
        try {
            JSON.parse(json);
        } catch (err) {
            throw new JsonValidationError(json, err);
        }
    }

}

module.exports = new JsonUtil();