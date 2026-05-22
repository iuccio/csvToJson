'use strict';

const fs = require('fs');
const { FileOperationError } = require('../core/errors');

const ENCODED_FILE_ENCODINGS = new Set(['base64', 'hex']);

/**
 * File I/O utilities for reading and writing CSV/JSON files.
 * Provides both synchronous and asynchronous file operations.
 * @category Utilities
 */
class FileUtils {
    /**
     * Determine whether the encoding represents a binary-encoded file.
     * @param {string} encoding - File encoding label
     * @returns {boolean} True when encoding is base64 or hex
     * @private
     */
    _isEncodedFile(encoding) {
        return ENCODED_FILE_ENCODINGS.has(encoding);
    }

    /**
     * Decode raw file content that was stored as base64 or hex.
     * @param {string} rawContent - Raw file content read from disk
     * @param {string} encoding - Encoding used for the file
     * @returns {string} UTF-8 decoded string content
     * @private
     */
    _decodeContent(rawContent, encoding) {
        if (this._isEncodedFile(encoding)) {
            return Buffer.from(rawContent, encoding).toString('utf8');
        }

        return rawContent;
    }

    /**
     * Convert raw file data into a string.
     * @param {string|Buffer} data - Data read from fs
     * @returns {string} String representation of the data
     * @private
     */
    _toString(data) {
        return typeof data === 'string' ? data : data.toString();
    }

    /**
     * Wrap a read error in a FileOperationError instance.
     * @param {string} fileInputName - Path to file being read
     * @param {Error} error - Original error from fs
     * @returns {FileOperationError} Wrapped read error
     * @private
     */
    _wrapReadError(fileInputName, error) {
        return new FileOperationError('read', fileInputName, error);
    }

    /**
     * Wrap a write error in a FileOperationError instance.
     * @param {string} fileOutputName - Path to file being written
     * @param {Error} error - Original error from fs
     * @returns {FileOperationError} Wrapped write error
     * @private
     */
    _wrapWriteError(fileOutputName, error) {
        return new FileOperationError('write', fileOutputName, error);
    }

    /**
     * Perform a synchronous file read using the provided encoding.
     * @param {string} fileInputName - Path to file to read
     * @param {string} encoding - File encoding to use when reading
     * @returns {string} Decoded file content
     * @private
     */
    _readFileSync(fileInputName, encoding) {
        if (this._isEncodedFile(encoding)) {
            const rawContent = fs.readFileSync(fileInputName, 'utf8');
            return this._decodeContent(rawContent, encoding);
        }

        return this._toString(fs.readFileSync(fileInputName, encoding));
    }

    /**
     * Read a file synchronously with specified encoding.
     * @param {string} fileInputName - Path to file to read
     * @param {string} encoding - File encoding (e.g., 'utf8', 'latin1')
     * @returns {string} File contents as string
     * @throws {FileOperationError} If file read fails
     */
    readFile(fileInputName, encoding = 'utf8') {
        try {
            return this._readFileSync(fileInputName, encoding);
        } catch (error) {
            throw this._wrapReadError(fileInputName, error);
        }
    }

    /**
     * Read a file using fs.promises and return decoded content.
     * @param {string} fileInputName - Path to file to read
     * @param {string} encoding - File encoding to use
     * @returns {Promise<string>} Promise resolving to decoded file content
     * @private
     */
    _readFileAsyncWithPromises(fileInputName, encoding) {
        if (this._isEncodedFile(encoding)) {
            return fs.promises.readFile(fileInputName, 'utf8')
                .then(rawContent => this._decodeContent(rawContent, encoding));
        }

        return fs.promises.readFile(fileInputName, encoding)
            .then(data => this._toString(data));
    }

    /**
     * Read a file asynchronously with specified encoding.
     * Uses fs.promises when available, falls back to callback-based API.
     * @param {string} fileInputName - Path to file to read
     * @param {string} encoding - File encoding (default: 'utf8')
     * @returns {Promise<string>} Promise resolving to file contents
     * @throws {FileOperationError} If file read fails
     */
    readFileAsync(fileInputName, encoding = 'utf8') {
        if (fs.promises && typeof fs.promises.readFile === 'function') {
            return this._readFileAsyncWithPromises(fileInputName, encoding)
                .catch(error => {
                    throw this._wrapReadError(fileInputName, error);
                });
        }

        return new Promise((resolve, reject) => {
            const callback = (error, data) => {
                if (error) {
                    reject(this._wrapReadError(fileInputName, error));
                    return;
                }

                try {
                    const content = this._isEncodedFile(encoding)
                        ? this._decodeContent(this._toString(data), encoding)
                        : this._toString(data);
                    resolve(content);
                } catch (decodeError) {
                    reject(this._wrapReadError(fileInputName, decodeError));
                }
            };

            const readEncoding = this._isEncodedFile(encoding) ? 'utf8' : encoding;
            fs.readFile(fileInputName, readEncoding, callback);
        });
    }

    /**
     * Write content to a file synchronously.
     * @param {string} fileOutputName - Path to output file
     * @param {string} content - File content to write
     * @private
     */
    _writeFileSync(fileOutputName, content) {
        fs.writeFileSync(fileOutputName, content, 'utf8');
    }

    /**
     * Write content to a file using fs.promises.
     * @param {string} fileOutputName - Path to output file
     * @param {string} content - File content to write
     * @returns {Promise<void>} Promise that resolves when write completes
     * @private
     */
    _writeFileAsyncWithPromises(fileOutputName, content) {
        return fs.promises.writeFile(fileOutputName, content, 'utf8');
    }

    /**
     * Write content to a file synchronously.
     * @param {string} content - Content to write to file
     * @param {string} fileOutputName - Path to output file
     * @throws {FileOperationError} If file write fails
     */
    writeFile(content, fileOutputName) {
        try {
            this._writeFileSync(fileOutputName, content);
        } catch (error) {
            throw this._wrapWriteError(fileOutputName, error);
        }
    }

    /**
     * Write content to a file asynchronously.
     * Uses fs.promises when available, falls back to callback-based API.
     * @param {string} content - Content to write to file
     * @param {string} fileOutputName - Path to output file
     * @returns {Promise<void>} Promise that resolves when write completes
     * @throws {FileOperationError} If file write fails
     */
    writeFileAsync(content, fileOutputName) {
        if (fs.promises && typeof fs.promises.writeFile === 'function') {
            return this._writeFileAsyncWithPromises(fileOutputName, content)
                .catch(error => {
                    throw this._wrapWriteError(fileOutputName, error);
                });
        }

        return new Promise((resolve, reject) => {
            fs.writeFile(fileOutputName, content, 'utf8', (error) => {
                if (error) {
                    reject(this._wrapWriteError(fileOutputName, error));
                    return;
                }
                resolve();
            });
        });
    }
}

module.exports = new FileUtils();
