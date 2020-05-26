"use strict";

require("core-js/modules/es.string.replace");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stripWildcards = stripWildcards;
exports.isLowerAsciiLetter = isLowerAsciiLetter;
exports.isUpperAsciiLetter = isUpperAsciiLetter;
exports.equalsIgnoreCase = equalsIgnoreCase;
exports.startsWithIgnoreCase = startsWithIgnoreCase;

var _charCode = require("./charCode");

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See vscode.licence.txt for license information.
 *--------------------------------------------------------------------------------------------*/
function stripWildcards(pattern) {
  return pattern.replace(/\*/g, '');
}

function isLowerAsciiLetter(code) {
  return code >= _charCode.CharCode.a && code <= _charCode.CharCode.z;
}

function isUpperAsciiLetter(code) {
  return code >= _charCode.CharCode.A && code <= _charCode.CharCode.Z;
}

function isAsciiLetter(code) {
  return isLowerAsciiLetter(code) || isUpperAsciiLetter(code);
}

function equalsIgnoreCase(a, b) {
  return a.length === b.length && doEqualsIgnoreCase(a, b);
}

function doEqualsIgnoreCase(a, b, stopAt = a.length) {
  for (let i = 0; i < stopAt; i++) {
    const codeA = a.charCodeAt(i);
    const codeB = b.charCodeAt(i);

    if (codeA === codeB) {
      continue;
    } // a-z A-Z


    if (isAsciiLetter(codeA) && isAsciiLetter(codeB)) {
      const diff = Math.abs(codeA - codeB);

      if (diff !== 0 && diff !== 32) {
        return false;
      }
    } // Any other charcode
    else {
        if (String.fromCharCode(codeA).toLowerCase() !== String.fromCharCode(codeB).toLowerCase()) {
          return false;
        }
      }
  }

  return true;
}

function startsWithIgnoreCase(str, candidate) {
  const candidateLength = candidate.length;

  if (candidate.length > str.length) {
    return false;
  }

  return doEqualsIgnoreCase(str, candidate, candidateLength);
}