"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StopWatch = void 0;

var _platform = require("./platform");

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const hasPerformanceNow = _platform.globals.performance && typeof _platform.globals.performance.now === 'function';

class StopWatch {
  static create(highResolution = true) {
    return new StopWatch(highResolution);
  }

  constructor(highResolution) {
    this._highResolution = hasPerformanceNow && highResolution;
    this._startTime = this._now();
    this._stopTime = -1;
  }

  stop() {
    this._stopTime = this._now();
  }

  elapsed() {
    if (this._stopTime !== -1) {
      return this._stopTime - this._startTime;
    }

    return this._now() - this._startTime;
  }

  _now() {
    return this._highResolution ? _platform.globals.performance.now() : new Date().getTime();
  }

}

exports.StopWatch = StopWatch;