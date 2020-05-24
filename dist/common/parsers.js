"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Parser = exports.ValidationStatus = exports.ValidationState = void 0;

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
let ValidationState;
exports.ValidationState = ValidationState;

(function (ValidationState) {
  ValidationState[ValidationState["OK"] = 0] = "OK";
  ValidationState[ValidationState["Info"] = 1] = "Info";
  ValidationState[ValidationState["Warning"] = 2] = "Warning";
  ValidationState[ValidationState["Error"] = 3] = "Error";
  ValidationState[ValidationState["Fatal"] = 4] = "Fatal";
})(ValidationState || (exports.ValidationState = ValidationState = {}));

class ValidationStatus {
  constructor() {
    this._state = ValidationState.OK;
  }

  get state() {
    return this._state;
  }

  set state(value) {
    if (value > this._state) {
      this._state = value;
    }
  }

  isOK() {
    return this._state === ValidationState.OK;
  }

  isFatal() {
    return this._state === ValidationState.Fatal;
  }

}

exports.ValidationStatus = ValidationStatus;

class Parser {
  constructor(problemReporter) {
    this._problemReporter = problemReporter;
  }

  reset() {
    this._problemReporter.status.state = ValidationState.OK;
  }

  get problemReporter() {
    return this._problemReporter;
  }

  info(message) {
    this._problemReporter.info(message);
  }

  warn(message) {
    this._problemReporter.warn(message);
  }

  error(message) {
    this._problemReporter.error(message);
  }

  fatal(message) {
    this._problemReporter.fatal(message);
  }

}

exports.Parser = Parser;