# CSV to JSON Demo

This is a live demo of the CSV to JSON converter library, similar to PapaParse's demo.

## Features

- **Paste CSV Text**: Input CSV data directly in the textarea
- **Upload CSV Files**: Drag & drop or select CSV files to parse
- **Sample Data**: Try pre-loaded sample datasets
- **Parsing Options**:
  - Format values by type (numbers, booleans)
  - Support quoted fields (RFC 4180)
  - Custom field delimiters
  - Configurable header row index
- **Multiple Output Views**:
  - Table view for easy data inspection
  - JSON view with syntax highlighting
  - Statistics about the parsed data
- **Download**: Export parsed JSON data
- **Responsive Design**: Works on desktop and mobile devices

## How It Works

The demo is built using Browserify to bundle the entire library and demo application into a single JavaScript file that runs entirely in the browser. No server-side processing is required.

## Try It Out

Visit the live demo at: [https://iuccio.github.io/csvToJson/](https://iuccio.github.io/csvToJson/)

## Building the Demo

To build the demo locally:

```bash
npm run build:all
```

This creates:
- `dist/csvToJson.browser.js` - Standalone browser bundle of the library
- `docs/demo.bundle.js` - Complete demo bundle including library and UI code

## Deployment

This demo is deployed using GitHub Pages from the `docs/` folder. The demo is completely static and requires no build process on the server.