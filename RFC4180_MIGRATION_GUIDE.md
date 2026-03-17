# RFC 4180 Migration Guide

## Overview

This guide helps developers migrate to csvToJson v3.21.0, which introduces **full RFC 4180 compliance**. RFC 4180 is the standard specification for CSV (Comma-Separated Values) files.

**⏱️ Estimated reading time: 15-20 minutes**

---

## Table of Contents

1. [What is RFC 4180?](#what-is-rfc-4180)
2. [Breaking Changes](#breaking-changes)
3. [Migration Checklist](#migration-checklist)
4. [Quick Migration Examples](#quick-migration-examples)
5. [Detailed Migration Scenarios](#detailed-migration-scenarios)
6. [Testing Your Migration](#testing-your-migration)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## What is RFC 4180?

RFC 4180 is the Internet Engineering Task Force (IETF) standard specification for CSV files. It defines:

### Key Specifications

| Aspect | RFC 4180 Standard |
|--------|-------------------|
| **Field Delimiter** | Comma (`,`) |
| **Record Delimiter** | CRLF (`\r\n`) or LF (`\n`) |
| **Quote Character** | Double-quote (`"`) |
| **Quoted Fields** | Allowed for any field |
| **Quote Escaping** | Use double quotes (`""`) |
| **MIME Type** | `text/csv` |
| **Charset** | UTF-8 (recommended) |

### RFC 4180 CSV Example

```csv
firstName,lastName,email,status
"Smith, John",Smith,john@example.com,"Active, Verified"
Jane,Doe,jane@example.com,"Inactive"
"Cooper, Andy",Cooper,"andy@company.com, andy.cooper@home.com","Active"
```

**Key Features Demonstrated:**
- Comma delimiters
- Quoted fields containing commas
- Escaped quotes using `""`
- Field names (header row)

---

## Breaking Changes

### 1. Default Delimiter: Semicolon → Comma

**The most significant breaking change**

#### Context
- **Before**: Default delimiter was semicolon (`;`)
- **After**: Default delimiter is comma (`,`) - per RFC 4180 standard
- **Reason**: RFC 4180 specifies comma as the standard delimiter

#### Impact Analysis

| Scenario | Impact | Action Required |
|----------|--------|-----------------|
| Using explicit `.fieldDelimiter()` | ✅ None | No changes needed |
| Parsing comma-delimited CSV | ✅ Improved | May see better results |
| Parsing semicolon-delimited CSV | ❌ Breaking | Add `.fieldDelimiter(';')` |
| No delimiter configuration | ❌ Breaking | Verify CSV format |

#### Before Code (Old Behavior)
```javascript
const csvToJson = require('convert-csv-to-json');

// Assuming file uses semicolons as delimiter
// data.csv:
// name;email;age
// John;john@example.com;30

let result = csvToJson.getJsonFromCsv('data.csv');
// Works - automatically used semicolon
```

#### After Code (New RFC 4180 Behavior)
```javascript
const csvToJson = require('convert-csv-to-json');

// data.csv (with semicolons):
// name;email;age
// John;john@example.com;30

let result = csvToJson.getJsonFromCsv('data.csv');
// ❌ BREAKS - expects comma delimiter now
// Result: { 'name;email;age': 'John;john@example.com;30' }

// ✅ FIX: Explicitly set semicolon delimiter
let result = csvToJson.fieldDelimiter(';').getJsonFromCsv('data.csv');
// Works correctly
```

### 2. Removed Deprecated Function `jsonToCsv()`

**This function has been completely removed**

#### Before
```javascript
csvToJson.jsonToCsv('input.csv', 'output.json');
```

#### After
```javascript
csvToJson.generateJsonFileFromCsv('input.csv', 'output.json');
```

### 3. Stricter Quoted Field Parsing

RFC 4180 compliance means stricter adherence to the standard.

#### Quote Escaping Changes

**Before (Non-compliant):**
```javascript
// Input CSV: name,description
//            "John","He said ""Hello"""

let result = csvToJson.supportQuotedField(true).csvStringToJson(csv);
// Result might have inconsistent quote handling
```

**After (RFC 4180 Compliant):**
```javascript
// Input CSV: name,description
//            "John","He said ""Hello"""

let result = csvToJson.supportQuotedField(true).csvStringToJson(csv);
// Result correctly unescapes to: He said "Hello"
```

#### Multi-line Field Handling

**Before:**
- Multi-line fields in quoted regions might not parse correctly

**After:**
- Full support for multi-line fields within quoted regions
- Newlines preserved inside quoted fields
- Line ending detection: CRLF, LF, CR all supported

```javascript
let csv = 'id,description\n' +
          '1,"Multi-line\ndescription\nhere"\n' +
          '2,"Single line"\n';

let result = csvToJson.supportQuotedField(true).csvStringToJson(csv);
// Correctly handles newlines inside quoted fields
```

---

## Migration Checklist

Use this checklist to identify and fix breaking changes:

- [ ] **Audit CSV files** - Identify delimiter used (`,`, `;`, `|`, `\t`, etc.)
- [ ] **Search codebase** - Find all `csvToJson` calls
- [ ] **Check default usage** - Look for calls without `.fieldDelimiter()`
- [ ] **Update non-comma delimiters** - Add `.fieldDelimiter()` calls
- [ ] **Replace deprecated functions** - Change `jsonToCsv()` to `generateJsonFileFromCsv()`
- [ ] **Test quoted fields** - Verify fields with quotes parse correctly
- [ ] **Test multi-line fields** - Verify newlines in fields work
- [ ] **Run test suite** - Execute existing tests to find issues
- [ ] **Update documentation** - Document any changes to your API

---

## Quick Migration Examples

### Scenario 1: Semicolon-Delimited Files

**Affected Code:**
```javascript
// Before (v3.20 and earlier)
const csvToJson = require('convert-csv-to-json');
let data = csvToJson.getJsonFromCsv('data.csv'); // Worked with semicolons
```

**Migration:**
```javascript
// After (v3.21)
const csvToJson = require('convert-csv-to-json');
let data = csvToJson.fieldDelimiter(';').getJsonFromCsv('data.csv');
```

### Scenario 2: Tab-Delimited Files

**Affected Code:**
```javascript
// Before
let data = csvToJson.getJsonFromCsv('data.tsv');
```

**Migration:**
```javascript
// After
let data = csvToJson.fieldDelimiter('\t').getJsonFromCsv('data.tsv');
```

### Scenario 3: Pipe-Delimited Files

**Affected Code:**
```javascript
// Before
let data = csvToJson.getJsonFromCsv('data.psv');
```

**Migration:**
```javascript
// After
let data = csvToJson.fieldDelimiter('|').getJsonFromCsv('data.psv');
```

### Scenario 4: Standard Comma-Delimited CSV

**No Changes Needed:**
```javascript
// Before (already works the same)
let data = csvToJson.getJsonFromCsv('data.csv');

// After (still works the same)
let data = csvToJson.getJsonFromCsv('data.csv');
// Now works out-of-the-box without explicit delimiter!
```

### Scenario 5: Remove Deprecated Function

**Before:**
```javascript
csvToJson.jsonToCsv('input.csv', 'output.json');
```

**After:**
```javascript
csvToJson.generateJsonFileFromCsv('input.csv', 'output.json');
```

---

## Detailed Migration Scenarios

### Scenario A: Express.js CSV Upload Handler

**Original Code (Pre-RFC 4180):**
```javascript
const express = require('express');
const csvToJson = require('convert-csv-to-json');
const app = express();

app.post('/upload', (req, res) => {
  try {
    // Assumes semicolon delimiter (old default)
    let result = csvToJson.getJsonFromCsv(req.file.path);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

**Migrated Code (RFC 4180 Compliant):**
```javascript
const express = require('express');
const csvToJson = require('convert-csv-to-json');
const app = express();

app.post('/upload', (req, res) => {
  try {
    // Detect delimiter or use user-provided delimiter
    const delimiter = req.body.delimiter || ','; // Default to comma (RFC 4180)
    
    let result = csvToJson
      .fieldDelimiter(delimiter)
      .supportQuotedField(true)
      .getJsonFromCsv(req.file.path);
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Scenario B: Batch CSV Processing Script

**Original Code:**
```javascript
const csvToJson = require('convert-csv-to-json');
const fs = require('fs');
const path = require('path');

// Process all CSV files in a directory
const csvDir = './data/csv';
fs.readdirSync(csvDir).forEach(file => {
  if (file.endsWith('.csv')) {
    const csvPath = path.join(csvDir, file);
    const result = csvToJson.getJsonFromCsv(csvPath);
    console.log(`Processed ${file}: ${result.length} records`);
  }
});
```

**Migrated Code:**
```javascript
const csvToJson = require('convert-csv-to-json');
const fs = require('fs');
const path = require('path');

// Configuration by file extension or name pattern
const delimiterConfig = {
  'semicolon': ';',
  'tab': '\t',
  'pipe': '|',
  'default': ','
};

function detectDelimiter(filename) {
  // Example: detect based on filename pattern
  if (filename.includes('semi')) return delimiterConfig.semicolon;
  if (filename.includes('tsv')) return delimiterConfig.tab;
  if (filename.includes('pipe')) return delimiterConfig.pipe;
  return delimiterConfig.default; // RFC 4180 default
}

// Process all CSV files in a directory
const csvDir = './data/csv';
fs.readdirSync(csvDir).forEach(file => {
  if (file.endsWith('.csv') || file.endsWith('.tsv')) {
    const csvPath = path.join(csvDir, file);
    const delimiter = detectDelimiter(file);
    
    try {
      const result = csvToJson
        .fieldDelimiter(delimiter)
        .supportQuotedField(true)
        .getJsonFromCsv(csvPath);
      console.log(`✓ Processed ${file}: ${result.length} records`);
    } catch (error) {
      console.error(`✗ Error processing ${file}: ${error.message}`);
    }
  }
});
```

### Scenario C: Data Import with Validation

**Original Code:**
```javascript
const csvToJson = require('convert-csv-to-json');

function importUserData(csvFile) {
  let data = csvToJson.getJsonFromCsv(csvFile);
  
  // Validate and import
  data.forEach(user => {
    if (user.email && user.name) {
      saveUser(user);
    }
  });
}
```

**Migrated Code:**
```javascript
const csvToJson = require('convert-csv-to-json');

function importUserData(csvFile, options = {}) {
  const delimiter = options.delimiter || ','; // RFC 4180 default
  const hasQuotedFields = options.hasQuotedFields !== false; // Default true
  
  try {
    let data = csvToJson
      .fieldDelimiter(delimiter)
      .supportQuotedField(hasQuotedFields)
      .formatValueByType(true) // Format values by type
      .getJsonFromCsv(csvFile);
    
    // Validate and import
    const imported = [];
    const errors = [];
    
    data.forEach((user, index) => {
      if (user.email && user.name) {
        try {
          saveUser(user);
          imported.push(user.email);
        } catch (error) {
          errors.push(`Row ${index + 2}: ${error.message}`);
        }
      } else {
        errors.push(`Row ${index + 2}: Missing email or name`);
      }
    });
    
    return { imported, errors };
  } catch (error) {
    throw new Error(`CSV processing failed: ${error.message}`);
  }
}
```

### Scenario D: Backward Compatibility Wrapper

**If you need to maintain backward compatibility:**

```javascript
const csvToJsonLib = require('convert-csv-to-json');

// Wrapper with backward-compatible defaults
class CSVConverter {
  constructor(options = {}) {
    // Use RFC 4180 standard by default, but allow override
    this.defaultDelimiter = options.defaultDelimiter || ',';
    this.legacyMode = options.legacyMode || false;
  }
  
  getJsonFromCsv(filepath, options = {}) {
    const delimiter = options.delimiter || this.defaultDelimiter;
    
    // In legacy mode, default to semicolon
    if (this.legacyMode && !options.delimiter) {
      return csvToJsonLib
        .fieldDelimiter(';')
        .getJsonFromCsv(filepath);
    }
    
    return csvToJsonLib
      .fieldDelimiter(delimiter)
      .supportQuotedField(options.supportQuotedField !== false)
      .getJsonFromCsv(filepath);
  }
}

// Usage - RFC 4180 mode (default)
const converter = new CSVConverter();
let data = converter.getJsonFromCsv('data.csv');

// Usage - Legacy mode (backward compatible)
const legacyConverter = new CSVConverter({ legacyMode: true });
let legacyData = legacyConverter.getJsonFromCsv('legacy_data.csv');

// Usage - Custom delimiter
let tabData = converter.getJsonFromCsv('data.tsv', { delimiter: '\t' });
```

---

## Testing Your Migration

### Step 1: Unit Tests

Create tests to verify both old and new behavior:

```javascript
const csvToJson = require('convert-csv-to-json');

describe('RFC 4180 Migration Tests', () => {
  test('should parse comma-delimited CSV (RFC 4180 default)', () => {
    const csv = 'name,age\nJohn,30\nJane,25\n';
    const result = csvToJson.csvStringToJson(csv);
    
    expect(result.length).toBe(2);
    expect(result[0].name).toBe('John');
  });
  
  test('should parse semicolon-delimited CSV with explicit delimiter', () => {
    const csv = 'name;age\nJohn;30\nJane;25\n';
    const result = csvToJson
      .fieldDelimiter(';')
      .csvStringToJson(csv);
    
    expect(result.length).toBe(2);
    expect(result[0].name).toBe('John');
  });
  
  test('should handle quoted fields per RFC 4180', () => {
    const csv = 'name,description\n"Smith, John","He said ""Hello"""\n';
    const result = csvToJson
      .supportQuotedField(true)
      .csvStringToJson(csv);
    
    expect(result[0].name).toBe('Smith, John');
    expect(result[0].description).toBe('He said "Hello"');
  });
});
```

### Step 2: Integration Tests

Test with real CSV files:

```javascript
describe('Real CSV File Integration', () => {
  test('should process standard RFC 4180 CSV', () => {
    const result = csvToJson.getJsonFromCsv('./test/data/standard.csv');
    expect(result.length).toBeGreaterThan(0);
  });
  
  test('should process legacy semicolon-delimited CSV', () => {
    const result = csvToJson
      .fieldDelimiter(';')
      .getJsonFromCsv('./test/data/legacy.csv');
    expect(result.length).toBeGreaterThan(0);
  });
});
```

### Step 3: Validation Checklist

```javascript
// Test for correct parsing
✓ Basic parsing works
✓ Field count matches headers
✓ Empty fields handled correctly
✓ Quoted fields with commas work
✓ Escaped quotes unescaped correctly
✓ Multi-line fields preserved
✓ Line endings detected correctly (CRLF, LF, CR)
✓ Special characters preserved
✓ Type formatting works
✓ Boolean/number conversion works
✓ Error handling for malformed CSV
```

---

## Troubleshooting

### Problem 1: "Headers Not Found" Error

**Symptom:**
```javascript
// Works in v3.20, breaks in v3.21
csvToJson.getJsonFromCsv('mydata.csv');
// Error: No header row found in CSV
```

**Cause:** File likely uses semicolon delimiter (old default changed to comma)

**Solution:**
```javascript
// Add explicit delimiter
csvToJson.fieldDelimiter(';').getJsonFromCsv('mydata.csv');

// Or inspect the file first
const fs = require('fs');
const firstLine = fs.readFileSync('mydata.csv', 'utf8').split('\n')[0];
console.log('First line:', firstLine);
// Count delimiters to detect type
```

### Problem 2: Fields Not Splitting Correctly

**Symptom:**
```javascript
// One field shows entire row content
[{ 'field1;field2;field3': '...value...value...value' }]
```

**Cause:** Wrong delimiter configured or auto-detection failed

**Solution:**
```javascript
// Explicitly set the delimiter
csvToJson.fieldDelimiter(';').getJsonFromCsv('file.csv');

// Or auto-detect:
function detectDelimiter(filePath) {
  const fs = require('fs');
  const line = fs.readFileSync(filePath, 'utf8').split('\n')[0];
  
  const delimiters = [',', ';', '|', '\t'];
  for (let delim of delimiters) {
    if (line.includes(delim)) {
      return delim;
    }
  }
  return ','; // Default to RFC 4180
}

const delimiter = detectDelimiter('file.csv');
csvToJson.fieldDelimiter(delimiter).getJsonFromCsv('file.csv');
```

### Problem 3: Quoted Fields Not Working

**Symptom:**
```javascript
// With input: name,value
//             "John","He said ""Hi"""
let result = csvToJson.getJsonFromCsv('file.csv');
// Result shows: { name: '"John"', value: '"He said ""Hi"""' }
```

**Cause:** `.supportQuotedField()` not enabled

**Solution:**
```javascript
let result = csvToJson
  .supportQuotedField(true)
  .getJsonFromCsv('file.csv');
// Now works correctly
```

### Problem 4: `jsonToCsv` Function Not Found

**Symptom:**
```javascript
csvToJson.jsonToCsv('input.csv', 'output.json');
// TypeError: csvToJson.jsonToCsv is not a function
```

**Cause:** Function was removed (it was deprecated)

**Solution:**
```javascript
// Replace with the non-deprecated function
csvToJson.generateJsonFileFromCsv('input.csv', 'output.json');
```

### Problem 5: Multi-line Fields Not Preserved

**Symptom:**
```javascript
// Input has field with newlines inside quotes
// But newlines are stripped or cause parsing errors
```

**Cause:** Parsing multi-line data requires `supportQuotedField(true)`

**Solution:**
```javascript
let result = csvToJson
  .supportQuotedField(true)
  .getJsonFromCsv('file.csv');
// Newlines inside quoted fields now preserved
```

---

## FAQ

### Q: Do I need to update my code?

**A:** Only if you:
- Don't explicitly set `.fieldDelimiter()` and use non-comma delimiters
- Use the removed `jsonToCsv()` function
- Parse quoted CSV files without `.supportQuotedField(true)`

### Q: Is this a breaking change?

**A:** Yes, the default delimiter changed from semicolon to comma. However, most code using explicit `.fieldDelimiter()` is unaffected.

### Q: Why change the default delimiter?

**A:** RFC 4180 (the standard specification) defines comma as the standard delimiter. This makes the library RFC 4180 compliant out-of-the-box.

### Q: Can I still use semicolons?

**A:** Yes, just use: `.fieldDelimiter(';').getJsonFromCsv('file.csv')`

### Q: What about backward compatibility?

**A:** Existing code with explicit delimiters works without changes. Only code relying on the old default delimiter needs updates.

### Q: Can I detect the delimiter automatically?

**A:** Yes, see the troubleshooting section for delimiter detection code.

### Q: Are all my CSV files now broken?

**A:** Only if they use non-comma delimiters AND you were relying on the old default. Explicitly set the delimiter to fix.

### Q: What's RFC 4180?

**A:** It's the official IETF standard for CSV file format. Read more: https://tools.ietf.org/html/rfc4180

### Q: Do I need to update my tests?

**A:** Yes, update tests that assume the old semicolon default or test the removed `jsonToCsv()` function.

### Q: How do I test my migration?

**A:** Run existing tests first to identify failures, then update code and delimiters as needed. See "Testing Your Migration" section above.

### Q: What if I have legacy code I can't change?

**A:** You can create a wrapper class (see Scenario D) that uses the old default delimiter and maintains backward compatibility.

### Q: Where can I get help?

**A:** Check GitHub Issues: https://github.com/iuccio/csvToJson/issues

---

## Summary

**Key Points to Remember:**

1. **Default delimiter is now comma (`,`)** - per RFC 4180 standard
2. **Explicitly set delimiters** for non-comma files: `.fieldDelimiter(';')`
3. **Remove `jsonToCsv()` calls** - use `generateJsonFileFromCsv()` instead
4. **Enable quoted field support** for complex CSV: `.supportQuotedField(true)`
5. **Test thoroughly** - especially if not using explicit delimiters
6. **Refer to RFC 4180** - for standard CSV format specification

---

## Next Steps

1. ✅ Review breaking changes above
2. ✅ Audit your codebase for affected code
3. ✅ Update code with explicit delimiters as needed
4. ✅ Run tests to identify issues
5. ✅ Update affected tests
6. ✅ Deploy with confidence!

---

**For more information, see:**
- [Release Notes](./RELEASE_NOTES.md)
- [README](./README.md)
- [RFC 4180 Specification](https://tools.ietf.org/html/rfc4180)
