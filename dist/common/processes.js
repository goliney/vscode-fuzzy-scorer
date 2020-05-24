"use strict";

require("core-js/modules/es.array.filter");

require("core-js/modules/es.string.search");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sanitizeProcessEnvironment = sanitizeProcessEnvironment;
exports.TerminateResponseCode = exports.Source = void 0;

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Options to be passed to the external program or shell.
 */
let Source;
/**
 * The data send via a success callback
 */

exports.Source = Source;

(function (Source) {
  Source[Source["stdout"] = 0] = "stdout";
  Source[Source["stderr"] = 1] = "stderr";
})(Source || (exports.Source = Source = {}));

let TerminateResponseCode;
exports.TerminateResponseCode = TerminateResponseCode;

(function (TerminateResponseCode) {
  TerminateResponseCode[TerminateResponseCode["Success"] = 0] = "Success";
  TerminateResponseCode[TerminateResponseCode["Unknown"] = 1] = "Unknown";
  TerminateResponseCode[TerminateResponseCode["AccessDenied"] = 2] = "AccessDenied";
  TerminateResponseCode[TerminateResponseCode["ProcessNotFound"] = 3] = "ProcessNotFound";
})(TerminateResponseCode || (exports.TerminateResponseCode = TerminateResponseCode = {}));

/**
 * Sanitizes a VS Code process environment by removing all Electron/VS Code-related values.
 */
function sanitizeProcessEnvironment(env, ...preserve) {
  const set = preserve.reduce((set, key) => {
    set[key] = true;
    return set;
  }, {});
  const keysToRemove = [/^ELECTRON_.+$/, /^GOOGLE_API_KEY$/, /^VSCODE_.+$/, /^SNAP(|_.*)$/];
  const envKeys = Object.keys(env);
  envKeys.filter(key => !set[key]).forEach(envKey => {
    for (let i = 0; i < keysToRemove.length; i++) {
      if (envKey.search(keysToRemove[i]) !== -1) {
        delete env[envKey];
        break;
      }
    }
  });
}