'use strict';

const fs = require('fs');
const { FileOperationError } = require('./errors');

/**
 * File I/O utilities for reading and writing CSV/JSON files
 * Provides both synchronous and asynchronous file operations
 * @category Utilities
 */
class FileUtils {

    /**
     * Read a file synchronously with specified encoding
     * @param {string} fileInputName - Path to file to read
     * @param {string} encoding - File encoding (e.g., 'utf8', 'latin1')
     * @returns {string} File contents as string
     * @throws {FileOperationError} If file read fails
     */
    readFile(fileInputName, encoding) {
        try {
            return fs.readFileSync(fileInputName, encoding).toString();
        } catch (error) {
            throw new FileOperationError('read', fileInputName, error);
        }
    }

    /**
     * Read a file asynchronously with specified encoding
     * Uses fs.promises when available, falls back to callback-based API
     * @param {string} fileInputName - Path to file to read
     * @param {string} encoding - File encoding (default: 'utf8')
     * @returns {Promise<string>} Promise resolving to file contents
     * @throws {FileOperationError} If file read fails
     */
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

    /**
     * Write content to a file synchronously
     * Logs confirmation message to console on success
     * @param {string} json - Content to write to file
     * @param {string} fileOutputName - Path to output file
     * @throws {FileOperationError} If file write fails
     */
    writeFile(json, fileOutputName) {
        fs.writeFile(fileOutputName, json, function (err) {
            if (err) {
                throw new FileOperationError('write', fileOutputName, err);
            } else {
                console.log('File saved: ' + fileOutputName);
            }
        });
    }

    /**
     * Write content to a file asynchronously
     * Uses fs.promises when available, falls back to callback-based API
     * @param {string} json - Content to write to file
     * @param {string} fileOutputName - Path to output file
     * @returns {Promise<void>} Promise that resolves when write completes
     * @throws {FileOperationError} If file write fails
     */
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
