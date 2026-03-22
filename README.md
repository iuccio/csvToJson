# CSVtoJSON

[![Node CI](https://github.com/iuccio/csvToJson/actions/workflows/ci-cd.yml/badge.svg?branch=master)](https://github.com/iuccio/csvToJson/actions/workflows/ci-cd.yml)
![CodeQL](https://github.com/iuccio/csvToJson/actions/workflows/codeql-analysis.yml/badge.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/iuccio/csvToJson/badge.svg)](https://snyk.io/test/github/iuccio/csvToJson)
[![Code Climate](https://codeclimate.com/github/iuccio/csvToJson/badges/gpa.svg)](https://codeclimate.com/github/iuccio/csvToJson)
[![NPM Version](https://img.shields.io/npm/v/convert-csv-to-json.svg)](https://npmjs.org/package/convert-csv-to-json)
![NodeJS Version](https://img.shields.io/badge/nodeJS-%3E=18.x-brightgreen.svg)
[![Downloads](https://img.shields.io/npm/dm/convert-csv-to-json.svg)](https://npmjs.org/package/convert-csv-to-json)
[![NPM total downloads](https://img.shields.io/npm/dt/convert-csv-to-json.svg?style=flat)](https://npmjs.org/package/convert-csv-to-json)
[![Socket Badge](https://badge.socket.dev/npm/package/convert-csv-to-json/3.20.0)](https://socket.dev/npm/package/convert-csv-to-json)


![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Browser Support](https://img.shields.io/badge/browser-supported-brightgreen.svg?style=for-the-badge&logo=google-chrome&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

>
Convert CSV files to JSON with **no dependencies**. Supports Node.js (Sync & Async), and Browser environments with full RFC 4180 compliance.

## Overview

Transform CSV data into JSON with a simple, chainable API. Choose your implementation style:

- **[Synchronous API](docs/SYNC.md)** - Blocking operations for simple workflows
- **[Asynchronous API](docs/ASYNC.md)** - Promise-based for modern async/await patterns
- **[Browser API](docs/BROWSER.md)** - Client-side CSV parsing for web applications

## Demo and JSDoc

* [Demo](https://iuccio.github.io/csvToJson/)
* [JSDoc](https://iuccio.github.io/csvToJson/api/index.html)


## Features

✅ **RFC 4180 Compliant** - Proper handling of quoted fields, delimiters, newlines, and escape sequences  
✅ **Zero Dependencies** - No external packages required  
✅ **Full TypeScript Support** - Included type definitions for all APIs  
✅ **Flexible Configuration** - Custom delimiters, encoding, trimming, and more  
✅ **Method Chaining** - Fluent API for readable code  
✅ **Large File Support** - Stream processing for memory-efficient handling  
✅ **Comprehensive Error Handling** - Detailed, actionable error messages with solutions (see [ERROR_HANDLING.md](docs/ERROR_HANDLING.md))

## RFC 4180 Standard

**[RFC 4180](https://datatracker.ietf.org/doc/html/rfc4180)** is the IETF standard specification for CSV (Comma-Separated Values) files. This library is fully compliant with RFC 4180, ensuring proper handling of:

| Aspect | RFC 4180 Specification |
|--------|------------------------|
| **Default Delimiter** | Comma (`,`) |
| **Record Delimiter** | CRLF (`\r\n`) or LF (`\n`) |
| **Quote Character** | Double-quote (`"`) |
| **Quote Escaping** | Double quotes (`""`) |

### RFC 4180 Example

```csv
firstName,lastName,email
"Smith, John",Smith,john@example.com
Jane,Doe,jane@example.com
"Cooper, Andy",Cooper,andy@company.com
```

Note the quoted fields containing commas are properly handled. See [RFC4180_MIGRATION_GUIDE.md](RFC4180_MIGRATION_GUIDE.md) for breaking changes and migration details.

## Quick Start

### Installation

```bash
npm install convert-csv-to-json
```

### Synchronous (Simple)

```js
const csvToJson = require('convert-csv-to-json');
const json = csvToJson.getJsonFromCsv('input.csv');
```

### Asynchronous (Modern)

```js
const csvToJson = require('convert-csv-to-json');
const json = await csvToJson.getJsonFromCsvAsync('input.csv');
```

### Browser

```js
const convert = require('convert-csv-to-json');
const json = await convert.browser.parseFile(file);
```

## Documentation

| Implementation | Use Case | Learn More |
|---|---|---|
| **Sync API** | Simple, blocking operations | [Read SYNC.md](docs/SYNC.md) |
| **Async API** | Concurrent operations, large files | [Read ASYNC.md](docs/ASYNC.md) |
| **Browser API** | Client-side file parsing | [Read BROWSER.md](docs/BROWSER.md) |

## Common Tasks

### Parse CSV String
```js
const json = csvToJson.csvStringToJson('name,age\nAlice,30');
```

### Custom Delimiter
```js
const json = csvToJson
  .fieldDelimiter(';')
  .getJsonFromCsv('input.csv');
```

### Format Values
```js
const json = csvToJson
  .formatValueByType()
  .getJsonFromCsv('input.csv');
// Converts "30" → 30, "true" → true, etc.
```

### Handle Quoted Fields
```js
const json = csvToJson
  .supportQuotedField(true)
  .getJsonFromCsv('input.csv');
```

### Batch Process Files (Async)
```js
const files = ['file1.csv', 'file2.csv', 'file3.csv'];
const results = await Promise.all(
  files.map(f => csvToJson.getJsonFromCsvAsync(f))
);
```

## Configuration Options

All APIs (Sync, Async and Browser) support the same configuration methods:

- `fieldDelimiter(char)` - Set field delimiter (default: `,`)
- `formatValueByType()` - Auto-convert numbers, booleans
- `supportQuotedField(bool)` - Handle quoted fields with embedded delimiters
- `indexHeader(num)` - Specify header row (default: 0)
- `trimHeaderFieldWhiteSpace(bool)` - Remove spaces from headers
- `parseSubArray(delim, sep)` - Parse delimited arrays
- `mapRows(fn)` - Transform, filter, or enrich each row
- `utf8Encoding()`, `latin1Encoding()`, etc. - Set file encoding

### Examples

#### `fieldDelimiter(char)` - Set field delimiter (default: `,`)
```js
// Semicolon-delimited
csvToJson.fieldDelimiter(';').getJsonFromCsv('data.csv');

// Tab-delimited
csvToJson.fieldDelimiter('\t').getJsonFromCsv('data.tsv');

// Pipe-delimited
csvToJson.fieldDelimiter('|').getJsonFromCsv('data.psv');
```

#### `formatValueByType()` - Auto-convert numbers, booleans
```js
// Input: name,age,active
//        John,30,true
csvToJson.formatValueByType().getJsonFromCsv('data.csv');
// Output: { name: 'John', age: 30, active: true }
```

#### `supportQuotedField(bool)` - Handle quoted fields with embedded delimiters
```js
// Input: name,description
//        "Smith, John","He said ""Hello"""
csvToJson.supportQuotedField(true).getJsonFromCsv('data.csv');
// Output: { name: 'Smith, John', description: 'He said "Hello"' }
```

#### `indexHeader(num)` - Specify header row (default: 0)
```js
// If headers are in row 2 (3rd line):
csvToJson.indexHeader(2).getJsonFromCsv('data.csv');
```

#### `trimHeaderFieldWhiteSpace(bool)` - Remove spaces from headers
```js
// Input: " First Name ", " Last Name "
csvToJson.trimHeaderFieldWhiteSpace(true).getJsonFromCsv('data.csv');
// Output: { FirstName: 'John', LastName: 'Doe' }
```

#### `parseSubArray(delim, sep)` - Parse delimited arrays
```js
// Input: name,tags
//        John,*javascript,nodejs,typescript*
csvToJson.parseSubArray('*', ',').getJsonFromCsv('data.csv');
// Output: { name: 'John', tags: ['javascript', 'nodejs', 'typescript'] }
```

#### `mapRows(fn)` - Transform, filter, or enrich each row

```js
// Filter out rows that don't match a condition
const result = csvToJson
  .fieldDelimiter(',')
  .mapRows((row) => {
    // Only keep rows where age >= 30
    if (parseInt(row.age) >= 30) {
      return row;
    }
    return null; // Filters out this row
  })
  .getJsonFromCsv('input.csv');
```

See [mapRows Feature - Usage Guide](docs/MAPROWS.md).

#### `utf8Encoding()`, `latin1Encoding()`, etc. - Set file encoding
```js
// UTF-8 encoding
csvToJson.utf8Encoding().getJsonFromCsv('data.csv');

// Latin-1 encoding
csvToJson.latin1Encoding().getJsonFromCsv('data.csv');

// Custom encoding
csvToJson.customEncoding('ucs2').getJsonFromCsv('data.csv');
```

See [SYNC.md](docs/SYNC.md), [ASYNC.md](docs/ASYNC.md) or [BROWSER.md](docs/BROWSER.md) for complete configuration details.

## Example: Complete Workflow

```js
const csvToJson = require('convert-csv-to-json');

async function processCSV() {
  const data = await csvToJson
    .fieldDelimiter(',')
    .formatValueByType()
    .supportQuotedField(true)
    .getJsonFromCsvAsync('data.csv');
  
  console.log(`Parsed ${data.length} records`);
  return data;
}
```

## Migration Guides

- **RFC 4180 Breaking Changes** - See [RFC4180_MIGRATION_GUIDE.md](migration/RFC4180_MIGRATION_GUIDE.md)
- **Sync to Async Migration** - See [MIGRATION.md](migration/MIGRATION_TO_ASYNC.md)
- **Error Handling** - See [docs/ERROR_HANDLING.md](docs/ERROR_HANDLING.md) for comprehensive error documentation

## Development

Install dependencies:
```bash
npm install
```

Run tests:
```bash
npm test
```

Debug tests:
```bash
npm run test-debug
```

## CI/CD GitHub Action

See [CI/CD GitHub Action](.github/workflows/ci-cd.yml).

### Release
When pushing to the `master` branch:
- Include `[MAJOR]` in commit message for major release (e.g., v1.0.0 → v2.0.0)
- Include `[PATCH]` in commit message for patch release (e.g., v1.0.0 → v1.0.1)
- Minor release is applied by default (e.g., v1.0.0 → v1.1.0)

## License

CSVtoJSON is licensed under the MIT [License](LICENSE).

---

## Support

Found a bug or need a feature? Open an issue on [GitHub](https://github.com/iuccio/csvToJson/issues).

Follow [me](https://github.com/iuccio) and consider starring the project to show your support ⭐

### Buy Me a Coffee

If you find this project helpful and would like to support its development:

**BTC**: `37vdjQhbaR7k7XzhMKWzMcnqUxfw1njBNk`
