/**
 * CSV to JSON - Browser Bundle
 * Exposes the library as a global variable for browser-based demos
 * Supports CSV string parsing, file operations, and streaming
 * @package convert-csv-to-json
 * @version 4.31.0
 */

(function(global) {
  'use strict';

  class CsvToJsonBrowser {
    constructor() {
      this.printValueFormatByType = false;
      this.isSupportQuotedField = false;
      this.delimiter = ',';
      this.isTrimHeaderFieldWhiteSpace = false;
      this.indexHeaderValue = 0;
      this.parseSubArrayDelimiter = null;
      this.parseSubArraySeparator = ',';
      this.rowMapper = null;
    }

    formatValueByType(active = true) { this.printValueFormatByType = active; return this; }
    supportQuotedField(active = false) { this.isSupportQuotedField = active; return this; }
    fieldDelimiter(delimiter) { this.delimiter = delimiter; return this; }
    trimHeaderFieldWhiteSpace(active = false) { this.isTrimHeaderFieldWhiteSpace = active; return this; }
    parseSubArray(delimiter = '*', separator = ',') { this.parseSubArrayDelimiter = delimiter; this.parseSubArraySeparator = separator; return this; }

    indexHeader(index) {
      if (isNaN(index)) throw new Error('indexHeader() expects a numeric value');
      this.indexHeaderValue = index;
      return this;
    }

    mapRows(mapperFn) {
      if (typeof mapperFn !== 'function') throw new TypeError('mapRows() expects a function');
      this.rowMapper = mapperFn;
      return this;
    }

    csvStringToJson(csvString) {
      if (csvString === undefined || csvString === null) throw new Error('csvStringToJson() requires a CSV string');
      return this.csvToJson(csvString);
    }

    csvStringToJsonStringified(csvString) {
      if (csvString === undefined || csvString === null) throw new Error('csvStringToJsonStringified() requires a CSV string');
      return JSON.stringify(this.csvToJson(csvString), null, 1);
    }

    csvStringToJsonAsync(csvString) { return Promise.resolve(this.csvStringToJson(csvString)); }
    csvStringToJsonStringifiedAsync(csvString) { return Promise.resolve(this.csvStringToJsonStringified(csvString)); }

    csvToJson(csvString) {
      const records = this.parseRecords(csvString);
      const headers = this.extractHeaders(records);
      if (!headers || headers.length === 0) throw new Error('No valid header row found in CSV');

      const result = [];
      const startIndex = this.indexHeaderValue + 1;

      for (let i = startIndex; i < records.length; i++) {
        const fields = this.isSupportQuotedField ? this.splitQuotedRecord(records[i]) : records[i].split(this.delimiter);
        if (this.hasContent(fields)) {
          let row = this.buildObject(headers, fields);
          if (this.rowMapper) {
            row = this.rowMapper(row, i - startIndex);
            if (row != null) result.push(row);
          } else {
            result.push(row);
          }
        }
      }
      return result;
    }

    parseRecords(csv) {
      const records = [];
      let currentRecord = '';
      let insideQuotes = false;
      const QUOTE_CHAR = '"';

      for (let i = 0; i < csv.length; i++) {
        const char = csv[i];
        const nextChar = i + 1 < csv.length ? csv[i + 1] : '';

        if (char === QUOTE_CHAR) {
          if (insideQuotes && nextChar === QUOTE_CHAR) {
            currentRecord += QUOTE_CHAR + QUOTE_CHAR;
            i++;
          } else {
            insideQuotes = !insideQuotes;
            currentRecord += char;
          }
        } else if (!insideQuotes && char === '\n') {
          records.push(currentRecord);
          currentRecord = '';
        } else if (!insideQuotes && char === '\r') {
          if (nextChar === '\n') i++;
          records.push(currentRecord);
          currentRecord = '';
        } else {
          currentRecord += char;
        }
      }

      if (currentRecord.length > 0) records.push(currentRecord);
      return records;
    }

    extractHeaders(records) {
      if (this.indexHeaderValue < records.length) {
        const headerRecord = records[this.indexHeaderValue];
        return this.isSupportQuotedField ? this.splitQuotedRecord(headerRecord) : headerRecord.split(this.delimiter);
      }
      return [];
    }

    splitQuotedRecord(record) {
      const fields = [];
      let currentField = '';
      let insideQuotes = false;
      const QUOTE_CHAR = '"';

      for (let i = 0; i < record.length; i++) {
        const char = record[i];
        const nextChar = i + 1 < record.length ? record[i + 1] : '';

        if (char === QUOTE_CHAR) {
          if (insideQuotes && nextChar === QUOTE_CHAR) {
            currentField += QUOTE_CHAR;
            i++;
          } else {
            insideQuotes = !insideQuotes;
          }
        } else if (char === this.delimiter && !insideQuotes) {
          fields.push(currentField);
          currentField = '';
        } else {
          currentField += char;
        }
      }

      fields.push(currentField);
      return fields;
    }

    buildObject(headers, fields) {
      const obj = {};
      for (let i = 0; i < headers.length; i++) {
        const key = this.isTrimHeaderFieldWhiteSpace ? headers[i].replace(/\s/g, '') : headers[i].trim();
        let value = fields[i] || '';
        if (this.printValueFormatByType) value = this.parseValue(value);
        obj[key] = value;
      }
      return obj;
    }

    parseValue(value) {
      if (!value || value === '') return '';
      if (value.toLowerCase() === 'true') return true;
      if (value.toLowerCase() === 'false') return false;
      if (/^-?\d+$/.test(value)) return parseInt(value, 10);
      if (/^-?\d*\.\d+$/.test(value)) return parseFloat(value);
      return value;
    }

    hasContent(fields) {
      return Array.isArray(fields) && fields.some(f => f && f.trim());
    }

    parseFile(file, options = {}) {
      return new Promise((resolve, reject) => {
        if (typeof FileReader === 'undefined') {
          reject(new Error('FileReader API not available'));
          return;
        }
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error || new Error('File read error'));
        reader.onload = () => {
          try {
            resolve(this.csvToJson(reader.result));
          } catch (err) {
            reject(err);
          }
        };
        reader.readAsText(file, options.encoding);
      });
    }

    async getJsonFromStreamAsync(stream) {
      if (typeof ReadableStream === 'undefined') throw new Error('ReadableStream not available');
      if (!stream || typeof stream.getReader !== 'function') throw new Error('Invalid ReadableStream');

      const reader = stream.getReader();
      let csv = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const decoder = new TextDecoder();
          csv += decoder.decode(value, { stream: true });
        }
        csv += new TextDecoder().decode();
        return this.csvToJson(csv);
      } finally {
        reader.releaseLock();
      }
    }

    async getJsonFromFileStreamingAsync(file) {
      if (!file || !(file instanceof File)) throw new Error('Invalid File object');
      if (typeof file.stream === 'function') {
        return this.getJsonFromStreamAsync(file.stream());
      } else {
        return this.parseFile(file);
      }
    }

    async getJsonFromFileStreamingAsyncWithCallback(file, options = {}) {
      if (!file || !(file instanceof File)) throw new Error('Invalid File object');
      if (!options.onChunk || typeof options.onChunk !== 'function') throw new Error('onChunk callback is required');

      const chunkSize = options.chunkSize || 1000;
      const { onChunk, onComplete, onError } = options;
      try {
        const allRows = await this.parseFile(file);
        let processed = 0;
        const total = allRows.length;
        const sendChunk = () => {
          if (processed < total) {
            const chunk = allRows.slice(processed, processed + chunkSize);
            onChunk(chunk, processed + chunk.length, total);
            processed += chunk.length;
            setTimeout(sendChunk, 0);
          } else {
            if (onComplete) onComplete(allRows);
          }
        };
        sendChunk();
      } catch (error) {
        if (onError) onError(error);
        throw error;
      }
    }

    async parseFileWithCallbacks(file, options) {
      if (!file) throw new Error('File is required');
      if (!options.onChunk || typeof options.onChunk !== 'function') throw new Error('onChunk callback is required');
      return this.getJsonFromFileStreamingAsyncWithCallback(file, options);
    }
  }

  class BrowserApi {
    constructor() { this.csvToJson = new CsvToJsonBrowser(); }
    formatValueByType(active = true) { this.csvToJson.formatValueByType(active); return this; }
    supportQuotedField(active = false) { this.csvToJson.supportQuotedField(active); return this; }
    fieldDelimiter(delimiter) { this.csvToJson.fieldDelimiter(delimiter); return this; }
    trimHeaderFieldWhiteSpace(active = false) { this.csvToJson.trimHeaderFieldWhiteSpace(active); return this; }
    indexHeader(index) { this.csvToJson.indexHeader(index); return this; }
    parseSubArray(delimiter = '*', separator = ',') { this.csvToJson.parseSubArray(delimiter, separator); return this; }
    mapRows(mapperFn) { this.csvToJson.mapRows(mapperFn); return this; }
    csvStringToJson(csvString) { return this.csvToJson.csvStringToJson(csvString); }
    csvStringToJsonStringified(csvString) { return this.csvToJson.csvStringToJsonStringified(csvString); }
    csvStringToJsonAsync(csvString) { return this.csvToJson.csvStringToJsonAsync(csvString); }
    csvStringToJsonStringifiedAsync(csvString) { return this.csvToJson.csvStringToJsonStringifiedAsync(csvString); }
    parseFile(file, options) { return this.csvToJson.parseFile(file, options); }
    getJsonFromStreamAsync(stream) { return this.csvToJson.getJsonFromStreamAsync(stream); }
    getJsonFromFileStreamingAsync(file) { return this.csvToJson.getJsonFromFileStreamingAsync(file); }
    getJsonFromFileStreamingAsyncWithCallback(file, options) { return this.csvToJson.getJsonFromFileStreamingAsyncWithCallback(file, options); }
    parseFileWithCallbacks(file, options) { return this.csvToJson.parseFileWithCallbacks(file, options); }
  }

  const browserApi = new BrowserApi();
  if (typeof module === 'object' && module.exports) module.exports = browserApi;
  if (typeof global !== 'undefined') global.csvToJson = browserApi;
  else if (typeof window !== 'undefined') window.csvToJson = browserApi;

})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);
