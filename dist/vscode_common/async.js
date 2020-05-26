"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IdleValue = exports.runWhenIdle = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See vscode.licence.txt for license information.
 *--------------------------------------------------------------------------------------------*/
//#region -- run on idle tricks ------------

/**
 * Execute the callback the next time the browser is idle
 */
let runWhenIdle;
exports.runWhenIdle = runWhenIdle;

(function () {
  if (typeof requestIdleCallback !== 'function' || typeof cancelIdleCallback !== 'function') {
    const dummyIdle = Object.freeze({
      didTimeout: true,

      timeRemaining() {
        return 15;
      }

    });

    exports.runWhenIdle = runWhenIdle = runner => {
      const handle = setTimeout(() => runner(dummyIdle));
      let disposed = false;
      return {
        dispose() {
          if (disposed) {
            return;
          }

          disposed = true;
          clearTimeout(handle);
        }

      };
    };
  } else {
    exports.runWhenIdle = runWhenIdle = (runner, timeout) => {
      const handle = requestIdleCallback(runner, typeof timeout === 'number' ? {
        timeout
      } : undefined);
      let disposed = false;
      return {
        dispose() {
          if (disposed) {
            return;
          }

          disposed = true;
          cancelIdleCallback(handle);
        }

      };
    };
  }
})();
/**
 * An implementation of the "idle-until-urgent"-strategy as introduced
 * here: https://philipwalton.com/articles/idle-until-urgent/
 */


class IdleValue {
  constructor(executor) {
    _defineProperty(this, "_didRun", false);

    this._executor = () => {
      try {
        this._value = executor();
      } catch (err) {
        this._error = err;
      } finally {
        this._didRun = true;
      }
    };

    this._handle = runWhenIdle(() => this._executor());
  }

  dispose() {
    this._handle.dispose();
  }

  get value() {
    if (!this._didRun) {
      this._handle.dispose();

      this._executor();
    }

    if (this._error) {
      throw this._error;
    }

    return this._value;
  }

} //#endregion


exports.IdleValue = IdleValue;