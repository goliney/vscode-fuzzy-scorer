"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cache = void 0;

var _cancellation = require("./cancellation");

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class Cache {
  result = null;

  constructor(task) {
    this.task = task;
  }

  get() {
    if (this.result) {
      return this.result;
    }

    const cts = new _cancellation.CancellationTokenSource();
    const promise = this.task(cts.token);
    this.result = {
      promise,
      dispose: () => {
        this.result = null;
        cts.cancel();
        cts.dispose();
      }
    };
    return this.result;
  }

}

exports.Cache = Cache;