"use strict";

require("core-js/modules/es.array.index-of");

require("core-js/modules/es.array.splice");

require("core-js/modules/es.string.split");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setUnexpectedErrorHandler = setUnexpectedErrorHandler;
exports.onUnexpectedError = onUnexpectedError;
exports.onUnexpectedExternalError = onUnexpectedExternalError;
exports.transformErrorForSerialization = transformErrorForSerialization;
exports.isPromiseCanceledError = isPromiseCanceledError;
exports.canceled = canceled;
exports.illegalArgument = illegalArgument;
exports.illegalState = illegalState;
exports.readonly = readonly;
exports.disposed = disposed;
exports.getErrorMessage = getErrorMessage;
exports.NotImplementedError = exports.errorHandler = exports.ErrorHandler = void 0;

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// Avoid circular dependency on EventEmitter by implementing a subset of the interface.
class ErrorHandler {
  constructor() {
    this.listeners = [];

    this.unexpectedErrorHandler = function (e) {
      setTimeout(() => {
        if (e.stack) {
          throw new Error(e.message + '\n\n' + e.stack);
        }

        throw e;
      }, 0);
    };
  }

  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      this._removeListener(listener);
    };
  }

  emit(e) {
    this.listeners.forEach(listener => {
      listener(e);
    });
  }

  _removeListener(listener) {
    this.listeners.splice(this.listeners.indexOf(listener), 1);
  }

  setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
    this.unexpectedErrorHandler = newUnexpectedErrorHandler;
  }

  getUnexpectedErrorHandler() {
    return this.unexpectedErrorHandler;
  }

  onUnexpectedError(e) {
    this.unexpectedErrorHandler(e);
    this.emit(e);
  } // For external errors, we don't want the listeners to be called


  onUnexpectedExternalError(e) {
    this.unexpectedErrorHandler(e);
  }

}

exports.ErrorHandler = ErrorHandler;
const errorHandler = new ErrorHandler();
exports.errorHandler = errorHandler;

function setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
  errorHandler.setUnexpectedErrorHandler(newUnexpectedErrorHandler);
}

function onUnexpectedError(e) {
  // ignore errors from cancelled promises
  if (!isPromiseCanceledError(e)) {
    errorHandler.onUnexpectedError(e);
  }

  return undefined;
}

function onUnexpectedExternalError(e) {
  // ignore errors from cancelled promises
  if (!isPromiseCanceledError(e)) {
    errorHandler.onUnexpectedExternalError(e);
  }

  return undefined;
}

function transformErrorForSerialization(error) {
  if (error instanceof Error) {
    let name = error.name,
        message = error.message;
    const stack = error.stacktrace || error.stack;
    return {
      $isError: true,
      name,
      message,
      stack
    };
  } // return as is


  return error;
} // see https://github.com/v8/v8/wiki/Stack%20Trace%20API#basic-stack-traces


const canceledName = 'Canceled';
/**
 * Checks if the given error is a promise in canceled state
 */

function isPromiseCanceledError(error) {
  return error instanceof Error && error.name === canceledName && error.message === canceledName;
}
/**
 * Returns an error that signals cancellation.
 */


function canceled() {
  const error = new Error(canceledName);
  error.name = error.message;
  return error;
}

function illegalArgument(name) {
  if (name) {
    return new Error(`Illegal argument: ${name}`);
  } else {
    return new Error('Illegal argument');
  }
}

function illegalState(name) {
  if (name) {
    return new Error(`Illegal state: ${name}`);
  } else {
    return new Error('Illegal state');
  }
}

function readonly(name) {
  return name ? new Error(`readonly property '${name} cannot be changed'`) : new Error('readonly property cannot be changed');
}

function disposed(what) {
  const result = new Error(`${what} has been disposed`);
  result.name = 'DISPOSED';
  return result;
}

function getErrorMessage(err) {
  if (!err) {
    return 'Error';
  }

  if (err.message) {
    return err.message;
  }

  if (err.stack) {
    return err.stack.split('\n')[0];
  }

  return String(err);
}

class NotImplementedError extends Error {
  constructor(message) {
    super('NotImplemented');

    if (message) {
      this.message = message;
    }
  }

}

exports.NotImplementedError = NotImplementedError;