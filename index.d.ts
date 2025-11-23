declare module 'convert-csv-to-json' {
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

    csvStringToJson(csvString: string): any[];

    /**
    * Parses a csv string and returns a JSON string (validated)
    * @param {csvString} csvString CSV content as string
    * @return {string} JSON stringified result
    */
    csvStringToJsonStringified(csvString: string): string;
    
    /**
     * Parses .csv file and put its content into a file in json format.
     * @param {inputFileName} path/filename
     * @param {outputFileName} path/filename
     *
     * @deprecated Use generateJsonFileFromCsv()
     */
    jsonToCsv(inputFileName: string, outputFileName: string): void;
  }
  const converter: ConvertCsvToJson;
  export default converter;
  
  /**
   * Browser API exposes parsing helpers for browser environments
   */
  export interface BrowserApi {
    formatValueByType(active: boolean): this;
    trimHeaderFieldWhiteSpace(active: boolean): this;
    supportQuotedField(active: boolean): this;
    fieldDelimiter(delimiter: string): this;
    indexHeader(index: number): this;
    parseSubArray(delimiter: string, separator: string): this;

    csvStringToJson(csvString: string): any[];
    csvStringToJsonStringified(csvString: string): string;
    csvStringToJsonAsync(csvString: string): Promise<any[]>;
    csvStringToJsonStringifiedAsync(csvString: string): Promise<string>;

    /**
     * Parse a File or Blob and return a Promise that resolves to the JSON array
     */
    parseFile(file: Blob | File, options?: { encoding?: string }): Promise<any[]>;
  }

  export const browser: BrowserApi;
}
