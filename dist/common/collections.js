"use strict";

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.map");

require("core-js/modules/es.set");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.values = values;
exports.size = size;
exports.first = first;
exports.forEach = forEach;
exports.groupBy = groupBy;
exports.fromMap = fromMap;
exports.SetMap = void 0;

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * An interface for a JavaScript object that
 * acts a dictionary. The keys are strings.
 */

/**
 * An interface for a JavaScript object that
 * acts a dictionary. The keys are numbers.
 */
const hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * Returns an array which contains all values that reside
 * in the given dictionary.
 */

function values(from) {
  const result = [];

  for (let key in from) {
    if (hasOwnProperty.call(from, key)) {
      result.push(from[key]);
    }
  }

  return result;
}

function size(from) {
  let count = 0;

  for (let key in from) {
    if (hasOwnProperty.call(from, key)) {
      count += 1;
    }
  }

  return count;
}

function first(from) {
  for (const key in from) {
    if (hasOwnProperty.call(from, key)) {
      return from[key];
    }
  }

  return undefined;
}
/**
 * Iterates over each entry in the provided dictionary. The iterator allows
 * to remove elements and will stop when the callback returns {{false}}.
 */


function forEach(from, callback) {
  for (let key in from) {
    if (hasOwnProperty.call(from, key)) {
      const result = callback({
        key: key,
        value: from[key]
      }, function () {
        delete from[key];
      });

      if (result === false) {
        return;
      }
    }
  }
}
/**
 * Groups the collection into a dictionary based on the provided
 * group function.
 */


function groupBy(data, groupFn) {
  const result = Object.create(null);

  var _iterator = _createForOfIteratorHelper(data),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      const element = _step.value;
      const key = groupFn(element);
      let target = result[key];

      if (!target) {
        target = result[key] = [];
      }

      target.push(element);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return result;
}

function fromMap(original) {
  const result = Object.create(null);

  if (original) {
    original.forEach((value, key) => {
      result[key] = value;
    });
  }

  return result;
}

class SetMap {
  map = new Map();

  add(key, value) {
    let values = this.map.get(key);

    if (!values) {
      values = new Set();
      this.map.set(key, values);
    }

    values.add(value);
  }

  delete(key, value) {
    const values = this.map.get(key);

    if (!values) {
      return;
    }

    values.delete(value);

    if (values.size === 0) {
      this.map.delete(key);
    }
  }

  forEach(key, fn) {
    const values = this.map.get(key);

    if (!values) {
      return;
    }

    values.forEach(fn);
  }

}

exports.SetMap = SetMap;