export = CsvToJson;
declare class CsvToJson {
    /**
     * @param {CsvToJsonOptions} opts
     */
    constructor(opts?: CsvToJsonOptions);
    /**
     * Prints a digit as Number type (for example 32 instead of '32')
     * @param {boolean} [active = false]
     * @returns {this}
     */
    formatValueByType(active?: boolean): this;
    /**
     * Makes parser aware of quoted fields
     * @param {boolean} [active = false]
     * @returns {this}
     */
    setSupportQuotedField(active?: boolean): this;
    /**
     * Defines the field delimiter which will be used to split the fields
     * @param {string} [delimiter=';']
     * @return {this}
     * @throws {TypeError} when the delimiter is not a string or empty
     */
    setDelimiter(delimiter?: string): this;
    /**
     * Configures if the content of the Header Fields is trimmed including the
     * white spaces, e.g. "My Name" -> "MyName"
     * @param {boolean} [active = false]
     * @return {this}
     */
    setShouldRemoveAllWhiteSpaceInHeaderField(active?: boolean): this;
    /**
     * Defines the index where the header is defined
     * @param {number} indexHeader
     * @return {this}
     * @throws {TypeError} when the indexHeader is not a number
     */
    setIndexHeader(indexHeader: number): this;
    /**
     * Defines how to match and parse a sub array
     * @param {boolean} [active = false]
     * @param {string} [delimiter='*']
     * @param {string} [separator=',']
     * @returns {this}
     */
    setParseSubArray(active?: boolean, delimiter?: string, separator?: string): this;
    /**
     * Defines the file encoding
     * @param {BufferEncoding} encoding
     * @return {this}
     */
    setEncoding(encoding?: BufferEncoding): this;
    /**
     * Parses .csv file and put its content into a file in json format.
     * @param {string} fileInputName
     * @param {string} fileOutputName
     * @throws {Error} when input or output file name is not defined
     * @return {void}
     */
    generateJsonFileFromCsv(fileInputName: string, fileOutputName: string): void;
    /**
     * Parses .csv file and converts its content into a string in json format.
     * @param {string} fileInputName
     * @returns {string}
     */
    getJsonStringifiedFromCsv(fileInputName: string): string;
    /**
     * Parses .csv file and put its content into an Array of Object in json format.
     * @param {string} fileInputName
     * @return {Array} Array of Object in json format
     * @throws {Error} when input file name is not defined
     */
    getJsonFromCsv(fileInputName: string): any[];
    /**
     * @param {string} csvString
     * @returns {Array<object>}
     */
    csvStringToJson(csvString: string): Array<object>;
    /**
     * @param {CSVHeaders} headers
     * @param {Array<string>} currentLine
     * @returns {object}
     */
    buildJsonResult(headers: CSVHeaders, currentLine: Array<string>): object;
    #private;
}
declare namespace CsvToJson {
    export { CsvToJson as default, CsvToJson, BufferEncoding, CSVHeaders, CsvToJsonOptions };
}
type BufferEncoding = (typeof encodings)[number];
type CSVHeaders = Array<string>;
type CsvToJsonOptions = {
    /**
     * The field delimiter which will be used to split the fields
     */
    delimiter?: string;
    /**
     * The file encoding
     */
    encoding?: BufferEncoding;
    /**
     * The index where the header is defined
     */
    indexHeader?: number;
    /**
     * Makes parser aware of quoted fields
     */
    supportQuotedField?: boolean;
    /**
     * Prints a digit as Number type (for example 32 instead of '32')
     */
    printValueFormatByType?: boolean;
    /**
     * Whether to parse sub arrays
     */
    parseSubArrays?: boolean;
    /**
     * The delimiter to identify a sub array
     */
    parseSubArrayDelimiter?: string;
    /**
     * The separator to split values in a sub array
     */
    parseSubArraySeparator?: string;
    /**
     * If active the content of the Header Fields is trimmed including the white spaces, e.g. "My Name" -> "MyName"
     */
    trimHeaderFieldWhiteSpace?: boolean;
};
declare const encodings: readonly ["utf8", "ucs2", "utf16le", "latin1", "ascii", "base64", "hex"];
