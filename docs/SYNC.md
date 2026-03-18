# Synchronous API Documentation

Transform CSV files into JSON objects synchronously. Perfect for simple use cases and straightforward data processing workflows.

## Table of Contents
- [Basic Usage](#basic-usage)
- [Generate JSON File](#generate-json-file)
- [Generate Array of Objects](#generate-array-of-objects)
- [Configuration Options](#configuration-options)
- [Advanced Features](#advanced-features)
- [TypeScript Support](#typescript-support)

## Basic Usage

```js
const csvToJson = require('convert-csv-to-json');

// Parse CSV file
const json = csvToJson.getJsonFromCsv('input.csv');
console.log(json);
```

## Generate JSON File

```js
const csvToJson = require('convert-csv-to-json');

csvToJson.generateJsonFileFromCsv('input.csv', 'output.json');
```

## Generate Array of Objects

```js
const csvToJson = require('convert-csv-to-json');

const json = csvToJson.getJsonFromCsv('input.csv');
json.forEach(record => {
  console.log(record);
});
```

## Configuration Options

### Field Delimiter

Comma (`,`) is the default delimiter per RFC 4180. Use `fieldDelimiter()` for other delimiters:

```js
// Semicolon-delimited
csvToJson.fieldDelimiter(';').getJsonFromCsv('file.csv');

// Tab-delimited
csvToJson.fieldDelimiter('\t').getJsonFromCsv('file.tsv');

// Pipe-delimited
csvToJson.fieldDelimiter('|').getJsonFromCsv('file.psv');
```

### Quoted Fields

Enable support for fields wrapped in quotes (useful when fields contain delimiters, newlines, or quotes):

```js
csvToJson
  .supportQuotedField(true)
  .getJsonFromCsv('file.csv');
```

**Example Input:**
```csv
name,description
"Smith, John","He said ""Hello"""
Jane,"Multi-line
description"
```

**Output:**
```json
[
  { "name": "Smith, John", "description": "He said \"Hello\"" },
  { "name": "Jane", "description": "Multi-line\ndescription" }
]
```

### Format Values by Type

Automatically convert string values to appropriate types (numbers, booleans):

```js
csvToJson.formatValueByType().getJsonFromCsv('file.csv');
```

**Conversion Rules:**
- `"true"` / `"false"` (case-insensitive) → boolean
- `"123"` → number
- `"0012"` → string (preserves leading zeros)
- Other values → string

**Example:**
```csv
name,age,active,id
John,30,true,0012
Jane,25,false,987
```

**Output:**
```json
[
  { "name": "John", "age": 30, "active": true, "id": "0012" },
  { "name": "Jane", "age": 25, "active": false, "id": "987" }
]
```

### Trim Header Field

Remove whitespace from header names:

```js
// Trim leading/trailing spaces
csvToJson.trimHeaderField().getJsonFromCsv('file.csv');

// Remove all whitespace from headers
csvToJson.trimHeaderFieldWhiteSpace(true).getJsonFromCsv('file.csv');
```

**Example:**
```csv
 First Name , Last Name 
John,Doe
```

**With `trimHeaderFieldWhiteSpace(true)`:**
```json
[{ "FirstName": "John", "LastName": "Doe" }]
```

### Custom Encoding

Read files with specific encoding:

```js
csvToJson.utf8Encoding().getJsonFromCsv('file.csv');          // UTF-8
csvToJson.latin1Encoding().getJsonFromCsv('file.csv');        // Latin-1
csvToJson.ucs2Encoding().getJsonFromCsv('file.csv');          // UCS-2
csvToJson.utf16leEncoding().getJsonFromCsv('file.csv');       // UTF-16LE
csvToJson.asciiEncoding().getJsonFromCsv('file.csv');         // ASCII
csvToJson.base64Encoding().getJsonFromCsv('file.csv');        // Base64
csvToJson.hexEncoding().getJsonFromCsv('file.csv');           // Hex
csvToJson.customEncoding('utf8').getJsonFromCsv('file.csv');  // Custom
```

### Header Index

Specify which row contains headers (default is row 0):

```js
// Headers in row 2 (3rd row)
csvToJson.indexHeader(2).getJsonFromCsv('file.csv');
```

## Advanced Features

### Parse Sub-Arrays

Parse delimited values within fields into arrays:

```js
csvToJson
  .parseSubArray('*', ',')  // Fields wrapped in * contain comma-separated values
  .getJsonFromCsv('file.csv');
```

**Example Input:**
```csv
name,email,tags
John,john@example.com,*javascript,nodejs,typescript*
Jane,jane@example.com,*python,django*
```

**Output:**
```json
[
  { "name": "John", "email": "john@example.com", "tags": ["javascript", "nodejs", "typescript"] },
  { "name": "Jane", "email": "jane@example.com", "tags": ["python", "django"] }
]
```

### Work with CSV Strings

Parse CSV content directly from strings:

```js
const csv = 'name,age\nJohn,30\nJane,25';
const json = csvToJson.csvStringToJson(csv);
// Output: [{ name: 'John', age: '30' }, { name: 'Jane', age: '25' }]

// Get as JSON string
const jsonString = csvToJson.csvStringToJsonStringified(csv);
```

### Method Chaining

Combine multiple configuration options:

```js
const json = csvToJson
  .fieldDelimiter(';')
  .formatValueByType()
  .supportQuotedField(true)
  .trimHeaderFieldWhiteSpace(true)
  .getJsonFromCsv('file.csv');
```

## TypeScript Support

```ts
import csvToJson from 'convert-csv-to-json';

interface Person {
  name: string;
  age: number;
  email: string;
}

// Parse with type assertion
const people = csvToJson
  .formatValueByType()
  .getJsonFromCsv('people.csv') as Person[];

// Parse CSV string
const csv = 'name,age\nAlice,30';
const parsed = csvToJson.csvStringToJson(csv) as Person[];
```

## See Also

- [Main README](../README.md) - Overview and installation
- [Async API](ASYNC.md) - Asynchronous operations with Promises/async-await
- [Browser API](BROWSER.md) - Client-side CSV parsing
