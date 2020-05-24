"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var nls = _interopRequireWildcard(require("./nls"));

var strings = _interopRequireWildcard(require("./strings"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var Severity;

(function (Severity) {
  Severity[Severity["Ignore"] = 0] = "Ignore";
  Severity[Severity["Info"] = 1] = "Info";
  Severity[Severity["Warning"] = 2] = "Warning";
  Severity[Severity["Error"] = 3] = "Error";
})(Severity || (Severity = {}));

(function (_Severity) {
  const _error = 'error';
  const _warning = 'warning';
  const _warn = 'warn';
  const _info = 'info';

  const _displayStrings = Object.create(null);

  _displayStrings[Severity.Error] = nls.localize('sev.error', 'Error');
  _displayStrings[Severity.Warning] = nls.localize('sev.warning', 'Warning');
  _displayStrings[Severity.Info] = nls.localize('sev.info', 'Info');
  /**
   * Parses 'error', 'warning', 'warn', 'info' in call casings
   * and falls back to ignore.
   */

  function fromValue(value) {
    if (!value) {
      return Severity.Ignore;
    }

    if (strings.equalsIgnoreCase(_error, value)) {
      return Severity.Error;
    }

    if (strings.equalsIgnoreCase(_warning, value) || strings.equalsIgnoreCase(_warn, value)) {
      return Severity.Warning;
    }

    if (strings.equalsIgnoreCase(_info, value)) {
      return Severity.Info;
    }

    return Severity.Ignore;
  }

  _Severity.fromValue = fromValue;
})(Severity || (Severity = {}));

var _default = Severity;
exports.default = _default;