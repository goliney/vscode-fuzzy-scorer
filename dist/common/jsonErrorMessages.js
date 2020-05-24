"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getParseErrorMessage = getParseErrorMessage;

var _nls = require("./nls");

var _json = require("./json");

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Extracted from json.ts to keep json nls free.
 */
function getParseErrorMessage(errorCode) {
  switch (errorCode) {
    case _json.ParseErrorCode.InvalidSymbol:
      return (0, _nls.localize)('error.invalidSymbol', 'Invalid symbol');

    case _json.ParseErrorCode.InvalidNumberFormat:
      return (0, _nls.localize)('error.invalidNumberFormat', 'Invalid number format');

    case _json.ParseErrorCode.PropertyNameExpected:
      return (0, _nls.localize)('error.propertyNameExpected', 'Property name expected');

    case _json.ParseErrorCode.ValueExpected:
      return (0, _nls.localize)('error.valueExpected', 'Value expected');

    case _json.ParseErrorCode.ColonExpected:
      return (0, _nls.localize)('error.colonExpected', 'Colon expected');

    case _json.ParseErrorCode.CommaExpected:
      return (0, _nls.localize)('error.commaExpected', 'Comma expected');

    case _json.ParseErrorCode.CloseBraceExpected:
      return (0, _nls.localize)('error.closeBraceExpected', 'Closing brace expected');

    case _json.ParseErrorCode.CloseBracketExpected:
      return (0, _nls.localize)('error.closeBracketExpected', 'Closing bracket expected');

    case _json.ParseErrorCode.EndOfFileExpected:
      return (0, _nls.localize)('error.endOfFileExpected', 'End of file expected');

    default:
      return '';
  }
}