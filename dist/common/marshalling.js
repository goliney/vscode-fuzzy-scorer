"use strict";

require("core-js/modules/es.regexp.constructor");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stringify = stringify;
exports.parse = parse;
exports.revive = revive;

var _uri = require("./uri");

var _strings = require("./strings");

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function stringify(obj) {
  return JSON.stringify(obj, replacer);
}

function parse(text) {
  let data = JSON.parse(text);
  data = revive(data);
  return data;
}

function replacer(key, value) {
  // URI is done via toJSON-member
  if (value instanceof RegExp) {
    return {
      $mid: 2,
      source: value.source,
      flags: (0, _strings.regExpFlags)(value)
    };
  }

  return value;
}

function revive(obj, depth = 0) {
  if (!obj || depth > 200) {
    return obj;
  }

  if (typeof obj === 'object') {
    switch (obj.$mid) {
      case 1:
        return _uri.URI.revive(obj);

      case 2:
        return new RegExp(obj.source, obj.flags);
    } // walk object (or array)


    for (let key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        obj[key] = revive(obj[key], depth + 1);
      }
    }
  }

  return obj;
}