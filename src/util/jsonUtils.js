'use strict';

const { JsonValidationError } = require('./errors');

class JsonUtil {

    validateJson(json) {
        try {
            JSON.parse(json);
        } catch (err) {
            throw new JsonValidationError(json, err);
        }
    }

}

module.exports = new JsonUtil();