# CSVtoJSON 
[![Build Status](https://travis-ci.org/iuccio/csvToJson.svg?branch=master)](https://travis-ci.org/iuccio/csvToJson) [![Code Climate](https://codeclimate.com/github/iuccio/csvToJson/badges/gpa.svg)](https://codeclimate.com/github/iuccio/csvToJson)
[![NPM Version](https://img.shields.io/npm/v/convert-csv-to-json.svg)](https://npmjs.org/package/convert-csv-to-json)
[![Downloads](https://img.shields.io/npm/dm/convert-csv-to-json.svg)](https://npmjs.org/package/convert-csv-to-json)

**This project is not dependent on others packages or libraries.**

## Table of Contents
1. [Description](#description)
1. [Prerequisites](#prerequisites)
1. [Install npm *convert-csv-to-json package*](#install-npm-convert-csv-to-json-package)
1. [Usage](#usage)
    * [Generate JSON file](#generate-json-file)
    * [Generate Array of Object in JSON format](#generate-array-of-object-in-json-format)
    * [Define field delimiter](#define-field-delimiter)
    * [Format property value by type](#format-property-value-by-type)
1. [License](#license)


## Description
Converts *csv* files to *JSON* files with Node.js. 

Give an input file like:

|first_name|last_name|email|gender|age|
|:----------:|:-------:|:---:|:----:|:---:|
|Constantin|Langsdon|clangsdon0@hc360.com|Male|96|
|Norah|Raison|nraison1@wired.com|Female|32|

e.g. :
```json
first_name;last_name;email;gender;age
Constantin;Langsdon;clangsdon0@hc360.com;Male;96
Norah;Raison;nraison1@wired.com;Female;32
```

will generate:


```json
[
 {
  "first_name": "Constantin",
  "last_name": "Langsdon",
  "email": "clangsdon0@hc360.com",
  "gender": "Male",
  "age": "96"
 },
 {
  "first_name": "Norah",
  "last_name": "Raison",
  "email": "nraison1@wired.com",
  "gender": "Female",
  "age": "32"
 }
]
```

## Prerequisites
**NPM** (see [Installing Npm](https://docs.npmjs.com/getting-started/installing-node)).

## Install npm *convert-csv-to-json package*
Go to NPM package [convert-csv-to-json](https://www.npmjs.com/package/convert-csv-to-json).

### Install
Install package in your *package.json*
```bash
$ npm install convert-csv-to-json --save
```
Install package on your machine
```bash
$ npm install -g convert-csv-to-json
```

### Usage
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
#### Define field delimiter
As default the filed delimiter is the **semicolon** (**;**). You can define another field delimiter 
by call the function ```fieldDelimiter(myDilimiter)```.
If you want that the field delimiter is a **~**:

```js
 csvToJson.fieldDelimiter('~') .getJsonFromCsv(fileInputName);
```


#### Format property value by type
If you want that a number will be printed as a Number type and not as a String type, use:
```js
 csvToJson.formatValueByType().getJsonFromCsv(fileInputName);
```
In this case the result will be: 

```json
[
 {
  "first_name": "Constantin",
  "last_name": "Langsdon",
  "email": "clangsdon0@hc360.com",
  "gender": "Male",
  "age": 96
 },
 {
  "first_name": "Norah",
  "last_name": "Raison",
  "email": "nraison1@wired.com",
  "gender": "Female",
  "age": 32
 }
]
```
The property **age** is printed as 
```json
 "age": 32
```
instead of
```json
  "age": "32"
 ```
 
## License

CSVtoJSON is licensed under the GNU General Public License v3.0 [License](LICENSE).
