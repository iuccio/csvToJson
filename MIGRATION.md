# Migration Guide: Moving from Sync to Async

This guide will help you transition from the synchronous API to the new asynchronous API in csvToJson.

## Table of Contents

- [Basic Migration Patterns](#basic-migration-patterns)
- [Common Patterns and Best Practices](#common-patterns-and-best-practices)
- [Advanced Use Cases](#advanced-use-cases)
- [Migration Tips](#migration-tips)

## Basic Migration Patterns

1. Direct file reading:
```js
// Before (sync)
const json = csvToJson.getJsonFromCsv('input.csv');
console.log(json);

// After (async) - using Promises
csvToJson.getJsonFromCsvAsync('input.csv')
  .then(json => console.log(json))
  .catch(err => console.error('Error:', err));

// After (async) - using async/await
async function readCsv() {
  try {
    const json = await csvToJson.getJsonFromCsvAsync('input.csv');
    console.log(json);
  } catch (err) {
    console.error('Error:', err);
  }
}
```

2. File generation:
```js
// Before (sync)
csvToJson.generateJsonFileFromCsv('input.csv', 'output.json');

// After (async) - using Promises
csvToJson.generateJsonFileFromCsvAsync('input.csv', 'output.json')
  .then(() => console.log('File created'))
  .catch(err => console.error('Error:', err));
```

3. Chained operations:
```js
// Before (sync)
const json = csvToJson
  .fieldDelimiter(',')
  .formatValueByType()
  .getJsonFromCsv('input.csv');

// After (async)
await csvToJson
  .fieldDelimiter(',')
  .formatValueByType()
  .getJsonFromCsvAsync('input.csv');
```

## Common Patterns and Best Practices

1. Processing multiple files:
```js
// Sequential processing
async function processFiles(files) {
  const results = [];
  for (const file of files) {
    const json = await csvToJson.getJsonFromCsvAsync(file);
    results.push(json);
  }
  return results;
}

// Parallel processing
async function processFilesParallel(files) {
  const promises = files.map(file => 
    csvToJson.getJsonFromCsvAsync(file)
  );
  return Promise.all(promises);
}
```

2. Error handling:
```js
// Robust error handling
async function processWithRetry(file, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await csvToJson.getJsonFromCsvAsync(file);
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

3. Processing raw CSV data:
```js
// Processing CSV from network request
async function processCsvFromApi() {
  const response = await fetch('https://api.example.com/data.csv');
  const csvText = await response.text();
  return csvToJson.getJsonFromCsvAsync(csvText, { raw: true });
}
```

## Advanced Use Cases

1. Streaming large files with async iteration:
```js
const { createReadStream } = require('fs');
const { createInterface } = require('readline');

async function* processLargeCsv(filePath) {
  const fileStream = createReadStream(filePath);
  const lines = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const headers = await lines.next();
  for await (const line of lines) {
    const json = await csvToJson
      .getJsonFromCsvAsync(headers.value + '\n' + line, { raw: true });
    yield json[0];
  }
}

// Usage
for await (const record of processLargeCsv('large.csv')) {
  console.log(record);
}
```

2. Custom data transformation:
```js
async function processWithTransform(file) {
  const json = await csvToJson
    .formatValueByType()
    .getJsonFromCsvAsync(file);
  
  return json.map(record => ({
    ...record,
    timestamp: new Date().toISOString(),
    processed: true
  }));
}
```

3. Validation and filtering:
```js
async function processWithValidation(file) {
  const json = await csvToJson.getJsonFromCsvAsync(file);
  
  return json.filter(record => {
    // Validate required fields
    if (!record.id || !record.name) return false;
    // Validate data types
    if (typeof record.age !== 'number') return false;
    return true;
  });
}
```

## Migration Tips

1. **Gradual Migration**: You can mix sync and async code during migration
2. **Error Handling**: Always include proper error handling with async code
3. **Testing**: Test both success and error cases
4. **Performance**: Consider using `Promise.all()` for parallel processing
5. **Memory**: For large files, consider streaming approaches