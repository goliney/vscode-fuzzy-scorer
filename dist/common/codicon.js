"use strict";

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.index-of");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.slice");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseCodicons = parseCodicons;
exports.matchesFuzzyCodiconAware = matchesFuzzyCodiconAware;
exports.codiconStartMarker = void 0;

var _filters = require("./filters");

var _strings = require("./strings");

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

const codiconStartMarker = '$(';
exports.codiconStartMarker = codiconStartMarker;

function parseCodicons(text) {
  const firstCodiconIndex = text.indexOf(codiconStartMarker);

  if (firstCodiconIndex === -1) {
    return {
      text
    }; // return early if the word does not include an codicon
  }

  return doParseCodicons(text, firstCodiconIndex);
}

function doParseCodicons(text, firstCodiconIndex) {
  const codiconOffsets = [];
  let textWithoutCodicons = '';

  function appendChars(chars) {
    if (chars) {
      textWithoutCodicons += chars;

      var _iterator = _createForOfIteratorHelper(chars),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          const _ = _step.value;
          codiconOffsets.push(codiconsOffset); // make sure to fill in codicon offsets
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }

  let currentCodiconStart = -1;
  let currentCodiconValue = '';
  let codiconsOffset = 0;
  let char;
  let nextChar;
  let offset = firstCodiconIndex;
  const length = text.length; // Append all characters until the first codicon

  appendChars(text.substr(0, firstCodiconIndex)); // example: $(file-symlink-file) my cool $(other-codicon) entry

  while (offset < length) {
    char = text[offset];
    nextChar = text[offset + 1]; // beginning of codicon: some value $( <--

    if (char === codiconStartMarker[0] && nextChar === codiconStartMarker[1]) {
      currentCodiconStart = offset; // if we had a previous potential codicon value without
      // the closing ')', it was actually not an codicon and
      // so we have to add it to the actual value

      appendChars(currentCodiconValue);
      currentCodiconValue = codiconStartMarker;
      offset++; // jump over '('
    } // end of codicon: some value $(some-codicon) <--
    else if (char === ')' && currentCodiconStart !== -1) {
        const currentCodiconLength = offset - currentCodiconStart + 1; // +1 to include the closing ')'

        codiconsOffset += currentCodiconLength;
        currentCodiconStart = -1;
        currentCodiconValue = '';
      } // within codicon
      else if (currentCodiconStart !== -1) {
          // Make sure this is a real codicon name
          if (/^[a-z0-9\-]$/i.test(char)) {
            currentCodiconValue += char;
          } else {
            // This is not a real codicon, treat it as text
            appendChars(currentCodiconValue);
            currentCodiconStart = -1;
            currentCodiconValue = '';
          }
        } // any value outside of codicons
        else {
            appendChars(char);
          }

    offset++;
  } // if we had a previous potential codicon value without
  // the closing ')', it was actually not an codicon and
  // so we have to add it to the actual value


  appendChars(currentCodiconValue);
  return {
    text: textWithoutCodicons,
    codiconOffsets
  };
}

function matchesFuzzyCodiconAware(query, target, enableSeparateSubstringMatching = false) {
  const text = target.text,
        codiconOffsets = target.codiconOffsets; // Return early if there are no codicon markers in the word to match against

  if (!codiconOffsets || codiconOffsets.length === 0) {
    return (0, _filters.matchesFuzzy)(query, text, enableSeparateSubstringMatching);
  } // Trim the word to match against because it could have leading
  // whitespace now if the word started with an codicon


  const wordToMatchAgainstWithoutCodiconsTrimmed = (0, _strings.ltrim)(text, ' ');
  const leadingWhitespaceOffset = text.length - wordToMatchAgainstWithoutCodiconsTrimmed.length; // match on value without codicons

  const matches = (0, _filters.matchesFuzzy)(query, wordToMatchAgainstWithoutCodiconsTrimmed, enableSeparateSubstringMatching); // Map matches back to offsets with codicons and trimming

  if (matches) {
    var _iterator2 = _createForOfIteratorHelper(matches),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        const match = _step2.value;
        const codiconOffset = codiconOffsets[match.start + leadingWhitespaceOffset]
        /* codicon offsets at index */
        + leadingWhitespaceOffset;
        /* overall leading whitespace offset */

        match.start += codiconOffset;
        match.end += codiconOffset;
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  }

  return matches;
}