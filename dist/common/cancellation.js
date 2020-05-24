"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CancellationTokenSource = exports.CancellationToken = void 0;

var _event = require("./event");

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const shortcutEvent = Object.freeze(function (callback, context) {
  const handle = setTimeout(callback.bind(context), 0);
  return {
    dispose() {
      clearTimeout(handle);
    }

  };
});
let CancellationToken;
exports.CancellationToken = CancellationToken;

(function (_CancellationToken) {
  function isCancellationToken(thing) {
    if (thing === CancellationToken.None || thing === CancellationToken.Cancelled) {
      return true;
    }

    if (thing instanceof MutableToken) {
      return true;
    }

    if (!thing || typeof thing !== 'object') {
      return false;
    }

    return typeof thing.isCancellationRequested === 'boolean' && typeof thing.onCancellationRequested === 'function';
  }

  _CancellationToken.isCancellationToken = isCancellationToken;
  const None = _CancellationToken.None = Object.freeze({
    isCancellationRequested: false,
    onCancellationRequested: _event.Event.None
  });
  const Cancelled = _CancellationToken.Cancelled = Object.freeze({
    isCancellationRequested: true,
    onCancellationRequested: shortcutEvent
  });
})(CancellationToken || (exports.CancellationToken = CancellationToken = {}));

class MutableToken {
  _isCancelled = false;
  _emitter = null;

  cancel() {
    if (!this._isCancelled) {
      this._isCancelled = true;

      if (this._emitter) {
        this._emitter.fire(undefined);

        this.dispose();
      }
    }
  }

  get isCancellationRequested() {
    return this._isCancelled;
  }

  get onCancellationRequested() {
    if (this._isCancelled) {
      return shortcutEvent;
    }

    if (!this._emitter) {
      this._emitter = new _event.Emitter();
    }

    return this._emitter.event;
  }

  dispose() {
    if (this._emitter) {
      this._emitter.dispose();

      this._emitter = null;
    }
  }

}

class CancellationTokenSource {
  _token = undefined;
  _parentListener = undefined;

  constructor(parent) {
    this._parentListener = parent && parent.onCancellationRequested(this.cancel, this);
  }

  get token() {
    if (!this._token) {
      // be lazy and create the token only when
      // actually needed
      this._token = new MutableToken();
    }

    return this._token;
  }

  cancel() {
    if (!this._token) {
      // save an object by returning the default
      // cancelled token when cancellation happens
      // before someone asks for the token
      this._token = CancellationToken.Cancelled;
    } else if (this._token instanceof MutableToken) {
      // actually cancel
      this._token.cancel();
    }
  }

  dispose(cancel = false) {
    if (cancel) {
      this.cancel();
    }

    if (this._parentListener) {
      this._parentListener.dispose();
    }

    if (!this._token) {
      // ensure to initialize with an empty token if we had none
      this._token = CancellationToken.None;
    } else if (this._token instanceof MutableToken) {
      // actually dispose
      this._token.dispose();
    }
  }

}

exports.CancellationTokenSource = CancellationTokenSource;