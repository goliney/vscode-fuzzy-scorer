"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toErrorMessage = toErrorMessage;

var nls = _interopRequireWildcard(require("./nls"));

var types = _interopRequireWildcard(require("./types"));

var arrays = _interopRequireWildcard(require("./arrays"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function exceptionToErrorMessage(exception, verbose) {
  if (verbose && (exception.stack || exception.stacktrace)) {
    return nls.localize('stackTrace.format', '{0}: {1}', detectSystemErrorMessage(exception), stackToString(exception.stack) || stackToString(exception.stacktrace));
  }

  return detectSystemErrorMessage(exception);
}

function stackToString(stack) {
  if (Array.isArray(stack)) {
    return stack.join('\n');
  }

  return stack;
}

function detectSystemErrorMessage(exception) {
  // See https://nodejs.org/api/errors.html#errors_class_system_error
  if (typeof exception.code === 'string' && typeof exception.errno === 'number' && typeof exception.syscall === 'string') {
    return nls.localize('nodeExceptionMessage', 'A system error occurred ({0})', exception.message);
  }

  return exception.message || nls.localize('error.defaultMessage', 'An unknown error occurred. Please consult the log for more details.');
}
/**
 * Tries to generate a human readable error message out of the error. If the verbose parameter
 * is set to true, the error message will include stacktrace details if provided.
 *
 * @returns A string containing the error message.
 */


function toErrorMessage(error = null, verbose = false) {
  if (!error) {
    return nls.localize('error.defaultMessage', 'An unknown error occurred. Please consult the log for more details.');
  }

  if (Array.isArray(error)) {
    const errors = arrays.coalesce(error);
    const msg = toErrorMessage(errors[0], verbose);

    if (errors.length > 1) {
      return nls.localize('error.moreErrors', '{0} ({1} errors in total)', msg, errors.length);
    }

    return msg;
  }

  if (types.isString(error)) {
    return error;
  }

  if (error.detail) {
    const detail = error.detail;

    if (detail.error) {
      return exceptionToErrorMessage(detail.error, verbose);
    }

    if (detail.exception) {
      return exceptionToErrorMessage(detail.exception, verbose);
    }
  }

  if (error.stack) {
    return exceptionToErrorMessage(error, verbose);
  }

  if (error.message) {
    return error.message;
  }

  return nls.localize('error.defaultMessage', 'An unknown error occurred. Please consult the log for more details.');
}