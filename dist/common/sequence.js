"use strict";

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.splice");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sequence = void 0;

var _event = require("./event");

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class Sequence {
  elements = [];
  _onDidSplice = new _event.Emitter();
  onDidSplice = this._onDidSplice.event;

  splice(start, deleteCount, toInsert = []) {
    this.elements.splice(start, deleteCount, ...toInsert);

    this._onDidSplice.fire({
      start,
      deleteCount,
      toInsert
    });
  }

}

exports.Sequence = Sequence;