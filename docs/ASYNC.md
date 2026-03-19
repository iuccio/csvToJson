# Asynchronous API Documentation

Promise-based async/await API for modern Node.js applications. Perfect for handling large files, concurrent operations, and integration with async workflows.

## Table of Contents
- [Basic Usage](#basic-usage)
- [File Operations](#file-operations)
- [Working with Raw CSV Data](#working-with-raw-csv-data)
- [Processing Large Files](#processing-large-files)
- [Batch Processing](#batch-processing)
- [Error Handling](#error-handling)
- [Method Chaining](#method-chaining)
- [Row Mapping and Transformation](#row-mapping-and-transformation)
- [TypeScript Support](#typescript-support)

## Basic Usage

```js
const csvToJson = require('convert-csv-to-json');

// Using async/await
async function parseCSV() {
  const json = await csvToJson.getJsonFromCsvAsync('input.csv');
  console.log(json);
}
parseCSV();

// Using Promises
csvToJson.getJsonFromCsvAsync('input.csv')
  .then(json => console.log(json))
  .catch(err => console.error('Error:', err));
```

## File Operations

### Read CSV File

```js
const csvToJson = require('convert-csv-to-json');

async function readCSV() {
  try {
    const json = await csvToJson.getJsonFromCsvAsync('input.csv');
    console.log(`Parsed ${json.length} records`);
    return json;
  } catch (error) {
    console.error('Error reading CSV:', error);
  }
}
```

### Generate JSON File from CSV

```js
async function convertAndSave() {
  await csvToJson
    .fieldDelimiter(',')
    .formatValueByType()
    .generateJsonFileFromCsvAsync('input.csv', 'output.json');
  
  console.log('JSON file created successfully');
}
```

### Parse CSV String

```js
const csv = 'name,age\nAlice,30\nBob,25';

// Parse to array
const json = await csvToJson.csvStringToJsonAsync(csv);

// Parse to JSON string (validated)
const jsonString = await csvToJson.csvStringToJsonStringifiedAsync(csv);
```

## Working with Raw CSV Data

### Parse API Response

```js
async function parseRemoteCSV(url) {
  const response = await fetch(url);
  const csvText = await response.text();
  
  const json = await csvToJson
    .formatValueByType()
    .getJsonFromCsvAsync(csvText, { raw: true });
  
  return json;
}
```

### Parse from Buffer

```js
async function parseBuffer(buffer) {
  const csvString = buffer.toString('utf8');
  return csvToJson.getJsonFromCsvAsync(csvString, { raw: true });
}
```

## Processing Large Files

### Stream Processing

```js
const { createReadStream } = require('fs');
const { createInterface } = require('readline');

async function* processLargeFile(filePath) {
  const fileStream = createReadStream(filePath);
  const lines = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const headers = (await lines[Symbol.asyncIterator]().next()).value;
  
  for await (const line of lines) {
    const fullCSV = headers + '\n' + line;
    const record = await csvToJson.getJsonFromCsvAsync(fullCSV, { raw: true });
    yield record[0];
  }
}

// Usage
async function process() {
  for await (const record of processLargeFile('large.csv')) {
    console.log(record);
    // Process one record at a time
  }
}
```

### Chunked Processing

```js
const fs = require('fs');

async function processInChunks(filePath, chunkSize = 1000) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const headers = lines[0];
  
  for (let i = 1; i < lines.length; i += chunkSize) {
    const chunk = lines.slice(i, i + chunkSize);
    const csvChunk = headers + '\n' + chunk.join('\n');
    
    const json = await csvToJson.getJsonFromCsvAsync(csvChunk, { raw: true });
    await processChunk(json);
  }
}

async function processChunk(records) {
  // Your processing logic here
  console.log(`Processing ${records.length} records`);
}
```

## Batch Processing

### Sequential Processing

```js
async function processFilesSequentially(files) {
  const results = [];
  
  for (const file of files) {
    const json = await csvToJson.getJsonFromCsvAsync(file);
    results.push({ file, data: json });
  }
  
  return results;
}

// Usage
const files = ['data1.csv', 'data2.csv', 'data3.csv'];
const results = await processFilesSequentially(files);
```

### Parallel Processing

```js
async function processFilesParallel(files, concurrency = 3) {
  const results = new Map();
  
  // Process in chunks of concurrent operations
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    
    const promises = batch.map(async file => {
      const json = await csvToJson.getJsonFromCsvAsync(file);
      return [file, json];
    });
    
    const batchResults = await Promise.all(promises);
    batchResults.forEach(([file, json]) => results.set(file, json));
  }
  
  return results;
}

// Usage
const results = await processFilesParallel(['file1.csv', 'file2.csv', 'file3.csv'], 2);
```

## Error Handling

### Basic Try-Catch

```js
async function safeRead(filePath) {
  try {
    const json = await csvToJson.getJsonFromCsvAsync(filePath);
    return json;
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error.message);
    throw error;
  }
}
```

### Retry Logic

```js
async function readWithRetry(filePath, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await csvToJson.getJsonFromCsvAsync(filePath);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Exponential backoff
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Error Recovery

```js
async function processWithFallback(primaryFile, fallbackFile) {
  try {
    return await csvToJson.getJsonFromCsvAsync(primaryFile);
  } catch (error) {
    console.warn(`Failed to read ${primaryFile}, using fallback...`);
    return csvToJson.getJsonFromCsvAsync(fallbackFile);
  }
}
```

## Method Chaining

Combine configuration options with async operations:

```js
const json = await csvToJson
  .fieldDelimiter(';')
  .formatValueByType()
  .supportQuotedField(true)
  .trimHeaderFieldWhiteSpace(true)
  .getJsonFromCsvAsync('file.csv');

// Or use async file generation
await csvToJson
  .fieldDelimiter(',')
  .formatValueByType()
  .generateJsonFileFromCsvAsync('input.csv', 'output.json');
```

All configuration methods from the [Sync API](SYNC.md) are available with async operations.

## Row Mapping and Transformation

The `mapRows()` method allows you to transform, filter, or enrich each row after parsing. The mapping function is applied within the async operation, making it perfect for data transformation pipelines.

### Basic Row Transformation

```js
async function transformRows() {
  const json = await csvToJson
    .fieldDelimiter(',')
    .mapRows((row, index) => {
      // Add computed fields
      row.id = index + 1;
      row.email = row.email.toLowerCase();
      return row;
    })
    .csvStringToJsonAsync('firstName,lastName,email\nJohn,Doe,John.Doe@example.com');
  
  console.log(json);
  // Output: [{ id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' }]
}
```

### Filtering Rows

```js
async function filterRows() {
  const json = await csvToJson
    .fieldDelimiter(',')
    .mapRows((row) => {
      // Only keep rows where status is 'active'
      if (row.status === 'active') {
        return row;
      }
      return null; // Filter out inactive rows
    })
    .getJsonFromCsvAsync('data.csv');
  
  return json; // Contains only active records
}
```

### Data Enrichment

```js
async function enrichData() {
  const json = await csvToJson
    .fieldDelimiter(';')
    .mapRows((row, index) => {
      // Add metadata and computed properties
      const age = parseInt(row.age);
      return {
        ...row,
        rowId: index,
        ageGroup: age < 18 ? 'minor' : age < 65 ? 'adult' : 'senior',
        processed: new Date().toISOString()
      };
    })
    .getJsonFromCsvAsync('people.csv');
  
  return json;
}
```

### Complex Transformations

```js
async function complexTransformation() {
  const sales = await csvToJson
    .fieldDelimiter(',')
    .formatValueByType()
    .mapRows((row, index) => {
      const amount = typeof row.amount === 'number' ? row.amount : parseFloat(row.amount);
      const quantity = typeof row.quantity === 'number' ? row.quantity : parseInt(row.quantity);
      
      return {
        transactionId: `TXN-${String(index + 1).padStart(6, '0')}`,
        customer: row.customer_name,
        product: row.product_id,
        quantity: quantity,
        unitPrice: amount / quantity,
        totalAmount: amount,
        taxable: amount > 100,
        timestamp: new Date().toISOString()
      };
    })
    .getJsonFromCsvAsync('sales.csv');
  
  return sales;
}
```

### Validation and Filtering Pipeline

```js
async function validateAndFilter() {
  const json = await csvToJson
    .fieldDelimiter(',')
    .mapRows((row) => {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        return null; // Skip invalid rows
      }
      
      // Trim whitespace
      row.name = row.name.trim();
      row.email = row.email.trim();
      
      return row;
    })
    .getJsonFromCsvAsync('contacts.csv');
  
  return json;
}
```

## TypeScript Support

```ts
import csvToJson from 'convert-csv-to-json';

interface Product {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
}

// Read with type assertion
async function loadProducts(file: string): Promise<Product[]> {
  return csvToJson
    .formatValueByType()
    .getJsonFromCsvAsync(file) as Promise<Product[]>;
}

// Parse string with types
async function parseCSV(csv: string): Promise<Product[]> {
  return csvToJson
    .csvStringToJsonAsync(csv) as Promise<Product[]>;
}

// Error handling
async function safeLoad(file: string): Promise<Product[] | null> {
  try {
    return await loadProducts(file);
  } catch (error) {
    console.error('Failed to load products:', error);
    return null;
  }
}
```

## Common Patterns

### Transform Data Pipeline

```js
async function processAndTransform(csvFile) {
  // 1. Parse CSV
  const raw = await csvToJson
    .formatValueByType()
    .getJsonFromCsvAsync(csvFile);
  
  // 2. Filter and transform
  const processed = raw
    .filter(record => record.active)
    .map(record => ({
      id: record.id,
      name: record.name.toUpperCase(),
      displayPrice: `$${record.price.toFixed(2)}`
    }));
  
  return processed;
}
```

### Concurrent File Processing with Logging

```js
async function processMultipleWithLogging(files) {
  const results = [];
  
  const promises = files.map(async (file, index) => {
    console.log(`[${index + 1}/${files.length}] Processing ${file}...`);
    const startTime = Date.now();
    
    try {
      const json = await csvToJson.getJsonFromCsvAsync(file);
      const duration = Date.now() - startTime;
      
      console.log(`[✓] ${file} completed in ${duration}ms (${json.length} records)`);
      return { file, json, success: true };
    } catch (error) {
      console.error(`[✗] ${file} failed:`, error.message);
      return { file, error: error.message, success: false };
    }
  });
  
  return Promise.all(promises);
}
```

## See Also

- [Main README](../README.md) - Overview and installation
- [Sync API](SYNC.md) - Synchronous operations
- [Browser API](BROWSER.md) - Client-side CSV parsing
- [MIGRATION.md](../migration/MIGRATION_TO_ASYNC.md) - Guide for migrating from Sync to Async
