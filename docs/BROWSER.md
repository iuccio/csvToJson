# Browser API Documentation

Client-side CSV parsing for web browsers. Supports parsing CSV strings and file/blob objects with both synchronous and asynchronous methods.

## Table of Contents
- [Basic Usage](#basic-usage)
- [Parsing CSV Strings](#parsing-csv-strings)
- [Parsing Files and Blobs](#parsing-files-and-blobs)
- [Configuration Options](#configuration-options)
- [File Upload Examples](#file-upload-examples)
- [TypeScript Support](#typescript-support)

## Basic Usage

The browser API is accessed through the `browser` property:

```js
const convert = require('convert-csv-to-json');

// Synchronous parse
const data = convert.browser.csvStringToJson('name,age\nAlice,30');

// Asynchronous parse (recommended)
const dataAsync = await convert.browser.csvStringToJsonAsync('name,age\nAlice,30');

// Parse file
const file = document.querySelector('input[type=file]').files[0];
const fileData = await convert.browser.parseFile(file);
```

## Parsing CSV Strings

### Synchronous String Parsing

```js
const convert = require('convert-csv-to-json');

const csv = `name,email,age
John,john@example.com,30
Jane,jane@example.com,25`;

const json = convert.browser.csvStringToJson(csv);
// Output: [
//   { name: 'John', email: 'john@example.com', age: '30' },
//   { name: 'Jane', email: 'jane@example.com', age: '25' }
// ]
```

### Asynchronous String Parsing

```js
async function parseCSV(csv) {
  try {
    const json = await convert.browser.csvStringToJsonAsync(csv);
    console.log(json);
  } catch (error) {
    console.error('Parse error:', error);
  }
}

parseCSV('name,age\nAlice,30\nBob,25');
```

### Get JSON String

```js
const convert = require('convert-csv-to-json');

const csv = 'name,age\nAlice,30';
const jsonString = convert.browser.csvStringToJsonStringified(csv);
// Output: "[\n {\n  \"name\": \"Alice\",\n  \"age\": \"30\"\n }\n]"
```

## Parsing Files and Blobs

### Parse File Upload

```js
const convert = require('convert-csv-to-json');

async function handleFileUpload(event) {
  const file = event.target.files[0];
  
  try {
    const json = await convert.browser.parseFile(file);
    console.log('Parsed records:', json.length);
    displayData(json);
  } catch (error) {
    console.error('Error parsing file:', error);
  }
}

// HTML: <input type="file" id="csvFile" accept=".csv">
document.getElementById('csvFile').addEventListener('change', handleFileUpload);
```

### Parse Blob Data

```js
async function parseBlobData(blob) {
  const json = await convert.browser.parseFile(blob);
  return json;
}

// Example: from fetch response
const response = await fetch('data.csv');
const blob = await response.blob();
const data = await parseBlobData(blob);
```

### Parse with Custom Encoding

```js
const convert = require('convert-csv-to-json');

async function parseWithEncoding(file) {
  const options = { encoding: 'utf-8' };
  const json = await convert.browser
    .parseFile(file, options);
  
  return json;
}
```

## Configuration Options

All configuration methods from the [Sync API](SYNC.md) are available:

### Field Delimiter

```js
const convert = require('convert-csv-to-json');

const csv = 'name;age\nAlice;30\nBob;25';
const json = convert.browser
  .fieldDelimiter(';')
  .csvStringToJson(csv);
```

### Quoted Fields Support

```js
const csv = `name,description
"Smith, John","He said ""Hello"""`;

const json = convert.browser
  .supportQuotedField(true)
  .csvStringToJson(csv);
// Output: { name: 'Smith, John', description: 'He said "Hello"' }
```

### Format Values by Type

```js
const csv = 'name,age,active\nAlice,30,true\nBob,25,false';
const json = convert.browser
  .formatValueByType()
  .csvStringToJson(csv);

// Output:
// [
//   { name: 'Alice', age: 30, active: true },
//   { name: 'Bob', age: 25, active: false }
// ]
```

### Trim Header Fields

```js
const csv = ' Name , Age \nAlice,30';
const json = convert.browser
  .trimHeaderFieldWhiteSpace(true)
  .csvStringToJson(csv);

// Output: { Name: 'Alice', Age: '30' } (spaces removed from header)
```

### Method Chaining

```js
const json = convert.browser
  .fieldDelimiter(';')
  .formatValueByType()
  .supportQuotedField(true)
  .trimHeaderFieldWhiteSpace(true)
  .csvStringToJson(csvContent);
```

## File Upload Examples

### HTML File Input

```html
<input type="file" id="csvInput" accept=".csv" />
<button onclick="handleUpload()">Parse CSV</button>
<div id="results"></div>

<script>
const convert = require('convert-csv-to-json');

async function handleUpload() {
  const file = document.getElementById('csvInput').files[0];
  
  if (!file) {
    alert('Please select a file');
    return;
  }
  
  try {
    const json = await convert.browser
      .formatValueByType()
      .parseFile(file);
    
    displayResults(json);
  } catch (error) {
    document.getElementById('results').innerHTML = 
      `<p style="color: red;">Error: ${error.message}</p>`;
  }
}

function displayResults(data) {
  const html = `
    <h3>Parsed ${data.length} records:</h3>
    <pre>${JSON.stringify(data, null, 2)}</pre>
  `;
  document.getElementById('results').innerHTML = html;
}
</script>
```

### Drag and Drop Upload

```html
<div id="dropZone" style="border: 2px dashed #ccc; padding: 20px;">
  Drag CSV file here or <input type="file" id="csvFile" accept=".csv" />
</div>

<script>
const convert = require('convert-csv-to-json');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('csvFile');

// Handle file selection
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

// Handle drag and drop
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.style.backgroundColor = '#f0f0f0';
});

dropZone.addEventListener('dragleave', () => {
  dropZone.style.backgroundColor = 'transparent';
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.style.backgroundColor = 'transparent';
  handleFiles(e.dataTransfer.files);
});

async function handleFiles(files) {
  const file = files[0];
  if (!file || !file.type.includes('csv')) {
    alert('Please select a CSV file');
    return;
  }
  
  try {
    const json = await convert.browser.parseFile(file);
    console.log('Parsed data:', json);
  } catch (error) {
    console.error('Parse error:', error);
  }
}
</script>
```

### Multiple File Upload

```js
const convert = require('convert-csv-to-json');

async function handleMultipleFiles(files) {
  const results = [];
  
  for (const file of files) {
    try {
      const json = await convert.browser
        .formatValueByType()
        .parseFile(file);
      
      results.push({
        fileName: file.name,
        records: json,
        success: true
      });
    } catch (error) {
      results.push({
        fileName: file.name,
        error: error.message,
        success: false
      });
    }
  }
  
  return results;
}

// Usage with file input
document.getElementById('csvFiles').addEventListener('change', async (e) => {
  const results = await handleMultipleFiles(e.target.files);
  console.log(results);
});
```

## TypeScript Support

```ts
import { browser } from 'convert-csv-to-json';

interface User {
  name: string;
  email: string;
  age: number;
}

// Parse CSV string
function parseUsers(csv: string): User[] {
  return browser.csvStringToJson(csv) as User[];
}

// Parse file
async function parseUserFile(file: File): Promise<User[]> {
  return browser
    .formatValueByType()
    .parseFile(file) as Promise<User[]>;
}

// Async string parsing
async function parseUsersAsync(csv: string): Promise<User[]> {
  return browser.csvStringToJsonAsync(csv) as Promise<User[]>;
}

// Handle file upload with type safety
async function handleUpload(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (!file) return;
  
  try {
    const users = await parseUserFile(file);
    console.log(`Loaded ${users.length} users`);
  } catch (error) {
    console.error('Failed to parse file:', error);
  }
}
```

## Browser Compatibility

The browser API requires:
- `FileReader` API for file parsing
- Modern JavaScript (ES2015+) for async/await support

**Supported Browsers:**
- Chrome 42+ (FileReader)
- Firefox 38+ (FileReader)
- Safari 10+ (FileReader)
- Edge 12+ (FileReader)

## Common Issues

### FileReader Not Available

```js
if (typeof FileReader === 'undefined') {
  console.error('FileReader API is not available in this environment');
}
```

### File Reading Errors

```js
async function safeParseFile(file) {
  try {
    return await convert.browser.parseFile(file);
  } catch (error) {
    if (error.message.includes('FileReader')) {
      console.error('File reading not supported');
    } else {
      console.error('Parse error:', error);
    }
    return null;
  }
}
```

### Large File Handling

For large files, consider:
1. Processing in chunks
2. Using Web Workers for non-blocking parsing
3. Showing progress feedback to users

```js
async function parseWithProgress(file) {
  const fileSize = file.size;
  console.log(`Parsing file: ${file.name} (${fileSize} bytes)`);
  
  const start = Date.now();
  const json = await convert.browser.parseFile(file);
  const duration = Date.now() - start;
  
  console.log(`Completed in ${duration}ms: ${json.length} records`);
  return json;
}
```

## See Also

- [Main README](../README.md) - Overview and installation
- [Sync API](SYNC.md) - Synchronous operations
- [Async API](ASYNC.md) - Asynchronous operations with Promises/async-await
