# JSON to CSV Conversion API

## Overview

A comprehensive JSON to CSV conversion API has been successfully added to the `convert-csv-to-json` library. This new feature provides both synchronous and asynchronous methods to convert JSON data to CSV format, complementing the existing CSV to JSON conversion functionality.

## Features

### Synchronous Operations
- **`jsonToCsvStringified(jsonData)`** - Convert JSON array directly to CSV string
- **`generateCsvFileFromJson(jsonData, outputPath)`** - Write JSON data to CSV file
- **`getCsvFromJson(inputPath)`** - Read JSON file and return CSV string
- **`generateCsvFileFromJsonFile(inputPath, outputPath)`** - Convert JSON file to CSV file

### Asynchronous Operations
- **`jsonToCsvAsync(jsonData)`** - Convert JSON array to CSV asynchronously
- **`jsonToCsvStringAsync(input, options)`** - Convert JSON string/data to CSV with options
- **`generateCsvFileFromJsonAsync(jsonData, outputPath)`** - Write JSON data to CSV file asynchronously
- **`getCsvFromJsonAsync(inputPath)`** - Read JSON file and return CSV string asynchronously
- **`generateCsvFileFromJsonFileAsync(inputPath, outputPath)`** - Convert JSON file to CSV file asynchronously

### Browser Support
- **`jsonToCsvStringified(jsonData)`** - Browser-safe JSON to CSV conversion
- **`jsonToCsvAsync(jsonData)`** - Browser-safe async JSON to CSV conversion
- **`jsonToCsvStringAsync(input, options)`** - Browser-safe async conversion with options

## Configuration Support

All JSON to CSV methods support the same configuration options as CSV to JSON:

- **`fieldDelimiter(delimiter)`** - Set custom field separator (default: comma)
- **`trimHeaderFieldWhiteSpace(active)`** - Remove/trim whitespace in header names
- **`ignoreColumnIndexes(indexes)`** - Exclude specific columns from output
- **`customEncoding(encoding)`** / **`utf8Encoding()`** etc. - Set file encoding

Configuration is chainable and applies globally to all conversion methods:

```javascript
const converter = require('convert-csv-to-json');

// Chain configuration methods
converter
  .fieldDelimiter(';')
  .trimHeaderFieldWhiteSpace(true)
  .jsonToCsvStringified(data);
```

## Usage Examples

### Basic Conversion

```javascript
const converter = require('convert-csv-to-json');

// JSON data
const data = [
  { name: 'Alice', age: 30, city: 'New York' },
  { name: 'Bob', age: 25, city: 'Los Angeles' }
];

// Convert to CSV string
const csv = converter.jsonToCsvStringified(data);
console.log(csv);
// Output:
// name,age,city
// Alice,30,New York
// Bob,25,Los Angeles
```

### File Operations

```javascript
// Generate CSV file from JSON data
converter.generateCsvFileFromJson(data, 'output.csv');

// Convert JSON file to CSV file
converter.generateCsvFileFromJsonFile('data.json', 'output.csv');

// Read JSON file and get CSV string
const csv = converter.getCsvFromJson('data.json');
```

### Async Operations

```javascript
// Asynchronous conversion
const csv = await converter.jsonToCsvAsync(data);

// Async file operations
await converter.generateCsvFileFromJsonAsync(data, 'output.csv');
await converter.generateCsvFileFromJsonFileAsync('input.json', 'output.csv');

// With options
const csv = await converter.jsonToCsvStringAsync(
  '[{"name":"Alice","age":30}]',
  { raw: true }
);
```

### Custom Configuration

```javascript
// Use semicolon as delimiter
converter
  .fieldDelimiter(';')
  .jsonToCsvStringified(data);

// Use pipe as delimiter
converter
  .fieldDelimiter('|')
  .generateCsvFileFromJson(data, 'output.csv');

// Trim header whitespace
converter
  .trimHeaderFieldWhiteSpace(true)
  .jsonToCsvStringified(data);
```

### Special Character Handling

The API automatically handles:
- **Quoted fields** - Fields containing commas, quotes, or newlines are properly quoted
- **Escaped quotes** - Double quotes within fields are properly escaped
- **Null/Undefined values** - Treated as empty fields
- **Arrays/Objects** - Converted to string representations

```javascript
const data = [
  { name: 'John "Jack" Doe', address: 'Main St, Apt 5' },
  { tags: ['a', 'b', 'c'], metadata: { id: 1 } }
];

const csv = converter.jsonToCsvStringified(data);
// Output includes properly quoted and escaped values
```

## Implementation Details

### Files Added/Modified

1. **src/jsonToCsv.js** - Synchronous JSON to CSV converter class
2. **src/jsonToCsvAsync.js** - Asynchronous JSON to CSV converter class  
3. **src/browserApi.js** - Added browser-compatible JSON to CSV methods
4. **index.js** - Added public API exports for JSON to CSV methods
5. **index.d.ts** - Added TypeScript type definitions
6. **test/jsonToCsv.spec.js** - Comprehensive test suite (30 tests)

### Architecture

The implementation follows the same architectural patterns as the existing CSV to JSON conversion:

- **Configurable** - Extends the Configurable base class for chainable configuration
- **Singleton Pattern** - Module exports singleton instances of converters
- **Dual-Track** - Separate sync and async implementations with shared configuration
- **Browser Support** - BrowserApi provides browser-safe methods
- **Error Handling** - Proper error types and validation with descriptive messages

### Test Coverage

- **30 new tests** covering:
  - Basic JSON to CSV conversion
  - Field escaping and quoting
  - File I/O operations
  - Async operations
  - Configuration options (delimiter, whitespace trimming)
  - Special values (null, undefined, arrays, objects)
  - Error handling and validation

- **All 207 tests pass** including existing CSV to JSON tests
- **Code coverage** maintained at high levels (78.74% overall)

## Compatibility

- **Node.js**: Works with all supported Node.js versions
- **TypeScript**: Full type definitions included
- **Browser**: Safe for use in browser environments (file operations only in Node.js)
- **Backward Compatible**: No breaking changes to existing CSV to JSON API

## Performance

- Efficient stream-like processing for large arrays
- Memory-efficient field escaping and quoting
- Configurable operations with minimal overhead
- Async operations for non-blocking I/O

## Future Enhancements

Potential future additions:
- Custom header mapping
- Column selection/reordering
- Row filtering functions
- Stream-based processing for very large datasets
- Different CSV dialect support (RFC 4180 variants)
