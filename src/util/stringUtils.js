'use strict';

class StringUtils {

    trimPropertyName(value) {
        return value.replace(/\s/g, '');
    }

    getValueFormatByType(value) {
        if(value === undefined || value === ''){
            return String();
        }
        //is Number
        let isNumber = !isNaN(value);
        if (isNumber) {
            return Number(value);
        }
        // is Boolean
        if(value === "true" || value === "false"){
            return JSON.parse(value.toLowerCase());
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
