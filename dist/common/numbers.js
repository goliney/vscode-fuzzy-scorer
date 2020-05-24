"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clamp = clamp;
exports.rot = rot;
exports.MovingAverage = exports.Counter = void 0;

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function rot(index, modulo) {
  return (modulo + index % modulo) % modulo;
}

class Counter {
  _next = 0;

  getNext() {
    return this._next++;
  }

}

exports.Counter = Counter;

class MovingAverage {
  _n = 1;
  _val = 0;

  update(value) {
    this._val = this._val + (value - this._val) / this._n;
    this._n += 1;
    return this;
  }

  get value() {
    return this._val;
  }

}

exports.MovingAverage = MovingAverage;