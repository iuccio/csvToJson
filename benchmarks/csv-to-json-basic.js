'use strict';

const { readFileSync } = require('node:fs');
const { resolve: pathResolve } = require('node:path');
const { Bench } = require('tinybench');
const { CsvToJson } = require('../csv-to-json');

const csvFile = readFileSync(pathResolve(__dirname, '../test/resource/input.csv'), 'utf-8');
const csvFileWithQuotes = readFileSync(pathResolve(__dirname, '../test/resource/input_quoted_fields.csv'), 'utf-8');

const csv2json = new CsvToJson({
    delimiter: ';',
    supportQuotedField: true,
});

const bench = new Bench();

bench.add('csv-to-json basic', () => {
    csv2json.csvStringToJson(csvFile);
});
bench.add('csv-to-json csvFileWithQuotes', () => {
    csv2json.csvStringToJson(csvFileWithQuotes);
});

bench.run().then(() => {
    console.table(bench.table());
});
