"use strict";

require("core-js/modules/es.array.index-of");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.string.split");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildReplaceStringWithCasePreserved = buildReplaceStringWithCasePreserved;

var strings = _interopRequireWildcard(require("./strings"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function buildReplaceStringWithCasePreserved(matches, pattern) {
  if (matches && matches[0] !== '') {
    const containsHyphens = validateSpecificSpecialCharacter(matches, pattern, '-');
    const containsUnderscores = validateSpecificSpecialCharacter(matches, pattern, '_');

    if (containsHyphens && !containsUnderscores) {
      return buildReplaceStringForSpecificSpecialCharacter(matches, pattern, '-');
    } else if (!containsHyphens && containsUnderscores) {
      return buildReplaceStringForSpecificSpecialCharacter(matches, pattern, '_');
    }

    if (matches[0].toUpperCase() === matches[0]) {
      return pattern.toUpperCase();
    } else if (matches[0].toLowerCase() === matches[0]) {
      return pattern.toLowerCase();
    } else if (strings.containsUppercaseCharacter(matches[0][0])) {
      return pattern[0].toUpperCase() + pattern.substr(1);
    } else {
      // we don't understand its pattern yet.
      return pattern;
    }
  } else {
    return pattern;
  }
}

function validateSpecificSpecialCharacter(matches, pattern, specialCharacter) {
  const doesContainSpecialCharacter = matches[0].indexOf(specialCharacter) !== -1 && pattern.indexOf(specialCharacter) !== -1;
  return doesContainSpecialCharacter && matches[0].split(specialCharacter).length === pattern.split(specialCharacter).length;
}

function buildReplaceStringForSpecificSpecialCharacter(matches, pattern, specialCharacter) {
  const splitPatternAtSpecialCharacter = pattern.split(specialCharacter);
  const splitMatchAtSpecialCharacter = matches[0].split(specialCharacter);
  let replaceString = '';
  splitPatternAtSpecialCharacter.forEach((splitValue, index) => {
    replaceString += buildReplaceStringWithCasePreserved([splitMatchAtSpecialCharacter[index]], splitValue) + specialCharacter;
  });
  return replaceString.slice(0, -1);
}