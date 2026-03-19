# Error Handling Guide

This library provides comprehensive, actionable error messages to help you quickly identify and fix issues when parsing CSV files.

## Error Categories

All errors are categorized into specific types that inherit from `CsvParsingError`, making them easier to catch and handle programmatically.

### 1. Input Validation Errors (`InputValidationError`)

These errors occur when invalid input is provided to a function.

**Example:**
```
InputValidationError: Invalid input: Parameter 'csvString' is required.
Expected: string
Received: undefined
Provide valid CSV content as a string to parse.
```

**Common causes:**
- Missing required parameters
- Wrong data type passed (e.g., number instead of string)
- Null or undefined values

**How to fix:**
- Verify all required parameters are provided
- Check that parameters match the expected type
- Review the function signature in the documentation

### 2. Configuration Errors (`ConfigurationError`)

These occur when configuration options conflict with each other or are invalid.

**Example:**
```
ConfigurationError: Configuration conflict: supportQuotedField() is enabled, 
but fieldDelimiter is set to '"'.

The quote character (") cannot be used as a field delimiter, separator, 
or sub-array delimiter when quoted field support is active.

Solutions:
  1. Use a different character for fieldDelimiter (e.g., '|', '\t', ';')
  2. Disable supportQuotedField() if your CSV doesn't contain quoted fields
  3. Refer to RFC 4180 for proper CSV formatting
```

**Common causes:**
- Using quote character (`"`) as a delimiter with `supportQuotedField(true)`
- Invalid header index (not a number)
- Incompatible configuration combinations

**How to fix:**
- Follow the solutions provided in the error message
- Ensure `indexHeader()` receives a numeric value
- Review configuration method combinations in the documentation

### 3. CSV Format Errors (`CsvFormatError`)

These occur when the CSV data itself is malformed.

**Example - Missing Header:**
```
CsvFormatError: CSV parsing error: No header row found.
The CSV file appears to be empty or has no valid header line.

Solutions:
  1. Ensure your CSV file contains at least one row (header row)
  2. Verify the file is not empty or contains only whitespace
  3. Check if you need to use indexHeader(n) to specify a non-standard header row
```

**Example - Mismatched Quotes:**
```
CsvFormatError: CSV parsing error: Mismatched quotes detected in CSV.
A quoted field was not properly closed with a matching quote character.

RFC 4180 rules for quoted fields:
  • Fields containing delimiters or quotes MUST be enclosed in double quotes
  • To include a quote within a quoted field, use two consecutive quotes: ""
  • Example: "Smith, John" (name contains comma)
  • Example: "He said ""Hello""" (text contains quotes)

Solutions:
  1. Review your CSV for properly paired quote characters
  2. Use double quotes ("") to escape quotes within quoted fields
  3. Ensure all commas within field values are inside quotes
  4. Enable supportQuotedField(true) if you're using quoted fields
```

**Common causes:**
- Empty CSV files
- Missing or unpaired quote characters
- Incorrect escaping of quotes within quoted fields
- Line breaks in unexpected places

**How to fix:**
- Validate your CSV file format with an online CSV validator
- Check that all quoted fields are properly closed
- Use double quotes (`""`) to escape quotes within fields
- Ensure quoted fields span complete records when using `supportQuotedField(true)`

### 4. File Operation Errors (`FileOperationError`)

These occur when there are issues reading or writing files.

**Example:**
```
FileOperationError: File operation error: Failed to read file.
File path: /path/to/missing/file.csv
Reason: ENOENT: no such file or directory, open '/path/to/missing/file.csv'

Solutions:
  1. Verify the file path is correct: /path/to/missing/file.csv
  2. Check file permissions (read access for input, write access for output)
  3. Ensure the directory exists and is writable for output files
  4. Verify the file is not in use by another process
```

**Common causes:**
- File path is incorrect or doesn't exist
- Insufficient file permissions
- Output directory doesn't exist
- File is locked by another process

**How to fix:**
- Use absolute paths or verify relative paths are correct
- Check file permissions: `ls -l filename.csv`
- Create output directories before writing: `mkdir -p output_dir`
- Close any applications that may have the file open
- Verify encoding if dealing with special characters

### 5. JSON Validation Errors (`JsonValidationError`)

These occur when parsed CSV generates invalid JSON.

**Example:**
```
JsonValidationError: JSON validation error: The parsed CSV data generated 
invalid JSON. This typically indicates malformed field names or values in the CSV.

Original error: Unexpected token } in JSON at position 45

Solutions:
  1. Check that field names are valid JavaScript identifiers
  2. Review the CSV data for special characters that aren't properly escaped
  3. Enable supportQuotedField(true) for fields containing special characters
  4. Verify that formatValueByType() isn't converting values incorrectly
```

**Common causes:**
- Invalid characters in header/field names
- Special characters not properly escaped in values
- Circular references or invalid JSON structures
- Field names conflicting with JavaScript reserved words

**How to fix:**
- Ensure header names follow JavaScript identifier rules (alphanumeric, underscore, dollar sign)
- Enable `supportQuotedField(true)` for complex values
- Review special characters in your CSV
- Use `formatValueByType(false)` if value conversion is causing issues

### 6. Browser API Errors (`BrowserApiError`)

These are specific to browser environments using the FileReader API.

