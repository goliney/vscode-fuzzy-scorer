"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.platform = exports.env = exports.cwd = void 0;

var _platform = require("./platform");

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See vscode.licence.txt for license information.
 *--------------------------------------------------------------------------------------------*/
const safeProcess = typeof process === 'undefined' ? {
  cwd() {
    return '/';
  },

  env: Object.create(null),

  get platform() {
    return _platform.isWindows ? 'win32' : _platform.isMacintosh ? 'darwin' : 'linux';
  },

  nextTick(callback) {
    return (0, _platform.setImmediate)(callback);
  }

} : process;
const cwd = safeProcess.cwd;
exports.cwd = cwd;
const env = safeProcess.env;
exports.env = env;
const platform = safeProcess.platform;
exports.platform = platform;