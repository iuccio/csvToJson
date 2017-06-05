'use strict';

class StringUtils {

    trimPropertyName(value) {
        return value.replace(/\s/g, '');
    }

    getValueFormatByType(value) {
        let isNumber = /^\d+$/.test(value);
        if (isNumber) {
            return Number(value);
        }
        return String(value);
    }
}
module.exports = new StringUtils();