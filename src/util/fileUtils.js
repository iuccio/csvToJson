'use strict';

let fs = require('fs');

class FileUtils {

    readFile(fileInputName, encoding) {
        return fs.readFileSync(fileInputName, encoding).toString();
    }

    writeFile(json, fileOutputName) {
        fs.writeFile(fileOutputName, json, function (err) {
            if (err) {
                throw err;
            } else {
                console.log('File saved: ' + fileOutputName);
            }
        });
    }

}
module.exports = new FileUtils();
