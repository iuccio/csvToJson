'use strict';

const fs = require('fs');
const { FileOperationError } = require('./errors');

class FileUtils {

    readFile(fileInputName, encoding) {
        try {
            return fs.readFileSync(fileInputName, encoding).toString();
        } catch (error) {
            throw new FileOperationError('read', fileInputName, error);
        }
    }

    readFileAsync(fileInputName, encoding = 'utf8') {
        // Use fs.promises when available for a Promise-based API
        if (fs.promises && typeof fs.promises.readFile === 'function') {
            return fs.promises.readFile(fileInputName, encoding)
                .then(buf => buf.toString())
                .catch(error => {
                    throw new FileOperationError('read', fileInputName, error);
                });
        }
        return new Promise((resolve, reject) => {
            fs.readFile(fileInputName, encoding, (err, data) => {
                if (err) {
                    reject(new FileOperationError('read', fileInputName, err));
                    return;
                }
                resolve(data.toString());
            });
        });
    }

    writeFile(json, fileOutputName) {
        fs.writeFile(fileOutputName, json, function (err) {
            if (err) {
                throw new FileOperationError('write', fileOutputName, err);
            } else {
                console.log('File saved: ' + fileOutputName);
            }
        });
    }

    writeFileAsync(json, fileOutputName) {
        if (fs.promises && typeof fs.promises.writeFile === 'function') {
            return fs.promises.writeFile(fileOutputName, json)
                .catch(error => {
                    throw new FileOperationError('write', fileOutputName, error);
                });
        }
        return new Promise((resolve, reject) => {
            fs.writeFile(fileOutputName, json, (err) => {
                if (err) return reject(new FileOperationError('write', fileOutputName, err));
                resolve();
            });
        });
    }

}
module.exports = new FileUtils();
