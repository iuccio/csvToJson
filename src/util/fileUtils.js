'use strict';

let fs = require('fs');

class FileUtils {

    readFile(fileInputName, encoding) {
        return fs.readFileSync(fileInputName, encoding).toString();
    }

    readFileAsync(fileInputName, encoding = 'utf8') {
        // Use fs.promises when available for a Promise-based API
        if (fs.promises && typeof fs.promises.readFile === 'function') {
            return fs.promises.readFile(fileInputName, encoding)
                .then(buf => buf.toString());
        }
        return new Promise((resolve, reject) => {
            fs.readFile(fileInputName, encoding, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data.toString());
            });
        });
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

    writeFileAsync(json, fileOutputName) {
        if (fs.promises && typeof fs.promises.writeFile === 'function') {
            return fs.promises.writeFile(fileOutputName, json);
        }
        return new Promise((resolve, reject) => {
            fs.writeFile(fileOutputName, json, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

}
module.exports = new FileUtils();
