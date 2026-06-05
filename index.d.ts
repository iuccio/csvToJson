/// <reference types="node" />

declare module 'convert-csv-to-json' {
  /**
   * Singleton parser instance with chainable CSV-to-JSON configuration methods.
   */
  export class ConvertCsvToJson {
    /**
     * Prints a digit as Number type (for example 32 instead of '32')
     */
    formatValueByType(active: boolean): this;

    /**
     * Removes any whitespaces in the header field
     * @defaultValue `false`
     */
    trimHeaderFieldWhiteSpace(active: boolean): this;

    /**
     * Makes parser aware of quoted fields
     * @defaultValue `false`
     */
    supportQuotedField(active: boolean): this;

    /**
     * Defines the field delimiter which will be used to split the fields
     */
    fieldDelimiter(delimiter: string): this;

    /**
     * Defines the index where the header is defined
     */
    indexHeader(index: number): this;

    /**
     * Defines how to match and parse a sub array
     */
    parseSubArray(delimiter: string, separator: string): this;

    /**
     * Set column indexes to ignore
     * Specified columns will be excluded from the JSON output
     */
    ignoreColumnIndexes(indexes: number[]): this;

    /**
     * Defines a custom encoding to decode a file
     */
    customEncoding(encoding: string): this;

    /**
     * Defines a custom encoding to decode a file
     */
    utf8Encoding(): this;

    /**
     * Defines ucs2 encoding to decode a file
     */
    ucs2Encoding(): this;

    /**
     * Defines utf16le encoding to decode a file
     */
    utf16leEncoding(): this;

    /**
     * Defines latin1 encoding to decode a file
     */
    latin1Encoding(): this;

    /**
     * Defines ascii encoding to decode a file
     */
    asciiEncoding(): this;

    /**
     * Defines base64 encoding to decode a file
     */
    base64Encoding(): this;

    /**
     * Defines hex encoding to decode a file
     */
    hexEncoding(): this;

    /**
     * Sets a mapper function to transform each row after conversion.
     * The mapper function receives (row, index) where row is the JSON object 
     * and index is the 0-based row number. Return null/undefined to filter out rows.
     * @param mapperFn Function that receives (row: any, index: number) => any | null
     */
    mapRows(mapperFn: (row: any, index: number) => any | null): this;

    /**
     * Parses .csv file and put its content into a file in json format.
     * @param {inputFileName} path/filename
     * @param {outputFileName} path/filename
     *
     */
    generateJsonFileFromCsv(
      inputFileName: string,
      outputFileName: string,
    ): void;

    /**
     * Parses .csv file and put its content into an Array of Object in json format.
     * @param {inputFileName} path/filename
     * @return {Array} Array of Object in json format
     *
     */
    getJsonFromCsv(inputFileName: string): any[];

    /**
     * Async version of getJsonFromCsv. When options.raw is true the input is treated as a CSV string
     */
    getJsonFromCsvAsync(inputFileNameOrCsv: string, options?: { raw?: boolean }): Promise<any[]>;

    /**
     * Parse CSV from a Readable stream and return parsed data as JSON array
     * Processes data in chunks for memory-efficient handling of large files
     */
    getJsonFromStreamAsync(stream: NodeJS.ReadableStream): Promise<any[]>;

    /**
     * Parse CSV from a file path using streaming for memory-efficient processing
     */
    getJsonFromFileStreamingAsync(filePath: string): Promise<any[]>;

    /**
     * Parse a raw CSV string asynchronously and return parsed JSON objects
     */
    csvStringToJsonAsync(csvString: string, options?: { raw?: boolean }): Promise<any[]>;

    /**
     * Parse a raw CSV string asynchronously and return a JSON string
     */
    csvStringToJsonStringifiedAsync(csvString: string): Promise<string>;

    /**
     * Parses a CSV file and writes a JSON file asynchronously.
     * @param inputFileName Path to the input CSV file
     * @param outputFileName Path to the output JSON file
     */
    generateJsonFileFromCsvAsync(inputFileName: string, outputFileName: string): Promise<void>;

    /**
     * Parses a CSV string and returns an array of JSON objects.
     * @param csvString CSV content as a string
     */
    csvStringToJson(csvString: string): any[];

    /**
     * Parses a CSV string and returns a validated JSON string.
     * @param csvString CSV content as string
     * @returns JSON stringified result
     */
    csvStringToJsonStringified(csvString: string): string;

    /**
     * Convert a JSON array to CSV string
     * @param jsonData Array of objects to convert
     * @returns CSV formatted string
     */
    jsonToCsvStringified(jsonData: any[]): string;

