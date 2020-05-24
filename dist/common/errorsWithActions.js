"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isErrorWithActions = isErrorWithActions;
exports.createErrorWithActions = createErrorWithActions;

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function isErrorWithActions(obj) {
  return obj instanceof Error && Array.isArray(obj.actions);
}

function createErrorWithActions(message, options = Object.create(null)) {
  const result = new Error(message);

  if (options.actions) {
    result.actions = options.actions;
  }

  return result;
}