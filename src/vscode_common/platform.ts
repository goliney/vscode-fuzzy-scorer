/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See vscode.licence.txt for license information.
 *--------------------------------------------------------------------------------------------*/

let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isWeb = false;
let _userAgent: string | undefined = undefined;

export interface IProcessEnvironment {
  [key: string]: string;
}

interface INodeProcess {
  platform: string;
  env: IProcessEnvironment;
  getuid(): number;
  nextTick: Function;
  versions?: {
    electron?: string;
  };
  type?: string;
}
declare const process: INodeProcess;
declare const global: any;

interface INavigator {
  userAgent: string;
  language: string;
  maxTouchPoints?: number;
}
declare const navigator: INavigator;
declare const self: any;

const isElectronRenderer =
  typeof process !== 'undefined' &&
  typeof process.versions !== 'undefined' &&
  typeof process.versions.electron !== 'undefined' &&
  process.type === 'renderer';

// OS detection
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

export const isWindows = _isWindows;
export const isMacintosh = _isMacintosh;
export const isLinux = _isLinux;
export const isWeb = _isWeb;

const _globals =
  typeof self === 'object' ? self : typeof global === 'object' ? global : ({} as any);
export const globals: any = _globals;

interface ISetImmediate {
  (callback: (...args: any[]) => void): void;
}

export const setImmediate: ISetImmediate = (function defineSetImmediate() {
  if (globals.setImmediate) {
    return globals.setImmediate.bind(globals);
  }
  if (typeof globals.postMessage === 'function' && !globals.importScripts) {
    interface IQueueElement {
      id: number;
      callback: () => void;
    }
    const pending: IQueueElement[] = [];
    globals.addEventListener('message', (e: MessageEvent) => {
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
    return (callback: () => void) => {
      const myId = ++lastId;
      pending.push({
        id: myId,
        callback: callback,
      });
      globals.postMessage({ vscodeSetImmediateId: myId }, '*');
    };
  }
  if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
    return process.nextTick.bind(process);
  }
  const _promise = Promise.resolve();
  return (callback: (...args: any[]) => void) => _promise.then(callback);
})();
