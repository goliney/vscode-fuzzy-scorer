"use strict";

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.regexp.constructor");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isArray = isArray;
exports.isString = isString;
exports.isStringArray = isStringArray;
exports.isObject = isObject;
exports.isNumber = isNumber;
exports.isBoolean = isBoolean;
exports.isUndefined = isUndefined;
exports.isUndefinedOrNull = isUndefinedOrNull;
exports.assertType = assertType;
exports.assertIsDefined = assertIsDefined;
exports.assertAllDefined = assertAllDefined;
exports.isEmptyObject = isEmptyObject;
exports.isFunction = isFunction;
exports.areFunctions = areFunctions;
exports.validateConstraints = validateConstraints;
exports.validateConstraint = validateConstraint;
exports.getAllPropertyNames = getAllPropertyNames;
exports.getAllMethodNames = getAllMethodNames;
exports.createProxyObject = createProxyObject;
exports.withNullAsUndefined = withNullAsUndefined;
exports.withUndefinedAsNull = withUndefinedAsNull;
exports.NotImplementedProxy = NotImplementedProxy;

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * @returns whether the provided parameter is a JavaScript Array or not.
 */
function isArray(array) {
  return Array.isArray(array);
}
/**
 * @returns whether the provided parameter is a JavaScript String or not.
 */


function isString(str) {
  return typeof str === 'string';
}
/**
 * @returns whether the provided parameter is a JavaScript Array and each element in the array is a string.
 */


function isStringArray(value) {
  return Array.isArray(value) && value.every(elem => isString(elem));
}
/**
 *
 * @returns whether the provided parameter is of type `object` but **not**
 *	`null`, an `array`, a `regexp`, nor a `date`.
 */


function isObject(obj) {
  // The method can't do a type cast since there are type (like strings) which
  // are subclasses of any put not positvely matched by the function. Hence type
  // narrowing results in wrong results.
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj) && !(obj instanceof RegExp) && !(obj instanceof Date);
}
/**
 * In **contrast** to just checking `typeof` this will return `false` for `NaN`.
 * @returns whether the provided parameter is a JavaScript Number or not.
 */


function isNumber(obj) {
  return typeof obj === 'number' && !isNaN(obj);
}
/**
 * @returns whether the provided parameter is a JavaScript Boolean or not.
 */


function isBoolean(obj) {
  return obj === true || obj === false;
}
/**
 * @returns whether the provided parameter is undefined.
 */


function isUndefined(obj) {
  return typeof obj === 'undefined';
}
/**
 * @returns whether the provided parameter is undefined or null.
 */


function isUndefinedOrNull(obj) {
  return isUndefined(obj) || obj === null;
}

function assertType(condition, type) {
  if (!condition) {
    throw new Error(type ? `Unexpected type, expected '${type}'` : 'Unexpected type');
  }
}
/**
 * Asserts that the argument passed in is neither undefined nor null.
 */


function assertIsDefined(arg) {
  if (isUndefinedOrNull(arg)) {
    throw new Error('Assertion Failed: argument is undefined or null');
  }

  return arg;
}
/**
 * Asserts that each argument passed in is neither undefined nor null.
 */


function assertAllDefined(...args) {
  const result = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (isUndefinedOrNull(arg)) {
      throw new Error(`Assertion Failed: argument at index ${i} is undefined or null`);
    }

    result.push(arg);
  }

  return result;
}

const hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * @returns whether the provided parameter is an empty JavaScript Object or not.
 */

function isEmptyObject(obj) {
  if (!isObject(obj)) {
    return false;
  }

  for (let key in obj) {
    if (hasOwnProperty.call(obj, key)) {
      return false;
    }
  }

  return true;
}
/**
 * @returns whether the provided parameter is a JavaScript Function or not.
 */


function isFunction(obj) {
  return typeof obj === 'function';
}
/**
 * @returns whether the provided parameters is are JavaScript Function or not.
 */


function areFunctions(...objects) {
  return objects.length > 0 && objects.every(isFunction);
}

function validateConstraints(args, constraints) {
  const len = Math.min(args.length, constraints.length);

  for (let i = 0; i < len; i++) {
    validateConstraint(args[i], constraints[i]);
  }
}

function validateConstraint(arg, constraint) {
  if (isString(constraint)) {
    if (typeof arg !== constraint) {
      throw new Error(`argument does not match constraint: typeof ${constraint}`);
    }
  } else if (isFunction(constraint)) {
    try {
      if (arg instanceof constraint) {
        return;
      }
    } catch (_unused) {// ignore
    }

    if (!isUndefinedOrNull(arg) && arg.constructor === constraint) {
      return;
    }

    if (constraint.length === 1 && constraint.call(undefined, arg) === true) {
      return;
    }

    throw new Error(`argument does not match one of these constraints: arg instanceof constraint, arg.constructor === constraint, nor constraint(arg) === true`);
  }
}

function getAllPropertyNames(obj) {
  let res = [];
  let proto = Object.getPrototypeOf(obj);

  while (Object.prototype !== proto) {
    res = res.concat(Object.getOwnPropertyNames(proto));
    proto = Object.getPrototypeOf(proto);
  }

  return res;
}

function getAllMethodNames(obj) {
  const methods = [];

  var _iterator = _createForOfIteratorHelper(getAllPropertyNames(obj)),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      const prop = _step.value;

      if (typeof obj[prop] === 'function') {
        methods.push(prop);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return methods;
}

function createProxyObject(methodNames, invoke) {
  const createProxyMethod = method => {
    return function () {
      const args = Array.prototype.slice.call(arguments, 0);
      return invoke(method, args);
    };
  };

  let result = {};

  var _iterator2 = _createForOfIteratorHelper(methodNames),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      const methodName = _step2.value;
      result[methodName] = createProxyMethod(methodName);
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  return result;
}
/**
 * Converts null to undefined, passes all other values through.
 */


function withNullAsUndefined(x) {
  return x === null ? undefined : x;
}
/**
 * Converts undefined to null, passes all other values through.
 */


function withUndefinedAsNull(x) {
  return typeof x === 'undefined' ? null : x;
}
/**
 * Allows to add a first parameter to functions of a type.
 */


function NotImplementedProxy(name) {
  return class {
    constructor() {
      return new Proxy({}, {
        get(target, prop) {
          if (target[prop]) {
            return target[prop];
          }

          throw new Error(`Not Implemented: ${name}->${String(prop)}`);
        }

      });
    }

  };
}