"use strict";

require("core-js/modules/es.string.replace");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeNFC = normalizeNFC;
exports.normalizeNFD = normalizeNFD;
exports.removeAccents = exports.canNormalize = void 0;

var _map = require("./map");

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * The normalize() method returns the Unicode Normalization Form of a given string. The form will be
 * the Normalization Form Canonical Composition.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize}
 */
const canNormalize = typeof String.prototype.
/* standalone editor compilation */
normalize === 'function';
exports.canNormalize = canNormalize;
const nfcCache = new _map.LRUCache(10000); // bounded to 10000 elements

function normalizeNFC(str) {
  return normalize(str, 'NFC', nfcCache);
}

const nfdCache = new _map.LRUCache(10000); // bounded to 10000 elements

function normalizeNFD(str) {
  return normalize(str, 'NFD', nfdCache);
}

const nonAsciiCharactersPattern = /[^\u0000-\u0080]/;

function normalize(str, form, normalizedCache) {
  if (!canNormalize || !str) {
    return str;
  }

  const cached = normalizedCache.get(str);

  if (cached) {
    return cached;
  }

  let res;

  if (nonAsciiCharactersPattern.test(str)) {
    res = str.normalize(form);
  } else {
    res = str;
  } // Use the cache for fast lookup


  normalizedCache.set(str, res);
  return res;
}

const removeAccents = function () {
  if (!canNormalize) {
    // no ES6 features...
    return function (str) {
      return str;
    };
  } else {
    // transform into NFD form and remove accents
    // see: https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript/37511463#37511463
    const regex = /[\u0300-\u036f]/g;
    return function (str) {
      return normalizeNFD(str).replace(regex, '');
    };
  }
}();

exports.removeAccents = removeAccents;