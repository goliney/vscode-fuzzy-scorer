"use strict";

require("core-js/modules/es.array.index-of");

require("core-js/modules/es.array.splice");

require("core-js/modules/es.promise");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setImmediate = exports.globals = exports.isWeb = exports.isLinux = exports.isMacintosh = exports.isWindows = void 0;

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See vscode.licence.txt for license information.
 *--------------------------------------------------------------------------------------------*/
let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isWeb = false;
let _userAgent = undefined;
const isElectronRenderer = typeof process !== 'undefined' && typeof process.versions !== 'undefined' && typeof process.versions.electron !== 'undefined' && process.type === 'renderer'; // OS detection

if (typeof navigator === 'object' && !isElectronRenderer) {
  _userAgent = navigator.userAgent;
  _isWindows = _userAgent.indexOf('Windows') >= 0;
  _isMacintosh = _userAgent.indexOf('Macintosh') >= 0;
  _isLinux = _userAgent.indexOf('Linux') >= 0;
  _isWeb = true;
} else if (typeof process === 'object') {
  _isWindows = process.platform === 'win32';
  _isMacintosh = process.platform === 'darwin';
  _isLinux = process.platform === 'linux';
}

const isWindows = _isWindows;
exports.isWindows = isWindows;
const isMacintosh = _isMacintosh;
exports.isMacintosh = isMacintosh;
const isLinux = _isLinux;
exports.isLinux = isLinux;
const isWeb = _isWeb;
exports.isWeb = isWeb;

const _globals = typeof self === 'object' ? self : typeof global === 'object' ? global : {};

const globals = _globals;
exports.globals = globals;

const setImmediate = function defineSetImmediate() {
  if (globals.setImmediate) {
    return globals.setImmediate.bind(globals);
  }

  if (typeof globals.postMessage === 'function' && !globals.importScripts) {
    const pending = [];
    globals.addEventListener('message', e => {
      if (e.data && e.data.vscodeSetImmediateId) {
        for (let i = 0, len = pending.length; i < len; i++) {
          const candidate = pending[i];

          if (candidate.id === e.data.vscodeSetImmediateId) {
            pending.splice(i, 1);
            candidate.callback();
            return;
          }
        }
      }
    });
    let lastId = 0;
    return callback => {
      const myId = ++lastId;
      pending.push({
        id: myId,
        callback: callback
      });
      globals.postMessage({
        vscodeSetImmediateId: myId
      }, '*');
    };
  }

  if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
    return process.nextTick.bind(process);
  }

  const _promise = Promise.resolve();

  return callback => _promise.then(callback);
}();

exports.setImmediate = setImmediate;