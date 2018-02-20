'use strict';

class StringUtils {

    trimPropertyName(value) {
        return value.replace(/\s/g, '');
    }

    getValueFormatByType(value) {
        let isNumber = !isNaN(value);
        if (isNumber) {
            return Number(value);
        }
        return String(value);
    }

    hasContent(values) {
        if (values.length > 0) {
            for (let i = 0; i < values.length; i++) {
                if (values[i]) {
                    return true;
                }
            }
        }
        return false;
    }
}
module.exports = new StringUtils();
