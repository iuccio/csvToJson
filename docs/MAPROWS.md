# mapRows Feature - Usage Guide

The `mapRows()` feature allows you to transform, filter, or enrich each CSV row after conversion to JSON.

## Basic Usage

### Transform Rows

```javascript
const csvToJson = require('convert-csv-to-json');

// Transform each row - uppercase the firstName
const result = csvToJson
  .fieldDelimiter(',')
  .mapRows((row, index) => {
    row.firstName = row.firstName.toUpperCase();
    return row;
  })
  .getJsonFromCsv('input.csv');
```

### Add New Properties

```javascript
// Add computed properties to each row
const result = csvToJson
  .fieldDelimiter(',')
  .mapRows((row, index) => {
    row.rowNumber = index + 1;
    row.fullName = `${row.firstName} ${row.lastName}`;
    return row;
  })
  .csvStringToJson(csvString);
```

### Filter Rows

```javascript
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

### Complex Row Transformation

```javascript
// Transform the entire row structure
const result = csvToJson
  .fieldDelimiter(',')
  .mapRows((row, index) => {
    return {
      id: index,
      person: {
        name: `${row.firstName} ${row.lastName}`,
        email: row.email
      },
      metadata: {
        processed: true,
        timestamp: new Date().toISOString()
      }
    };
  })
  .getJsonFromCsv('input.csv');
```

## API

### `mapRows(mapperFunction)`

**Parameters:**
- `mapperFunction` (Function): A callback function that transforms each row
  - Parameters:
    - `row` (Object): The JSON object representing the current row
    - `index` (Number): The 0-based index of the current row
  - Return value:
    - Return the (possibly modified) row object to keep the row
    - Return `null` or `undefined` to filter out the row

**Returns:** `this` for method chaining

**Throws:** `TypeError` if mapperFn is not a function

## Examples

### Example 1: Data Validation and Cleaning

```javascript
const result = csvToJson
  .fieldDelimiter(',')
  .formatValueByType(true)
  .mapRows((row) => {
    // Clean email
    row.email = row.email.toLowerCase().trim();
    
    // Validate age
    if (row.age < 0 || row.age > 150) {
      return null; // Filter invalid rows
    }
    
    return row;
  })
  .getJsonFromCsv('data.csv');
```

### Example 2: Data Enrichment

```javascript
const result = csvToJson
  .fieldDelimiter(',')
  .mapRows((row, index) => {
    // Add ID and processing date
    row.id = index + 1000;
    row.processedDate = new Date().toISOString();
    
    // Categorize by age
    if (row.age < 18) {
      row.category = 'minor';
    } else if (row.age < 65) {
      row.category = 'adult';
    } else {
      row.category = 'senior';
    }
    
    return row;
  })
  .getJsonFromCsv('people.csv');
```

### Example 3: CSV String with Mapping

```javascript
const csvString = 'id,name,score\n1,Alice,95\n2,Bob,87\n3,Charlie,92';

const result = csvToJson
  .fieldDelimiter(',')
  .mapRows((row) => {
    // Convert score to number and add grade
    const score = parseFloat(row.score);
    row.score = score;
    row.grade = score >= 90 ? 'A' : score >= 80 ? 'B' : 'C';
    return row;
  })
  .csvStringToJson(csvString);

// Result:
// [
//   { id: '1', name: 'Alice', score: 95, grade: 'A' },
//   { id: '2', name: 'Bob', score: 87, grade: 'B' },
//   { id: '3', name: 'Charlie', score: 92, grade: 'A' }
// ]
```

## Chaining

The `mapRows()` method is fully chainable with other configuration methods:

```javascript
const result = csvToJson
  .formatValueByType(true)
  .fieldDelimiter(',')
  .trimHeaderFieldWhiteSpace(true)
  .mapRows(mapper)
  .supportQuotedField(true)
  .getJsonFromCsv('input.csv');
```

## Browser Usage

The feature is also available in the browser API:

```javascript
const convert = require('convert-csv-to-json');

const mapper = (row, index) => {
  row.processed = true;
  return row;
};

const json = await convert.browser
  .mapRows(mapper)
  .parseFile(fileInputElement.files[0]);
```

## Performance Notes

- The mapper function is called for each data row (after the header row)
- Row indices are 0-based and only count data rows (header row is not included)
- Filtering with `null` returns is more efficient than creating large intermediate arrays if you only need a subset of rows