**Example - FileReader Not Available:**
```
BrowserApiError: Browser compatibility error: FileReader API is not available.
Your browser does not support the FileReader API required for file parsing.

Solutions:
  1. Use a modern browser that supports FileReader (Chrome 13+, Firefox 10+, Safari 6+)
  2. Consider using csvStringToJson() or csvStringToJsonAsync() for string-based parsing
  3. Implement a polyfill or alternative file reading method
```

**Example - File Parse Error:**
```
BrowserApiError: Browser file parsing error: Failed to read and parse the file.
Error details: Unexpected end of JSON input

Solutions:
  1. Verify the file is a valid CSV file
  2. Check the file encoding (UTF-8 is recommended)
  3. Try a smaller file to isolate the issue
  4. Check browser console for additional error details
```

**Common causes:**
- Using older browsers that don't support FileReader
- File encoding issues (non-UTF-8)
- Corrupted file data
- Cross-origin restrictions

**How to fix:**
- Update to a modern browser
- Use string-based methods for alternative file sources
- Ensure files are UTF-8 encoded
- Check browser console for detailed error information

## Error Handling in Code

### Synchronous Example

```js
const csvToJson = require('convert-csv-to-json');

try {
  const data = csvToJson
    .fieldDelimiter(',')
    .supportQuotedField(true)
    .getJsonFromCsv('data.csv');
  
  console.log(`Parsed ${data.length} records`);
} catch (error) {
  // Access error details programmatically
  if (error.name === 'ConfigurationError') {
    console.error('Fix your configuration:', error.message);
  } else if (error.name === 'FileOperationError') {
    console.error('Check file path and permissions:', error.context.filePath);
  } else if (error.name === 'CsvFormatError') {
    console.error('Fix your CSV file:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Asynchronous Example

```js
const csvToJson = require('convert-csv-to-json');

async function processCSV() {
  try {
    const data = await csvToJson
      .fieldDelimiter(',')
      .formatValueByType()
      .getJsonFromCsvAsync('data.csv');
    
    return data;
  } catch (error) {
    // Handle specific error types
    switch (error.name) {
      case 'InputValidationError':
        console.error('Invalid input provided');
        break;
      case 'FileOperationError':
        console.error(`Cannot read file: ${error.context.filePath}`);
        break;
      case 'CsvFormatError':
        console.error('CSV format is invalid');
        break;
      default:
        console.error('Unexpected error:', error);
    }
    
    // Re-throw or handle as needed
    throw error;
  }
}
```

### Browser Example

```js
const { browser } = require('convert-csv-to-json');

async function handleFileUpload(event) {
  const file = event.target.files[0];
  
  try {
    const data = await browser.parseFile(file);
    console.log(`Loaded ${data.length} records`);
  } catch (error) {
    if (error.name === 'BrowserApiError') {
      if (error.message.includes('FileReader')) {
        // Fallback to string parsing
        console.warn('FileReader not available, use string parsing instead');
      }
    }
    
    // Display user-friendly error message
    alert(`Error: ${error.message.split('\n')[0]}`);
  }
}
```

## Error Properties

All custom errors include helpful properties for programmatic handling:

```js
try {
  csvToJson.getJsonFromCsv('file.csv');
} catch (error) {
  console.log(error.name);           // e.g., 'FileOperationError'
  console.log(error.code);           // e.g., 'FILE_OPERATION_ERROR'
  console.log(error.message);        // Full error message with solutions
  console.log(error.context);        // Object with error details
  console.log(error.context.operation); // e.g., 'read'
  console.log(error.context.filePath);  // e.g., '/path/to/file.csv'
}
```

## Best Practices

1. **Always use try-catch** for error handling
2. **Check error types** to provide specific recovery strategies
3. **Log or display helpful context** from `error.message`
4. **Test edge cases** like empty files, special characters, and encodings
5. **Validate CSV format** before processing with this library
6. **Use semantic versioning** - error message improvements are non-breaking

## Debugging Tips

### Enable Verbose Logging

```js
const csvToJson = require('convert-csv-to-json');

try {
  const data = csvToJson.getJsonFromCsv('data.csv');
} catch (error) {
  // Print full error object for debugging
  console.error('Full error object:', error);
  console.error('Stack trace:', error.stack);
}
```

### Test with Valid CSV

```csv
firstName,lastName,email
John,Doe,john@example.com
"Smith, Jr.",Jane,jane@example.com
```

### Validate Your CSV

Use online CSV validators:
- https://csvlint.io/
- https://www.csvquickio.com/validator
- https://www.textfixer.com/tools/csv-validator

## Getting Help

If you encounter an error:

1. Read the error message carefully - it includes solutions
2. Check the relevant section in this guide
3. Review [RFC 4180](https://tools.ietf.org/html/rfc4180) for CSV standards
4. Search existing [GitHub issues](https://github.com/iuccio/csvToJson/issues)
5. Create a new issue with:
   - Full error message
   - Your CSV sample (redacted if sensitive)
   - Your Node.js version
   - Your configuration code

## See Also

- [RFC 4180 CSV Standard](https://tools.ietf.org/html/rfc4180)
- [SYNC.md](./SYNC.md) - Synchronous API reference
- [ASYNC.md](./ASYNC.md) - Asynchronous API reference
- [BROWSER.md](./BROWSER.md) - Browser API reference
