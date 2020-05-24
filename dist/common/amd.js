"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPathFromAmdModule = getPathFromAmdModule;
exports.getUriFromAmdModule = getUriFromAmdModule;

var _uri = require("./uri");

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function getPathFromAmdModule(requirefn, relativePath) {
  return getUriFromAmdModule(requirefn, relativePath).fsPath;
}

function getUriFromAmdModule(requirefn, relativePath) {
  return _uri.URI.parse(requirefn.toUrl(relativePath));
}