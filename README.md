# CSVtoJSON 
[![Node CI](https://github.com/iuccio/csvToJson/actions/workflows/ci-cd.yml/badge.svg?branch=master)](https://github.com/iuccio/csvToJson/actions/workflows/ci-cd.yml)
![CodeQL](https://github.com/iuccio/csvToJson/actions/workflows/codeql-analysis.yml/badge.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/iuccio/csvToJson/badge.svg)](https://snyk.io/test/github/iuccio/csvToJson)
[![Code Climate](https://codeclimate.com/github/iuccio/csvToJson/badges/gpa.svg)](https://codeclimate.com/github/iuccio/csvToJson)
[![NPM Version](https://img.shields.io/npm/v/convert-csv-to-json.svg)](https://npmjs.org/package/convert-csv-to-json)
![NodeJS Version](https://img.shields.io/badge/nodeJS-%3E=18.x-brightgreen.svg)
[![Downloads](https://img.shields.io/npm/dm/convert-csv-to-json.svg)](https://npmjs.org/package/convert-csv-to-json)
[![NPM total downloads](https://img.shields.io/npm/dt/convert-csv-to-json.svg?style=flat)](https://npmjs.org/package/convert-csv-to-json)


![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Browser Support](https://img.shields.io/badge/browser-supported-brightgreen.svg?style=for-the-badge&logo=google-chrome&logoColor=white) 
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) 

**This project is not dependent on others packages or libraries, and supports both synchronous and Promise-based asynchronous APIs.**

This repository uses [![GitHub Action  - iuccio/npm-semantic-publish-action@latest](https://img.shields.io/badge/GitHub_Action_-iuccio%2Fnpm--semantic--publish--action%40latest-2ea44f)](https://github.com/marketplace/actions/npm-semver-publish)

Follow [me](https://github.com/iuccio), and consider starring the project to
show your :heart: and support.

## Table of Contents

<!-- toc -->

- [Description](#description)
- [Support for NodeJS, Browser, JS, TS](#support-for-nodejs-browser-js-ts)
- [Prerequisites](#prerequisites)
- [Install npm *convert-csv-to-json package*](#install-npm-convert-csv-to-json-package)
  * [Sync API Usage](#sync-api-usage)
    + [Generate JSON file](#generate-json-file)
    + [Generate Array of Object in JSON format](#generate-array-of-object-in-json-format)
    + [Generate Object with sub array](#generate-object-with-sub-array)
    + [Define field delimiter](#define-field-delimiter)
    + [Trim header field](#trim-header-field)
    + [Trim header field with whitespaces](#trim-header-field-with-whitespaces)
    + [Support Quoted Fields](#support-quoted-fields)
    + [Index header](#index-header)
    + [Empty rows](#empty-rows)
    + [Format property value by type](#format-property-value-by-type)
      - [Numbers](#numbers)
      - [Boolean](#boolean)
      - [Complete Example](#complete-example)
    + [Encoding](#encoding)
    + [Working with CSV strings directly](#working-with-csv-strings-directly)
  * [Sync API (TypeScript)](#sync-api-typescript)
- [Browser API Usage](#browser-api-usage)
  * [Basic Browser Operations](#basic-browser-operations)
  * [Parsing File/Blob](#parsing-fileblob)
  * [Browser API Notes](#browser-api-notes)
  * [Browser API (TypeScript)](#browser-api-typescript)
- [Async API Usage](#async-api-usage)
  * [Async API (TypeScript)](#async-api-typescript)
  * [Basic Async Operations](#basic-async-operations)
  * [Working with Raw CSV Data](#working-with-raw-csv-data)
  * [Processing Large Files](#processing-large-files)
  * [Error Handling and Retries](#error-handling-and-retries)
  * [Batch Processing](#batch-processing)
- [Chaining Pattern](#chaining-pattern)
  * [Synchronous Chaining](#synchronous-chaining)
  * [Asynchronous Chaining](#asynchronous-chaining)
- [Common Use Cases](#common-use-cases)
  * [1. Processing CSV from HTTP Response](#1-processing-csv-from-http-response)
  * [2. Batch Processing Multiple Files](#2-batch-processing-multiple-files)
  * [3. Data Transformation Pipeline](#3-data-transformation-pipeline)
  * [4. Error Recovery and Logging](#4-error-recovery-and-logging)
- [Troubleshooting](#troubleshooting)
  * [Memory Issues with Large Files](#memory-issues-with-large-files)
  * [Handling Different CSV Formats](#handling-different-csv-formats)
  * [Common Error Solutions](#common-error-solutions)
  * [Performance Optimization](#performance-optimization)
  * [TypeScript Support](#typescript-support)
- [Development](#development)
- [CI CD github action](#ci-cd-github-action)
- [License](#license)
- [Buy me a Coffee](#buy-me-a-coffee)

<!-- tocstop -->

## Description
Converts *csv* files to *JSON* files with Node.js. Supports both synchronous operations and Promise-based asynchronous operations, allowing integration with modern async/await patterns.

Give an input file like:

|first_name|last_name|email|gender|age|zip|registered|
|:----------:|:-------:|:---:|:----:|:---:|:---:|:---:|
|Constantin|Langsdon|clangsdon0@hc360.com|Male|96|123|true|
|Norah|Raison|nraison1@wired.com|Female|32| |false|

e.g. :
~~~
first_name;last_name;email;gender;age;zip;registered
Constantin;Langsdon;clangsdon0@hc360.com;Male;96;123;true
Norah;Raison;nraison1@wired.com;Female;32;;false
~~~

will generate:


```json
[
 {
  "first_name": "Constantin",
  "last_name": "Langsdon",
  "email": "clangsdon0@hc360.com",
  "gender": "Male",
  "age": "96",
  "zip": "123",
  "registered": "true"
 },
 {
  "first_name": "Norah",
  "last_name": "Raison",
  "email": "nraison1@wired.com",
  "gender": "Female",
  "age": "32",
  "zip": "",
  "registered": "false"
 }
]
```
## Support for NodeJS, Browser, JS, TS

This package is compatible with: 

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Browser Support](https://img.shields.io/badge/browser-supported-brightgreen.svg?style=for-the-badge&logo=google-chrome&logoColor=white) 
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) 

## Prerequisites
**NPM** (see [Installing Npm](https://docs.npmjs.com/getting-started/installing-node)).

## Install npm *convert-csv-to-json package*
Go to NPM package [convert-csv-to-json](https://www.npmjs.com/package/convert-csv-to-json).

Install package in your *package.json*
```bash
$ npm install convert-csv-to-json --save
```
Install package on your machine
```bash
$ npm install -g convert-csv-to-json
```

### Sync API Usage

#### Generate JSON file
```js
let csvToJson = require('convert-csv-to-json');

let fileInputName = 'myInputFile.csv'; 
let fileOutputName = 'myOutputFile.json';

csvToJson.generateJsonFileFromCsv(fileInputName,fileOutputName);
```
#### Generate Array of Object in JSON format
```js
let csvToJson = require('convert-csv-to-json');

let json = csvToJson.getJsonFromCsv("myInputFile.csv");
for(let i=0; i<json.length;i++){
    console.log(json[i]);
}
```

#### Generate Object with sub array 
```
firstName;lastName;email;gender;age;birth;sons
Constantin;Langsdon;clangsdon0@hc360.com;Male;96;10.02.1965;*diego,marek,dries*
```
Given the above CSV example, to generate a JSON Object with properties that contains sub Array, like the property **sons** 
with the values <b>*diego,marek,dries*</b> you have to call the function ```parseSubArray(delimiter, separator)``` .
To generate the JSON Object with sub array from the above CSV example:
```js
    csvToJson.parseSubArray('*',',')
                .getJsonFromCsv('myInputFile.csv');
``` 
The result will be:
```json
[
  {
      "firstName": "Constantin",
      "lastName": "Langsdon",
      "email": "clangsdon0@hc360.com",
      "gender": "Male",
      "age": "96",
      "birth": "10.02.1965",
      "sons": ["diego","marek","dries"]
    }
]
``` 

#### Define field delimiter
A field delimiter is needed to split the parsed values. As default the field delimiter is the **semicolon** (**;**), this means that during the parsing when a **semicolon (;)** is matched a new JSON entry is created.
In case your CSV file has defined another field delimiter you have to call the function ```fieldDelimiter(myDelimiter)``` and pass it as parameter the field delimiter.

E.g. if your field delimiter is the comma **,** then:

```js
 csvToJson.fieldDelimiter(',')
            .getJsonFromCsv(fileInputName);
```

#### Trim header field

The content of the field header is cut off at the beginning and end of the string. E.g. " Last Name " -> "Last Name".

#### Trim header field with whitespaces

Use the method *trimHeaderFieldWhiteSpace(true)* to remove the whitespaces in an header field (E.g. " Last Name " -> "LastName"): 

```js
 csvToJson.trimHeaderFieldWhiteSpace(true)
            .getJsonFromCsv(fileInputName);
```

#### Support Quoted Fields
To be able to parse correctly fields wrapped in quote, like the **last_name** in the first row in the following example:

|first_name|         last_name          |email|
|:----------:|:--------------------------:|:---:|
|Constantin| "Langsdon,Nandson,Gangson" |clangsdon0@hc360.com|

you need to activate the support quoted fields feature: 

```js
 csvToJson.supportQuotedField(true)
            .getJsonFromCsv(fileInputName);
```

The result will be:
```json
[
  {
      "firstName": "Constantin",
      "lastName": "Langsdon,Nandson,Gangson",
      "email": "clangsdon0@hc360.com"
    }
]
``` 

#### Index header
If the header is not on the first line you can define the header index like: 

```js
 csvToJson.indexHeader(3)
            .getJsonFromCsv(fileInputName);
```

#### Empty rows
Empty rows are ignored and not parsed.

#### Format property value by type
The `formatValueByType()` function intelligently converts string values to their appropriate types while preserving data integrity. To enable automatic type conversion:

```js
csvToJson.formatValueByType()
         .getJsonFromCsv(fileInputName);
```

This conversion follows these rules:

##### Numbers
- Regular integers and decimals are converted to Number type
- Numbers with leading zeros are preserved as strings (e.g., "0012" stays "0012")
- Large integers outside JavaScript's safe range are preserved as strings
- Valid decimal numbers are converted to Number type

For example:
```json
{
  "normalInteger": 42,           // Converted to number
  "decimal": 3.14,              // Converted to number
  "leadingZeros": "0012345",    // Kept as string to preserve leading zeros
  "largeNumber": "9007199254740992"  // Kept as string to preserve precision
}
```

##### Boolean
Case-insensitive "true" or "false" strings are converted to boolean values:
```json
{
  "registered": true,     // From "true" or "TRUE" or "True"
  "active": false        // From "false" or "FALSE" or "False"
}
```

##### Complete Example
Input CSV:
```csv
first_name;last_name;email;gender;age;id;zip;registered
Constantin;Langsdon;clangsdon0@hc360.com;Male;96;00123;123;true
Norah;Raison;nraison1@wired.com;Female;32;987;00456;FALSE
```

Output JSON:
```json
[
 {
  "first_name": "Constantin",
  "last_name": "Langsdon",
  "email": "clangsdon0@hc360.com",
  "gender": "Male",
  "age": 96,
  "id": "00123",        // Preserved leading zeros
  "zip": 123,          // Converted to number
  "registered": true   // Converted to boolean
 },
 {
  "first_name": "Norah",
  "last_name": "Raison",
  "email": "nraison1@wired.com",
  "gender": "Female",
  "age": 32,
  "id": "987",
  "zip": "00456",      // Preserved leading zeros
  "registered": false  // Case-insensitive boolean conversion
 }
]
```

#### Encoding
You can read and decode files with the following encoding:
 * utf8: 
    ```js
     csvToJson.utf8Encoding()
                .getJsonFromCsv(fileInputName);
    ```
 * ucs2:
    ```js
      csvToJson.ucs2Encoding()
                .getJsonFromCsv(fileInputName);
     ```
 * utf16le:
     ```js
       csvToJson.utf16leEncoding()
                  .getJsonFromCsv(fileInputName);
      ```
 * latin1:
     ```js
       csvToJson.latin1Encoding()
                  .getJsonFromCsv(fileInputName);
      ```
 * ascii:
     ```js
       csvToJson.asciiEncoding()
                  .getJsonFromCsv(fileInputName);
      ```
 * base64:
     ```js
       csvToJson.base64Encoding()
                  .getJsonFromCsv(fileInputName);
      ```
 * hex:
     ```js
       csvToJson.hexEncoding()
                  .getJsonFromCsv(fileInputName);
      ```

#### Working with CSV strings directly
If you have CSV content as a string (for example, from an API response or test data), you can parse it directly without writing to a file:

```js

// Parse CSV string to array of objects
let csvString = 'firstName;lastName\nJohn;Doe\nJane;Smith';
let jsonArray = csvToJson.csvStringToJson(csvString);
// Output: [{"firstName":"John","lastName":"Doe"},{"firstName":"Jane","lastName":"Smith"}]

// Parse CSV string to JSON string (validated)
let jsonString = csvToJson.csvStringToJsonStringified(csvString);
// Output: "[\n {\n  \"firstName\": \"John\",\n  \"lastName\": \"Doe\"\n },\n {\n  \"firstName\": \"Jane\",\n  \"lastName\": \"Smith\"\n }\n]"
```

Both methods support all configuration options through the chaining pattern:

```js
let jsonArray = csvToJson
  .fieldDelimiter(',')
  .formatValueByType()
  .csvStringToJson(csvString);
```

### Sync API (TypeScript)

TypeScript typings are available via the included `index.d.ts`. You can import the default converter or use named imports. Below are common patterns when using the synchronous API from TypeScript.

```ts
// Named import (recommended when using ES modules)
import converter, { /* or */ } from 'convert-csv-to-json';
// Access the default converter
const csvToJson = require('convert-csv-to-json');

// Define a type for your CSV records
interface Person {
  name: string;
  age: number;
}

// Parse CSV string synchronously and assert the returned type
const csv = 'name,age\nAlice,30';
const parsed = csvToJson.csvStringToJson(csv) as Person[];

// Chain configuration and call sync methods
const result = csvToJson
  .fieldDelimiter(',')
  .formatValueByType()
  .csvStringToJson('name,age\nBob,25') as Person[];
```

## Browser API Usage

The package exposes a `browser` helper that reuses the library's parsing logic but provides browser-friendly helpers for parsing CSV strings and `File`/`Blob` objects. The API mirrors the synchronous and asynchronous Node APIs and supports method chaining for configuration.

### Basic Browser Operations

```js
const convert = require('convert-csv-to-json');

// Parse CSV string synchronously
const arr = convert.browser
  .supportQuotedField(true)
  .fieldDelimiter(',')
  .csvStringToJson('name,age\nAlice,30');

// Parse CSV string asynchronously (returns Promise)
const arrAsync = await convert.browser.csvStringToJsonAsync('name;age\nBob;25');

// Get stringified JSON synchronously
const jsonString = convert.browser.csvStringToJsonStringified('name;age\nEve;40');
```

### Parsing File/Blob

`parseFile(file, options)` reads a `File` or `Blob` and returns a Promise that resolves with the parsed array of objects.

```js
// In a browser environment with an <input type="file">
const file = document.querySelector('input[type=file]').files[0];
convert.browser
  .fieldDelimiter(',')
  .formatValueByType()
  .parseFile(file)
  .then(json => console.log(json))
  .catch(err => console.error(err));
```

`parseFile` accepts an optional `options` object with `encoding` (passed to `FileReader.readAsText`). If `FileReader` is not available, `parseFile` will reject.

### Browser API Notes

- The `browser` API proxies the same configuration methods as the Node API and follows the same behavior for quoted fields, sub-array parsing, trimming, and value formatting.
- `parseFile` depends on the browser `FileReader` API; calling it in Node.js will reject with an informative error.

### Browser API (TypeScript)

TypeScript typings are provided via the included `index.d.ts`. You can import the default converter and access the `browser` helper, or import `browser` directly. Below are common usage patterns.

```ts
// Named import (recommended for direct use)
import { browser } from 'convert-csv-to-json';

// Or default import and access the browser helper
import converter from 'convert-csv-to-json';
const browserApi = converter.browser;

// Define a type for your CSV records
interface Person {
  name: string;
  age: number;
}

// Synchronous parse (assert the returned type)
const csv = 'name,age\nAlice,30';
const parsed = browser.csvStringToJson(csv) as Person[];

// Async parse
const parsedAsync = await browser.csvStringToJsonAsync(csv) as Person[];

// Parse a File in the browser
const inputEl = document.querySelector('input[type=file]') as HTMLInputElement;
const file = inputEl.files![0];
const data = await browser.parseFile(file) as Person[];
```

The `BrowserApi` interface in `index.d.ts` exposes typed method signatures for IDE autocompletion and compile-time checks.

## Async API Usage

This library provides a Promise-based async API that's perfect for modern Node.js applications. For a detailed migration guide from sync to async API, see [MIGRATION.md](MIGRATION.md).

### Async API (TypeScript)

The async API also has TypeScript typings. Typical usage in TypeScript looks like this:

```ts
import csvToJson from 'convert-csv-to-json';

interface Person {
  name: string;
  age: number;
}

// Using async/await
async function load(): Promise<Person[]> {
  const csv = 'name,age\nAlice,30';
  const parsed = await csvToJson.getJsonFromCsvAsync(csv, { raw: true }) as Person[];
  return parsed;
}

// Using the async helper that parses CSV strings
const parsedDirect = await csvToJson.csvStringToJsonAsync('name;age\nBob;25') as Person[];
```


### Basic Async Operations

1. Convert CSV file to JSON:
```js
const csvToJson = require('convert-csv-to-json');

// Using Promises
csvToJson.getJsonFromCsvAsync('input.csv')
  .then(json => console.log(json))
  .catch(err => console.error('Error:', err));

// Using async/await
async function convertCsv() {
  try {
    const json = await csvToJson.getJsonFromCsvAsync('input.csv');
    console.log(json);
  } catch (err) {
    console.error('Error:', err);
  }
}
```

2. Generate JSON file from CSV:
```js
// Using async/await with chain configuration
async function convertAndSave() {
  await csvToJson
    .fieldDelimiter(',')
    .formatValueByType()
    .generateJsonFileFromCsvAsync('input.csv', 'output.json');
}
```

### Working with Raw CSV Data

Process CSV data from memory or network sources:

```js
// Example: Processing CSV from an API
async function processCsvFromApi() {
  const response = await fetch('https://api.example.com/data.csv');
  const csvText = await response.text();
  
  const json = await csvToJson
    .formatValueByType()
    .getJsonFromCsvAsync(csvText, { raw: true });
    
  return json;
}
```

### Processing Large Files

For large files, use streaming to manage memory efficiently:

```js
const { createReadStream } = require('fs');
const { createInterface } = require('readline');

async function* processLargeFile(filePath) {
  const fileStream = createReadStream(filePath);
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    yield await csvToJson.getJsonFromCsvAsync(line, { raw: true });
  }
}

// Usage
async function processData() {
  for await (const record of processLargeFile('large.csv')) {
    await saveToDatabase(record);
  }
}
```

### Error Handling and Retries

Implement robust error handling with retries:

```js
async function processWithRetry(filePath, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const json = await csvToJson
        .formatValueByType()
        .getJsonFromCsvAsync(filePath);
      
      return json;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}
```

### Batch Processing

Process multiple files efficiently:

```js
async function batchProcess(files, batchSize = 3) {
  const results = new Map();
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const processed = await Promise.all(
      batch.map(async file => {
        const json = await csvToJson.getJsonFromCsvAsync(file);
        return [file, json];
      })
    );
    
    processed.forEach(([file, json]) => results.set(file, json));
  }
  
  return results;
}

// Usage
const files = ['data1.csv', 'data2.csv', 'data3.csv', 'data4.csv'];
const results = await batchProcess(files, 2);
```

## Chaining Pattern

The exposed API is implemented with the [Method Chaining Pattern](https://en.wikipedia.org/wiki/Method_chaining), which means that multiple methods can be chained. This pattern works with both synchronous and asynchronous methods:

### Synchronous Chaining

```js
const csvToJson = require('convert-csv-to-json');

// Chain configuration methods with sync operation
const json = csvToJson
    .fieldDelimiter(',')
    .formatValueByType()
    .parseSubArray("*", ',')
    .supportQuotedField(true)
    .getJsonFromCsv('myInputFile.csv');

// Chain with file generation
csvToJson
    .fieldDelimiter(';')
    .utf8Encoding()
    .formatValueByType()
    .generateJsonFileFromCsv('input.csv', 'output.json');

// Chain with string parsing
const jsonArray = csvToJson
    .fieldDelimiter(',')
    .trimHeaderFieldWhiteSpace(true)
    .csvStringToJson('name,age\nJohn,30\nJane,25');
```

### Asynchronous Chaining

```js
const csvToJson = require('convert-csv-to-json');

// Using async/await
async function processCSV() {
    // Chain configuration methods with async operation
    const json = await csvToJson
        .fieldDelimiter(',')
        .formatValueByType()
        .parseSubArray("*", ',')
        .supportQuotedField(true)
        .getJsonFromCsvAsync('myInputFile.csv');

    // Chain with async file generation
    await csvToJson
        .fieldDelimiter(';')
        .utf8Encoding()
        .formatValueByType()
        .generateJsonFileFromCsvAsync('input.csv', 'output.json');
}

// Using Promises
csvToJson
    .fieldDelimiter(',')
    .formatValueByType()
    .getJsonFromCsvAsync('input.csv')
    .then(json => console.log(json))
    .catch(err => console.error('Error:', err));
```

All configuration methods can be chained in any order before calling the final operation method (like `getJsonFromCsv`, `getJsonFromCsvAsync`, etc.). The configuration will be applied in the order it is chained.

## Common Use Cases

Here are some common use cases and how to implement them:

### 1. Processing CSV from HTTP Response
```js
const https = require('https');

async function processRemoteCsv(url) {
  const csvData = await new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
  });

  return csvToJson.getJsonFromCsvAsync(csvData, { raw: true });
}
```

### 2. Batch Processing Multiple Files
```js
async function batchProcess(files) {
  const results = new Map();
  
  // Process in chunks of 3 files at a time
  for (let i = 0; i < files.length; i += 3) {
    const chunk = files.slice(i, i + 3);
    const processed = await Promise.all(
      chunk.map(async file => {
        const json = await csvToJson.getJsonFromCsvAsync(file);
        return [file, json];
      })
    );
    
    processed.forEach(([file, json]) => results.set(file, json));
  }
  
  return results;
}
```

### 3. Data Transformation Pipeline
```js
async function transformData(csvFile) {
  // Step 1: Parse CSV
  const json = await csvToJson
    .formatValueByType()
    .getJsonFromCsvAsync(csvFile);
    
  // Step 2: Transform data
  const transformed = json.map(record => ({
    id: record.id,
    fullName: `${record.firstName} ${record.lastName}`,
    age: Number(record.age),
    isAdult: Number(record.age) >= 18,
    email: record.email.toLowerCase()
  }));
  
  // Step 3: Filter invalid records
  return transformed.filter(record => 
    record.id && 
    record.fullName.length > 0 &&
    !isNaN(record.age)
  );
}
```

### 4. Error Recovery and Logging
```js
async function processWithLogging(file) {
  const logger = {
    info: (msg) => console.log(`[INFO] ${msg}`),
    error: (msg, err) => console.error(`[ERROR] ${msg}`, err)
  };

  try {
    logger.info(`Starting processing ${file}`);
    const startTime = Date.now();
    
    const json = await csvToJson.getJsonFromCsvAsync(file);
    
    const duration = Date.now() - startTime;
    logger.info(`Processed ${file} in ${duration}ms`);
    
    return json;
  } catch (err) {
    logger.error(`Failed to process ${file}`, err);
    throw err;
  }
}
```

## Troubleshooting

Here are solutions to common issues you might encounter:

### Memory Issues with Large Files

If you're processing large CSV files and encountering memory issues:

```js
// Instead of loading the entire file
const json = await csvToJson.getJsonFromCsvAsync('large.csv'); // ❌

// Use streaming with async iteration
for await (const record of processLargeCsv('large.csv')) {  // ✅
  // Process one record at a time
  await processRecord(record);
}
```

### Handling Different CSV Formats

1. **Mixed Quote Types**:
```js
csvToJson
  .supportQuotedField(true)     // Enable quoted field support
  .getJsonFromCsvAsync(file);
```

2. **Custom Delimiters**:
```js
csvToJson
  .fieldDelimiter(';')          // Change delimiter
  .getJsonFromCsvAsync(file);
```

3. **UTF-8 with BOM**:
```js
csvToJson
  .encoding('utf8')             // Specify encoding
  .getJsonFromCsvAsync(file);
```

### Common Error Solutions

1. **ENOENT: no such file or directory**
   - Check if the file path is correct and absolute
   - Verify file permissions
   - Ensure the file exists in the specified location

2. **Invalid CSV Structure**
   - Verify CSV format matches expected structure
   - Check for missing or extra delimiters
   - Validate header row exists if expected

3. **Memory Leaks**
   - Use streaming for large files
   - Process files in smaller chunks
   - Implement proper cleanup in try/finally blocks

4. **Encoding Issues**
   - Specify correct encoding using .encoding()
   - Check for BOM markers
   - Verify source file encoding

### Performance Optimization

1. **Parallel Processing**:
```js
// Instead of sequential processing
for (const file of files) {
  await process(file);  // ❌
}

// Use parallel processing with limits
async function processWithLimit(files, limit = 3) {
  const results = [];
  for (let i = 0; i < files.length; i += limit) {
    const chunk = files.slice(i, i + limit);
    const chunkResults = await Promise.all(
      chunk.map(file => csvToJson.getJsonFromCsvAsync(file))
    );
    results.push(...chunkResults);
  }
  return results;
}  // ✅
```

2. **Memory Usage**:
```js
// Clear references when done
async function processWithCleanup(file) {
  let json;
  try {
    json = await csvToJson.getJsonFromCsvAsync(file);
    return await processData(json);
  } finally {
    json = null;  // Clear reference
  }
}
```

### TypeScript Support

If you're using TypeScript and encounter type issues:

```typescript
// Define custom types for your CSV structure
interface MyCsvRecord {
  id: number;
  name: string;
  age?: number;
}

// Use type assertion
const json = await csvToJson.getJsonFromCsvAsync<MyCsvRecord>('data.csv');
```

## Development
* Download all csvToJson dependencies:
    ~~~
    npm install
    ~~~
* Run Tests
    ~~~
    npm test
    ~~~
* Debug Tests
    ~~~
    npm run test-debug
    ~~~

## CI CD github action

This repository uses the [GitHub Action iuccio/npm-semantic-publish-action@latest](https://github.com/marketplace/actions/npm-semver-publish) to publish the npm packeges.
Pushing on the master branch, depending on the git message, an new version will always be released.
If the commit message contains the keyword:
* **[MAJOR]**: new major relase, e.g. v1.0.0 -> v2.0.0 
* **[PATCH]**: new patch relase, e.g. v1.0.0 -> v1.0.1
* without any of the above keywords a new minor relase will be applied, e.g. v1.0.0 -> v1.1.0


## License
CSVtoJSON is licensed under the MIT [License](LICENSE).

## Buy me a Coffee	
Just if you want to support this repository:	
   * **BTC** tip address: 
37vdjQhbaR7k7XzhMKWzMcnqUxfw1njBNk
