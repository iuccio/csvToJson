# CSVtoJSON
Convert *csv* file to *JSON* file with Node.js. 

Give an input file like:

|first_name|last_name|email|gender|age|
|----------|:-------:|:---:|:----:|:-:|
|Constantin|Langsdon|clangsdon0@hc360.com|Male|96|
|Norah|Raison|nraison1@wired.com|Female|32|

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
**Node.js** ([Install Node.js](https://nodejs.org/en/download/package-manager/)).

## Generate a JSON file
Type in terminal: ` node index.js `    

## License

CSVtoJSON is licensed under the GNU General Public License v3.0 [License](LICENSE).
