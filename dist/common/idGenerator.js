"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultGenerator = exports.IdGenerator = void 0;

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class IdGenerator {
  constructor(prefix) {
    this._prefix = prefix;
    this._lastId = 0;
  }

  nextId() {
    return this._prefix + ++this._lastId;
  }

}

exports.IdGenerator = IdGenerator;
const defaultGenerator = new IdGenerator('id#');
exports.defaultGenerator = defaultGenerator;