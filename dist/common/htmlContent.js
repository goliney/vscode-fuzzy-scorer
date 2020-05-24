"use strict";

require("core-js/modules/es.array.map");

require("core-js/modules/es.string.replace");

require("core-js/modules/es.string.split");

require("core-js/modules/es.string.trim");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isEmptyMarkdownString = isEmptyMarkdownString;
exports.isMarkdownString = isMarkdownString;
exports.markedStringsEquals = markedStringsEquals;
exports.removeMarkdownEscapes = removeMarkdownEscapes;
exports.parseHrefAndDimensions = parseHrefAndDimensions;
exports.MarkdownString = void 0;

var _arrays = require("./arrays");

var _codicons = require("./codicons");

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class MarkdownString {
  constructor(_value = '', isTrustedOrOptions = false) {
    this._value = _value;

    if (typeof isTrustedOrOptions === 'boolean') {
      this._isTrusted = isTrustedOrOptions;
      this._supportThemeIcons = false;
    } else {
      var _isTrustedOrOptions$i, _isTrustedOrOptions$s;

      this._isTrusted = (_isTrustedOrOptions$i = isTrustedOrOptions.isTrusted) !== null && _isTrustedOrOptions$i !== void 0 ? _isTrustedOrOptions$i : false;
      this._supportThemeIcons = (_isTrustedOrOptions$s = isTrustedOrOptions.supportThemeIcons) !== null && _isTrustedOrOptions$s !== void 0 ? _isTrustedOrOptions$s : false;
    }
  }

  get value() {
    return this._value;
  }

  get isTrusted() {
    return this._isTrusted;
  }

  get supportThemeIcons() {
    return this._supportThemeIcons;
  }

  appendText(value) {
    // escape markdown syntax tokens: http://daringfireball.net/projects/markdown/syntax#backslash
    this._value += (this._supportThemeIcons ? (0, _codicons.escapeCodicons)(value) : value).replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&').replace('\n', '\n\n');
    return this;
  }

  appendMarkdown(value) {
    this._value += value;
    return this;
  }

  appendCodeblock(langId, code) {
    this._value += '\n```';
    this._value += langId;
    this._value += '\n';
    this._value += code;
    this._value += '\n```\n';
    return this;
  }

}

exports.MarkdownString = MarkdownString;

function isEmptyMarkdownString(oneOrMany) {
  if (isMarkdownString(oneOrMany)) {
    return !oneOrMany.value;
  } else if (Array.isArray(oneOrMany)) {
    return oneOrMany.every(isEmptyMarkdownString);
  } else {
    return true;
  }
}

function isMarkdownString(thing) {
  if (thing instanceof MarkdownString) {
    return true;
  } else if (thing && typeof thing === 'object') {
    return typeof thing.value === 'string' && (typeof thing.isTrusted === 'boolean' || thing.isTrusted === undefined) && (typeof thing.supportThemeIcons === 'boolean' || thing.supportThemeIcons === undefined);
  }

  return false;
}

function markedStringsEquals(a, b) {
  if (!a && !b) {
    return true;
  } else if (!a || !b) {
    return false;
  } else if (Array.isArray(a) && Array.isArray(b)) {
    return (0, _arrays.equals)(a, b, markdownStringEqual);
  } else if (isMarkdownString(a) && isMarkdownString(b)) {
    return markdownStringEqual(a, b);
  } else {
    return false;
  }
}

function markdownStringEqual(a, b) {
  if (a === b) {
    return true;
  } else if (!a || !b) {
    return false;
  } else {
    return a.value === b.value && a.isTrusted === b.isTrusted && a.supportThemeIcons === b.supportThemeIcons;
  }
}

function removeMarkdownEscapes(text) {
  if (!text) {
    return text;
  }

  return text.replace(/\\([\\`*_{}[\]()#+\-.!])/g, '$1');
}

function parseHrefAndDimensions(href) {
  const dimensions = [];
  const splitted = href.split('|').map(s => s.trim());
  href = splitted[0];
  const parameters = splitted[1];

  if (parameters) {
    const heightFromParams = /height=(\d+)/.exec(parameters);
    const widthFromParams = /width=(\d+)/.exec(parameters);
    const height = heightFromParams ? heightFromParams[1] : '';
    const width = widthFromParams ? widthFromParams[1] : '';
    const widthIsFinite = isFinite(parseInt(width));
    const heightIsFinite = isFinite(parseInt(height));

    if (widthIsFinite) {
      dimensions.push(`width="${width}"`);
    }

    if (heightIsFinite) {
      dimensions.push(`height="${height}"`);
    }
  }

  return {
    href,
    dimensions
  };
}