    /**
     * Convert JSON array and write to CSV file (synchronous)
     * @param jsonData Array of objects to convert
     * @param fileOutputName Path to output CSV file
     */
    generateCsvFileFromJson(jsonData: any[], fileOutputName: string): void;

    /**
     * Convert JSON array and write to CSV file (asynchronous)
     * @param jsonData Array of objects to convert
     * @param fileOutputName Path to output CSV file
     */
    generateCsvFileFromJsonAsync(jsonData: any[], fileOutputName: string): Promise<void>;

    /**
     * Read JSON file and return converted CSV string (synchronous)
     * @param fileInputName Path to input JSON file
     * @returns CSV formatted string
     */
    getCsvFromJson(fileInputName: string): string;

    /**
     * Read JSON file and return converted CSV string (asynchronous)
     * @param fileInputName Path to input JSON file
     * @returns Promise resolving to CSV formatted string
     */
    getCsvFromJsonAsync(fileInputName: string): Promise<string>;

    /**
     * Generate CSV file from JSON file (synchronous)
     * @param fileInputName Path to input JSON file
     * @param fileOutputName Path to output CSV file
     */
    generateCsvFileFromJsonFile(fileInputName: string, fileOutputName: string): void;

    /**
     * Generate CSV file from JSON file (asynchronous)
     * @param fileInputName Path to input JSON file
     * @param fileOutputName Path to output CSV file
     */
    generateCsvFileFromJsonFileAsync(fileInputName: string, fileOutputName: string): Promise<void>;

    /**
     * Convert JSON array to CSV string (asynchronous)
     * @param jsonData Array of objects to convert
     * @returns Promise resolving to CSV formatted string
     */
    jsonToCsvAsync(jsonData: any[]): Promise<string>;

    /**
     * Convert JSON from raw string/data asynchronously
     * @param input JSON string or array of objects
     * @param options Configuration options
     * @returns Promise resolving to CSV formatted string
     */
    jsonToCsvStringAsync(input: string | any[], options?: { raw?: boolean }): Promise<string>;

  }
  const converter: ConvertCsvToJson;
  /**
   * Default singleton parser instance for convert-csv-to-json.
   */
  export default converter;
  
  /**
   * Browser API exposes parsing helpers for browser environments.
   */
  export interface BrowserApi {
    formatValueByType(active: boolean): this;
    trimHeaderFieldWhiteSpace(active: boolean): this;
    supportQuotedField(active: boolean): this;
    fieldDelimiter(delimiter: string): this;
    indexHeader(index: number): this;
    parseSubArray(delimiter: string, separator: string): this;
    ignoreColumnIndexes(indexes: number[]): this;
    mapRows(mapperFn: (row: any, index: number) => any | null): this;

    /**
     * Parses a CSV string and returns an array of JSON objects.
     * @param csvString CSV content as a string
     */
    csvStringToJson(csvString: string): any[];

    /**
     * Parses a CSV string and returns a JSON string.
     * @param csvString CSV content as a string
     */
    csvStringToJsonStringified(csvString: string): string;

    /**
     * Parses a CSV string asynchronously and returns an array of JSON objects.
     * @param csvString CSV content as a string
     */
    csvStringToJsonAsync(csvString: string): Promise<any[]>;

    /**
     * Parses a CSV string asynchronously and returns a validated JSON string.
     * @param csvString CSV content as a string
     */
    csvStringToJsonStringifiedAsync(csvString: string): Promise<string>;

    /**
     * Parse a File or Blob and return a Promise that resolves to the JSON array
     */
    parseFile(file: Blob | File, options?: { encoding?: string }): Promise<any[]>;

    /**
     * Parse CSV from a ReadableStream and return parsed data as JSON array
     */
    getJsonFromStreamAsync(stream: any): Promise<any[]>;

    /**
     * Parse CSV from a File object using streaming for memory-efficient processing
     */
    getJsonFromFileStreamingAsync(file: File): Promise<any[]>;

    /**
     * Convert JSON array to CSV string (synchronous)
     * @param jsonData Array of objects to convert
     * @returns CSV formatted string
     */
    jsonStringToCsv(jsonData: any[]): string;

    /**

     * Convert JSON array to CSV string (asynchronous)
     * @param jsonData Array of objects to convert
     * @returns Promise resolving to CSV formatted string
     */
    jsonToCsvAsync(jsonData: any[]): Promise<string>;

    /**
     * Convert JSON from raw string/data asynchronously
     * @param input JSON string or array of objects
     * @param options Configuration options
     * @returns Promise resolving to CSV formatted string
     */
    jsonToCsvStringAsync(input: string | any[], options?: { raw?: boolean }): Promise<string>;
  }

  export const browser: BrowserApi;
}
