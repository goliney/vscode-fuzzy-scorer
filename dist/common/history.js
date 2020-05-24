"use strict";

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.index-of");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.set");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HistoryNavigator = void 0;

var _navigator = require("./navigator");

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

class HistoryNavigator {
  constructor(history = [], limit = 10) {
    this._initialize(history);

    this._limit = limit;

    this._onChange();
  }

  getHistory() {
    return this._elements;
  }

  add(t) {
    this._history.delete(t);

    this._history.add(t);

    this._onChange();
  }

  next() {
    if (this._currentPosition() !== this._elements.length - 1) {
      return this._navigator.next();
    }

    return null;
  }

  previous() {
    if (this._currentPosition() !== 0) {
      return this._navigator.previous();
    }

    return null;
  }

  current() {
    return this._navigator.current();
  }

  first() {
    return this._navigator.first();
  }

  last() {
    return this._navigator.last();
  }

  has(t) {
    return this._history.has(t);
  }

  clear() {
    this._initialize([]);

    this._onChange();
  }

  _onChange() {
    this._reduceToLimit();

    const elements = this._elements;
    this._navigator = new _navigator.ArrayNavigator(elements, 0, elements.length, elements.length);
  }

  _reduceToLimit() {
    const data = this._elements;

    if (data.length > this._limit) {
      this._initialize(data.slice(data.length - this._limit));
    }
  }

  _currentPosition() {
    const currentElement = this._navigator.current();

    if (!currentElement) {
      return -1;
    }

    return this._elements.indexOf(currentElement);
  }

  _initialize(history) {
    this._history = new Set();

    var _iterator = _createForOfIteratorHelper(history),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        const entry = _step.value;

        this._history.add(entry);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

  get _elements() {
    const elements = [];

    this._history.forEach(e => elements.push(e));

    return elements;
  }

}

exports.HistoryNavigator = HistoryNavigator;