"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.once = once;

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function once(fn) {
  const _this = this;

  let didCall = false;
  let result;
  return function () {
    if (didCall) {
      return result;
    }

    didCall = true;
    result = fn.apply(_this, arguments);
    return result;
  };
}