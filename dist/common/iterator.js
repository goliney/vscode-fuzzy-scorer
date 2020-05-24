"use strict";

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.map");

require("core-js/modules/es.array.slice");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Iterable = void 0;

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
let Iterable;
exports.Iterable = Iterable;

(function (_Iterable) {
  function is(thing) {
    return thing && typeof thing === 'object' && typeof thing[Symbol.iterator] === 'function';
  }

  _Iterable.is = is;

  const _empty = Object.freeze([]);

  function empty() {
    return _empty;
  }

  _Iterable.empty = empty;

  function* single(element) {
    yield element;
  }

  _Iterable.single = single;

  function from(iterable) {
    return iterable || _empty;
  }

  _Iterable.from = from;

  function first(iterable) {
    return iterable[Symbol.iterator]().next().value;
  }

  _Iterable.first = first;

  function some(iterable, predicate) {
    var _iterator = _createForOfIteratorHelper(iterable),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        const element = _step.value;

        if (predicate(element)) {
          return true;
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return false;
  }

  _Iterable.some = some;

  function* filter(iterable, predicate) {
    var _iterator2 = _createForOfIteratorHelper(iterable),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        const element = _step2.value;

        if (predicate(element)) {
          yield element;
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  }

  _Iterable.filter = filter;

  function* map(iterable, fn) {
    var _iterator3 = _createForOfIteratorHelper(iterable),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        const element = _step3.value;
        yield fn(element);
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
  }

  _Iterable.map = map;

  function* concat(...iterables) {
    for (var _i = 0, _iterables = iterables; _i < _iterables.length; _i++) {
      const iterable = _iterables[_i];

      var _iterator4 = _createForOfIteratorHelper(iterable),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          const element = _step4.value;
          yield element;
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    }
  }

  _Iterable.concat = concat;

  function consume(iterable, atMost = Number.POSITIVE_INFINITY) {
    const consumed = [];

    if (atMost === 0) {
      return [consumed, iterable];
    }

    const iterator = iterable[Symbol.iterator]();

    for (let i = 0; i < atMost; i++) {
      const next = iterator.next();

      if (next.done) {
        return [consumed, Iterable.empty()];
      }

      consumed.push(next.value);
    }

    return [consumed, {
      [Symbol.iterator]() {
        return iterator;
      }

    }];
  }

  _Iterable.consume = consume;
})(Iterable || (exports.Iterable = Iterable = {}));