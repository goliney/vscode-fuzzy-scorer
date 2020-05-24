"use strict";

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.index-of");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.array.sort");

require("core-js/modules/es.regexp.constructor");

require("core-js/modules/es.set");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deepClone = deepClone;
exports.deepFreeze = deepFreeze;
exports.cloneAndChange = cloneAndChange;
exports.mixin = mixin;
exports.assign = assign;
exports.equals = equals;
exports.safeStringify = safeStringify;
exports.getOrDefault = getOrDefault;
exports.distinct = distinct;

var _types = require("./types");

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function deepClone(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof RegExp) {
    // See https://github.com/Microsoft/TypeScript/issues/10990
    return obj;
  }

  const result = Array.isArray(obj) ? [] : {};
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === 'object') {
      result[key] = deepClone(obj[key]);
    } else {
      result[key] = obj[key];
    }
  });
  return result;
}

function deepFreeze(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const stack = [obj];

  while (stack.length > 0) {
    const obj = stack.shift();
    Object.freeze(obj);

    for (const key in obj) {
      if (_hasOwnProperty.call(obj, key)) {
        const prop = obj[key];

        if (typeof prop === 'object' && !Object.isFrozen(prop)) {
          stack.push(prop);
        }
      }
    }
  }

  return obj;
}

const _hasOwnProperty = Object.prototype.hasOwnProperty;

function cloneAndChange(obj, changer) {
  return _cloneAndChange(obj, changer, new Set());
}

function _cloneAndChange(obj, changer, seen) {
  if ((0, _types.isUndefinedOrNull)(obj)) {
    return obj;
  }

  const changed = changer(obj);

  if (typeof changed !== 'undefined') {
    return changed;
  }

  if ((0, _types.isArray)(obj)) {
    const r1 = [];

    var _iterator = _createForOfIteratorHelper(obj),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        const e = _step.value;
        r1.push(_cloneAndChange(e, changer, seen));
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return r1;
  }

  if ((0, _types.isObject)(obj)) {
    if (seen.has(obj)) {
      throw new Error('Cannot clone recursive data-structure');
    }

    seen.add(obj);
    const r2 = {};

    for (let i2 in obj) {
      if (_hasOwnProperty.call(obj, i2)) {
        r2[i2] = _cloneAndChange(obj[i2], changer, seen);
      }
    }

    seen.delete(obj);
    return r2;
  }

  return obj;
}
/**
 * Copies all properties of source into destination. The optional parameter "overwrite" allows to control
 * if existing properties on the destination should be overwritten or not. Defaults to true (overwrite).
 */


function mixin(destination, source, overwrite = true) {
  if (!(0, _types.isObject)(destination)) {
    return source;
  }

  if ((0, _types.isObject)(source)) {
    Object.keys(source).forEach(key => {
      if (key in destination) {
        if (overwrite) {
          if ((0, _types.isObject)(destination[key]) && (0, _types.isObject)(source[key])) {
            mixin(destination[key], source[key], overwrite);
          } else {
            destination[key] = source[key];
          }
        }
      } else {
        destination[key] = source[key];
      }
    });
  }

  return destination;
}
/**
 * @deprecated ES6
 */


function assign(destination, ...sources) {
  sources.forEach(source => Object.keys(source).forEach(key => destination[key] = source[key]));
  return destination;
}

function equals(one, other) {
  if (one === other) {
    return true;
  }

  if (one === null || one === undefined || other === null || other === undefined) {
    return false;
  }

  if (typeof one !== typeof other) {
    return false;
  }

  if (typeof one !== 'object') {
    return false;
  }

  if (Array.isArray(one) !== Array.isArray(other)) {
    return false;
  }

  let i;
  let key;

  if (Array.isArray(one)) {
    if (one.length !== other.length) {
      return false;
    }

    for (i = 0; i < one.length; i++) {
      if (!equals(one[i], other[i])) {
        return false;
      }
    }
  } else {
    const oneKeys = [];

    for (key in one) {
      oneKeys.push(key);
    }

    oneKeys.sort();
    const otherKeys = [];

    for (key in other) {
      otherKeys.push(key);
    }

    otherKeys.sort();

    if (!equals(oneKeys, otherKeys)) {
      return false;
    }

    for (i = 0; i < oneKeys.length; i++) {
      if (!equals(one[oneKeys[i]], other[oneKeys[i]])) {
        return false;
      }
    }
  }

  return true;
}
/**
 * Calls JSON.Stringify with a replacer to break apart any circular references.
 * This prevents JSON.stringify from throwing the exception
 *  "Uncaught TypeError: Converting circular structure to JSON"
 */


function safeStringify(obj) {
  const seen = [];
  return JSON.stringify(obj, (key, value) => {
    if ((0, _types.isObject)(value) || Array.isArray(value)) {
      if (seen.indexOf(value) !== -1) {
        return '[Circular]';
      } else {
        seen.push(value);
      }
    }

    return value;
  });
}

function getOrDefault(obj, fn, defaultValue) {
  const result = fn(obj);
  return typeof result === 'undefined' ? defaultValue : result;
}

/**
 * Returns an object that has keys for each value that is different in the base object. Keys
 * that do not exist in the target but in the base object are not considered.
 *
 * Note: This is not a deep-diffing method, so the values are strictly taken into the resulting
 * object if they differ.
 *
 * @param base the object to diff against
 * @param obj the object to use for diffing
 */
function distinct(base, target) {
  const result = Object.create(null);

  if (!base || !target) {
    return result;
  }

  const targetKeys = Object.keys(target);
  targetKeys.forEach(k => {
    const baseValue = base[k];
    const targetValue = target[k];

    if (!equals(baseValue, targetValue)) {
      result[k] = targetValue;
    }
  });
  return result;
}