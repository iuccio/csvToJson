# CSVtoJSON
Convert *csv* file to *JSON* file with Node.js. 
**This project is not dependent on others packages or libraries.**

The cvs file must be **; separated**.

Give an input file like:

|first_name|last_name|email|gender|age|
|----------|:-------:|:---:|:----:|:-:|
|Constantin|Langsdon|clangsdon0@hc360.com|Male|96|
|Norah|Raison|nraison1@wired.com|Female|32|

or:
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

## Prerequisites
**npm**. [Installing npm](https://docs.npmjs.com/getting-started/installing-node).

## npm
npm package [convert-csv-to-json](https://www.npmjs.com/package/convert-csv-to-json).

### Install
In terminal: 
```{r, engine='bash', count_lines}
npm i convert-csv-to-json
```


### Usage
```js
let csvToJson = require('convert-csv-to-json');

let fileInputName = './input.csv'; 
let fileOutputName = './output.json';

csvToJson.jsonToCsv(fileInputName,fileOutputName);
```

## License

CSVtoJSON is licensed under the GNU General Public License v3.0 [License](LICENSE).
