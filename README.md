# vscode-fuzzy-scorer

[![Build Status](https://travis-ci.com/goliney/vscode-fuzzy-scorer.svg?branch=master)](https://travis-ci.com/goliney/vscode-fuzzy-scorer)
[![npm version](https://badge.fury.io/js/vscode-fuzzy-scorer.svg)](https://www.npmjs.com/package/vscode-fuzzy-scorer)

A shameless rip off of [vscode](https://github.com/Microsoft/vscode/) fuzzy scorer module
used to search files and stuff.

## Install

```shell script
npm install --save vscode-fuzzy-scorer
```

## Usage
```js
import { compareFilePathsByFuzzyScore } from 'vscode-fuzzy-scorer';

const pathA = '/some/path/fileA.txt';
const pathB = '/some/path/other/fileB.txt';
const pathC = '/unrelated/some/path/other/fileC.txt';

const query = 'path fileB';

const result = [pathA, pathB, pathC].sort((r1, r2) =>
  compareFilePathsByFuzzyScore({ itemA: r1, itemB: r2, query })
);

console.log(result);

/*
Result:
[
  '/some/path/other/fileB.txt'
  '/some/path/fileA.txt'
  '/unrelated/some/path/other/fileC.txt'
]
*/
```
or

```js
const path = '/xyz/some/path/someFile123.txt';
const query = 'xyz some';
const result = scoreFilePathFuzzy({ path, query });

console.log(result);

/*
Result:
{
  "score": 131098,
  "labelMatch": [
    {
      "start": 0,
      "end": 4
    }
  ],
  "descriptionMatch": [
    {
      "start": 1,
      "end": 4
    }
  ]
}
*/
```
